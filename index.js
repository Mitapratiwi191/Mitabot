
import makeWASocket, { useSingleFileAuthState } from "@whiskeysockets/baileys";
import * as qrcode from "qrcode-terminal";

async function startBot() {
  // Load sesi dari file auth_info.json atau buat baru
  const { state, saveState } = useSingleFileAuthState("./auth_info.json");

  // Buat socket WA dengan auth state
  const sock = makeWASocket({
    auth: state,
  });

  // Event connection.update
  sock.ev.on("connection.update", (update) => {
    console.log("Update connection event:", update); // Debug print lengkap

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📲 Scan QR berikut ini untuk login:\n");
      qrcode.generate(qr, { small: true }); // cetak QR di terminal
    }

    if (connection === "open") {
      console.log("✅ Bot sudah berhasil login!");
    } else if (connection === "close") {
      console.log("❌ Koneksi terputus!");
      if (lastDisconnect?.error) {
        console.log("Error:", lastDisconnect.error);
      }
    }
  });

  // Simpan sesi setiap kali terjadi update kredensial
  sock.ev.on("creds.update", saveState);
}

startBot();
