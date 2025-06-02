const baileys = require('@adiwajshing/baileys');
const { default: makeWASocket, useSingleFileAuthState } = baileys;
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
    const sock = makeWASocket({
        auth: state
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
        console.log(update);
        if (update.connection === 'close') {
            console.log('Connection closed, reconnecting...');
            startBot();
        }
    });

    sock.ev.on('messages.upsert', ({ messages }) => {
        console.log('New message:', messages);
    });
}

startBot();












