const { default: makeWASocket } = require('@whiskeysockets/baileys');
const { useSingleFileAuthState } = require('@whiskeysockets/baileys/lib/utils/auth-utils');
const qrcode = require('qrcode-terminal');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', ({ connection, qr }) => {
    if (qr) {
      console.log('\n📷 Scan QR berikut ini:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }

    if (connection === 'close') {
      console.log('❌ Koneksi ditutup. Mencoba sambung ulang...');
      startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const teks = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const pengirim = msg.key.remoteJid;

    if (teks.toLowerCase() === 'ping') {
      await sock.sendMessage(pengirim, { text: '🏓 Pong dari bot!' });
    }
  });
}

startBot();








