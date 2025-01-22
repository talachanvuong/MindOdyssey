import { Server } from 'socket.io'
import envConfig from '../config/envConfig.js'
export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: envConfig.frontendUrl,
      credentials: true
    },
  })
}
