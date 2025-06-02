const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// File tempat nyimpen session
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // Simpan session setiap update
  sock.ev.on('creds.update', saveState);

  // Cek status koneksi
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📷 Scan QR ini pakai WhatsApp kamu:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil tersambung ke WhatsApp!');
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(`❌ Koneksi ditutup. Alasan: ${reason || 'tidak diketahui'}`);
      startBot(); // otomatis reconnect
    }
  });
}

startBot();








