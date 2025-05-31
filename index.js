
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const { ownerNumber, botNumber } = require('./config');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';

    // Load semua plugin
    const pluginPath = path.join(__dirname, 'plugins');
    const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

    for (const file of pluginFiles) {
      try {
        const plugin = require(`./plugins/${file}`);
        if (typeof plugin === 'function') {
          await plugin(sock, msg, text, from);
        }
      } catch (err) {
        console.error(`Plugin error (${file}):`, err);
      }
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot(); // Reconnect otomatis
      } else {
        console.log('Bot logged out');
      }
    }
  });

  console.log('🤖 Mitabot aktif dan siap digunakan!');
}

startBot();
