const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    browser: ['Ubuntu', 'Chrome', '22.04.4']
  });

  sock.ev.on('creds.update', saveCreds);

  // Tampilkan QR
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
  // console.clear();  // comment atau hapus ini supaya QR tidak hilang
  console.log('📲 Scan QR berikut ini untuk login:\n');
  qrcode.generate(qr, { small: true });
}

    if (connection === 'open') {
      console.log('✅ Bot berhasil login!');
    } else if (connection === 'close') {
      console.log('❌ Koneksi terputus.');
    }
  });

  // Pesan masuk
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg || !msg.message) return;
    const sender = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe;
    if (isFromMe) return;

    const getContent = (msg) => {
      const m = msg.message;
      if (!m) return '';
      if (m.conversation) return m.conversation;
      if (m.extendedTextMessage) return m.extendedTextMessage.text;
      if (m.imageMessage?.caption) return m.imageMessage.caption;
      if (m.videoMessage?.caption) return m.videoMessage.caption;
      return '';
    };

    const text = getContent(msg).toLowerCase();
    console.log(`📩 Dari: ${sender}`);
    console.log(`💬 Pesan: ${text}`);

    // Keyword-based replies
    const keywords = {
      "halo": ["Hai juga!", "Halo! 👋", "Yo halo! Ada yang bisa dibantu?"],
      "pagi": ["Selamat pagi! ☀️", "Pagi juga! Semangat ya!", "Semoga harimu menyenangkan!"],
      "siang": ["Selamat siang! 🌞", "Siang juga, jangan lupa makan~", "Siang semangat terus ya!"],
      "sore": ["Selamat sore! 🌅", "Sore juga~", "Waktunya santai sore 😌"],
      "malam": ["Selamat malam 🌙", "Malam juga, selamat istirahat ya!", "Malam indah ya~"]
    };

    for (let key in keywords) {
      if (text.includes(key)) {
        const replyList = keywords[key];
        const reply = replyList[Math.floor(Math.random() * replyList.length)];
        await sock.sendMessage(sender, { text: reply }, { quoted: msg });
        return;
      }
    }

    // Balasan random kalau bukan keyword di atas
    const replies = [
      "Aku dengerin kok 😇",
      "Hmm? Cerita dong~",
      "Semangat ya kamu hari ini! 💪",
      "Aku bot, tapi bisa nemenin kamu loh 🤖💖",
      "Kalau butuh teman curhat, aku ada kok.",
      "Aku siap nemenin kamu kapan aja 🌙"
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    await sock.sendMessage(sender, { text: randomReply }, { quoted: msg });
  });

  await new Promise(() => {});
}

startBot();
