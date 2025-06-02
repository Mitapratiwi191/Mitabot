import makeWASocket from "@whiskeysockets/baileys";
import * as qrcode from "qrcode-terminal";

async function startBot() {
  const sock = makeWASocket();

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 Scan QR berikut ini untuk login:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot sudah berhasil login!');
    } else if (connection === 'close') {
      console.log('❌ Koneksi terputus!');
      if (lastDisconnect?.error) {
        console.log('Error:', lastDisconnect.error);
      }
    }
  });

  sock.ev.on('creds.update', () => {
    // otomatis simpan session
  });
}

startBot();
