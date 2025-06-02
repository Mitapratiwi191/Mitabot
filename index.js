import makeWASocket, { useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function startSock() {
  const { version } = await fetchLatestBaileysVersion()
  console.log('Using WA version', version)

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    version
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      if((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startSock()
      } else {
        console.log('Connection closed. You are logged out.')
      }
    }
    console.log('connection update', update)
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('New message:', messages[0]?.message)
  })
}

startSock()













