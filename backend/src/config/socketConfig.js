import { Server } from 'socket.io'
import envConfig from '../config/envConfig.js'
import practiceEvent from '../events/practiceEvent.js'

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: envConfig.frontendUrl,
      credentials: true,
    },
  })
  io.on('connection', (socket) => {
    practiceEvent(io, socket)
  })
}
