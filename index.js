
// index.js
const baileys = require("@whiskeysockets/baileys");
const { useSingleFileAuthState } = require("@whiskeysockets/baileys/lib/Auth");
const makeWASocket = baileys.default;
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveState } = useSingleFileAuthState("./auth_info.json");

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("Scan QR ini untuk login:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot berhasil terhubung!");
    } else if (connection === "close") {
      console.log("❌ Koneksi terputus.");
      if (lastDisconnect?.error) {
        console.log("Alasan:", lastDisconnect.error);
      }
    }
  });

  sock.ev.on("creds.update", saveState);
}

startBot();

