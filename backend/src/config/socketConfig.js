import { Server } from 'socket.io'
import envConfig from '../config/envConfig.js'
import practiceEvent from '../events/practiceEvent.js'
import adminEvent from '../events/adminEvent.js'

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: envConfig.frontendUrl,
      credentials: true,
    },
  })
  io.on('connection', (socket) => {
    practiceEvent(io, socket)
    adminEvent(io, socket)
  })
}
