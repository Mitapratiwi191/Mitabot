
const makeWASocket = require("baileys").default;
const { useSingleFileAuthState } = require("baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveState } = useSingleFileAuthState("./auth_info.json");

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("connection.update", (update) => {
    console.log("Update connection event:", update);

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📲 Scan QR berikut ini untuk login:\n");
      qrcode.generate(qr, { small: true });
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

  sock.ev.on("creds.update", saveState);
}

startBot();
