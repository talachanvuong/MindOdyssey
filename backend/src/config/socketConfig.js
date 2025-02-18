import { Server } from 'socket.io'
import envConfig from '../config/envConfig.js'
import practiceSocket from '../socket/practiceSocket.js'
export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: envConfig.frontendUrl,
      credentials: true,
    },
  })
  practiceSocket.callSocket(io)
}

