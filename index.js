
const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('🔗 Scan QR di atas dengan WhatsApp');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi terputus', shouldReconnect ? ', mencoba reconnect...' : ', session logout.');
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || messages.length === 0) return;
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (!from || !text) return;

    // Contoh simple balas chat "halo"
    if (text.toLowerCase() === 'halo') {
      await sock.sendMessage(from, { text: 'Halo juga!' });
    }
  });
}

startBot();
