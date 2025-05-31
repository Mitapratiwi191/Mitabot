const { default: makeWASocket, useSingleFileAuthState } = require("@adiwajshing/baileys");
const { state, saveState } = useSingleFileAuthState('./session.json');
const fs = require('fs');
const chalk = require('chalk');

const prefix = '.';

const startBot = async () => {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const from = msg.key.remoteJid;

        if (!text || !text.startsWith(prefix)) return;

        const command = text.slice(1).split(' ')[0].toLowerCase();

        if (command === 'menu') {
            await sock.sendMessage(from, { text: 'Hai! Ini Mitabot 👋\n\nPerintah tersedia:\n.menu\n.kick\n.warn\n.premium\n.ai <pertanyaan>\n\nBot aktif ✅' });
        }

        // Load plugin dinamis
        const plugins = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'));
        for (const file of plugins) {
            const plugin = require(`./plugins/${file}`);
            await plugin(sock, msg, text, from);
        }
    });
};

startBot();
