const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Gunakan file auth untuk menyimpan sesi login
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Fungsi utama
async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // Simpan sesi saat ada perubahan
  sock.ev.on('creds.update', saveState);

  // Tampilkan log koneksi
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📷 Scan QR Code dengan cepat!\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi terputus. Coba sambung ulang...', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }
  });

  // Balasan otomatis sederhana
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const teks = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (teks?.toLowerCase() === 'ping') {
      await sock.sendMessage(sender, { text: '🏓 Pong!' });
    }
  });
}

// Jalankan bot
startBot();





