const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

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

    const sendRandomReply = async (responses) => {
      const random = responses[Math.floor(Math.random() * responses.length)];
      await sock.sendMessage(sender, { text: random }, { quoted: msg });
    };

    try {
      if (text.includes('halo')) {
        await sendRandomReply([
          'Halo sayang 🖤 gimana kabarnya hari ini?',
          'Hai kamu~ 🌸 ada yang bisa aku bantu?',
          'Halo! Semangat terus ya hari ini!'
        ]);
      } else if (text.includes('pagi')) {
        await sendRandomReply([
          'Selamat pagi sayang 🌤️ semoga harimu indah!',
          'Pagi! Jangan lupa sarapan ya 💛',
          'Met pagi! Awali hari dengan senyuman 😊'
        ]);
      } else if (text.includes('siang')) {
        await sendRandomReply([
          'Selamat siang 🌞 jangan lupa makan ya!',
          'Siang gini enaknya ngopi bareng kamu ☕️',
          'Udah makan siang belum? Jangan sampe kelaparan ya 🍽️'
        ]);
      } else if (text.includes('sore')) {
        await sendRandomReply([
          'Selamat sore 🌇 semangat terus ya!',
          'Sore-sore gini enaknya santai bareng kamu 😌',
          'Sore ceria untuk kamu yang luar biasa 🍃'
        ]);
      } else if (text.includes('malam')) {
        await sendRandomReply([
          'Selamat malam 🌙 mimpi indah ya sayang.',
          'Met bobo yaa 💤 jangan lupa berdoa dulu~',
          'Malam ini tenang... kayak hati aku kalo deket kamu ✨'
        ]);
      } else if (text.includes('assalamualaikum') || text.includes('salam')) {
        await sendRandomReply([
          'Waalaikumsalam, semoga damai dan bahagia selalu menyertaimu 🤍',
          'Waalaikumsalam wr wb 🌿 semoga harimu penuh berkah',
          'Salam kembali, semoga sehat dan sukses selalu!'
        ]);
      } else if (text.includes('capek')) {
        await sendRandomReply([
          'Istirahat dulu ya sayang... jangan dipaksa 🫂',
          'Capek itu wajar... kamu hebat kok sudah sejauh ini 💪',
          'Kalau capek, jangan lupa peluk bot ini 🤗'
        ]);
      } else if (text.includes('sedih')) {
        await sendRandomReply([
          'Aku di sini kok... walau cuma bot, tapi siap nemenin kamu 😔💙',
          'Sedih itu bagian dari hidup... tapi kamu nggak sendiri 🤝',
          'Mau cerita? Aku dengerin, ya 💌'
        ]);
      }
    } catch (err) {
      console.error('⚠️ Gagal kirim pesan:', err);
    }
  });

  await new Promise(() => {}); // agar bot tetap hidup
}

startBot();
