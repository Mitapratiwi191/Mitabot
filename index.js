const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

const authFile = './auth_info.json'; // file simpan sesi login

// ambil state dan fungsi simpan state
const { state, saveState } = useSingleFileAuthState(authFile);

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // kita pakai qrcode-terminal manual
  });

  // saat sesi berubah, simpan
  sock.ev.on('creds.update', saveState);

  // koneksi update event
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📷 Scan QR Code ini dengan WhatsApp kamu:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('🔴 Terlogout. Hapus file auth_info.json untuk login ulang.');
      } else {
        console.log('⚠️ Koneksi terputus, mencoba sambung ulang...');
        startBot();
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot sudah terhubung ke WhatsApp!');
    }
  });

  // Contoh balasan pesan sederhana
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text?.toLowerCase() === 'ping') {
      await sock.sendMessage(sender, { text: '🏓 Pong!' });
    }
  });
}

startBot();






