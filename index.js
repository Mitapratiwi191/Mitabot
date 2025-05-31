
// Mitabot-TermuxLite: Bot WhatsApp sederhana berbasis baileys

const {
    default: makeWASocket,
    useSingleFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require("fs");
const path = require("path");

// Setup penyimpanan session
const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Mitabot', 'Chrome', '121.0.0.0']
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Koneksi terputus. Reconnect:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("Bot berhasil terhubung ke WhatsApp");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        console.log(`Pesan dari ${from}: ${text}`);

        if (text.toLowerCase() === "halo") {
            await sock.sendMessage(from, { text: "Halo juga! Aku Mitabot 🤖 Siap membantu." });
        } else if (text.toLowerCase().includes("menu")) {
            await sock.sendMessage(from, { text: "Berikut menu Mitabot:\n1. Halo\n2. Menu\n3. Bantuan" });
        }
    });
}

startBot();
