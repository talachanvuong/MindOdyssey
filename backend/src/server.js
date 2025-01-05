import express from 'express'
import { createServer } from 'http'
import apiConfig from './config/apiConfig.js'
import envConfig from './config/envConfig.js'
import socketConfig from './config/socketConfig.js'

// Create api
const app = express()
apiConfig(app)

// Create socket
const server = createServer(app)
socketConfig(server)

server.listen(envConfig.serverPort)
