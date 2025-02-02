import cp from 'cookie-parser'
import cors from 'cors'
import { json } from 'express'
import envConfig from '../config/envConfig.js'
import routesConfig from './routesConfig.js'

export default (app) => {
  app.use(
    cors({
      origin: envConfig.frontendUrl,
      credentials: true,
    })
  )
  app.use(json({ limit: Infinity }))
  app.use(cp())
  app.use('/api', routesConfig)
}
