const makeWASocket = require('@adiwajshing/baileys').default
const { useSingleFileAuthState } = require('@adiwajshing/baileys')
const pino = require('pino')

const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function startBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      if ((lastDisconnect.error)?.output?.statusCode !== 401) {
        console.log('Koneksi terputus, mencoba reconnect...')
        startBot()
      } else {
        console.log('Kamu sudah logout dari WhatsApp, silakan hapus auth_info.json dan login ulang.')
      }
    }
    console.log('Update koneksi:', update)
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('Pesan baru:', messages[0].message)
  })
}

startBot()














