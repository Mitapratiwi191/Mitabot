
import makeWASocket, { useSingleFileAuthState } from "@whiskeysockets/baileys";
import * as qrcode from "qrcode-terminal";

async function startBot() {
  // Load atau buat file auth_info.json untuk simpan sesi
  const { state, saveState } = useSingleFileAuthState('./auth_info.json');

  const sock = makeWASocket({
    auth: state
  });

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

  // Simpan sesi saat terjadi perubahan
  sock.ev.on('creds.update', saveState);
}

startBot();
