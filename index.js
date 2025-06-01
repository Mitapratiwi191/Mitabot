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
    if (!msg.message || msg.key.fromMe) return;

    const getContent = (msg) => {
      const m = msg.message;
      if (!m) return '';
      if (m.conversation) return m.conversation;
      if (m.extendedTextMessage) return m.extendedTextMessage.text;
      if (m.imageMessage && m.imageMessage.caption) return m.imageMessage.caption;
      if (m.videoMessage && m.videoMessage.caption) return m.videoMessage.caption;
      return '';
    };

    const text = getContent(msg).toLowerCase();
    console.log('Pesan diterima:', text);

    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return; // hanya grup

    if (text.includes('halo')) {
      await sock.sendMessage(jid, { text: 'Halo sayang 🖤 gimana kabarnya hari ini?' }, { quoted: msg });
    } else if (text.includes('pagi')) {
      await sock.sendMessage(jid, { text: 'Selamat pagi sayang 🌤️ semoga harimu indah!' }, { quoted: msg });
    } else if (text.includes('siang')) {
      await sock.sendMessage(jid, { text: 'Selamat siang 🌞 jangan lupa makan ya!' }, { quoted: msg });
    } else if (text.includes('sore')) {
      await sock.sendMessage(jid, { text: 'Selamat sore 🌇 semangat terus ya!' }, { quoted: msg });
    } else if (text.includes('malam')) {
      await sock.sendMessage(jid, { text: 'Selamat malam 🌙 mimpi indah ya sayang.' }, { quoted: msg });
    } else if (text.includes('assalamualaikum') || text.includes('salam')) {
      await sock.sendMessage(jid, { text: 'Waalaikumsalam, semoga damai dan bahagia selalu menyertaimu 🤍' }, { quoted: msg });
    } else if (text.includes('capek')) {
      await sock.sendMessage(jid, { text: 'Istirahat dulu ya sayang... jangan dipaksa, kamu juga butuh tenang 🫂' }, { quoted: msg });
    } else if (text.includes('sedih')) {
      await sock.sendMessage(jid, { text: 'Aku di sini kok... walau cuma bot, tapi siap nemenin kamu 😔💙' }, { quoted: msg });
    }
  });
}

startBot();
