import { Server } from 'socket.io'
import envConfig from '../config/envConfig.js'
import practiceEvent from '../events/practiceEvent.js'
import authMiddleware from '../middleware/authMiddleware.js'

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: envConfig.frontendUrl,
      credentials: true,
    },
  })
  io.use(authMiddleware.authSocket)
  
  io.on('connection', (socket) => {
    practiceEvent(io, socket)
  })
}
