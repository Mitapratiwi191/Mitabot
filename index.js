
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (!from || !text) return;

    // Load plugin folder
    const pluginFolder = path.join(__dirname, 'plugins');
    const files = fs.readdirSync(pluginFolder);

    for (const file of files) {
      const plugin = require(path.join(pluginFolder, file));
      if (typeof plugin === 'function') {
        try {
          await plugin(sock, msg, text, from);
        } catch (e) {
          console.error(`[PLUGIN ERROR] ${file}:`, e.message);
        }
      }
    }
  });
}

startBot();
