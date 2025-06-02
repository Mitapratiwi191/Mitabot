const makeWASocket = require("@whiskeysockets/baileys").default;
const { useSingleFileAuthState } = require("@whiskeysockets/baileys/auth");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveState } = useSingleFileAuthState("./auth_info.json");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("📲 Scan QR ini untuk login:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot berhasil terhubung!");
    } else if (connection === "close") {
      console.log("❌ Koneksi terputus.");
      if (lastDisconnect?.error) {
        console.error("Alasan:", lastDisconnect.error.message);
      }
    }
  });

  sock.ev.on("creds.update", saveState);
}

startBot();




