import cp from 'cookie-parser'
import cors from 'cors'
import { json, urlencoded } from 'express'
import envConfig from '../config/envConfig.js'
import routesConfig from './routesConfig.js'

export default (app) => {
  app.use(
    cors({
      origin: envConfig.frontendUrl,
      credentials: true,
    })
  )
  app.use(json())
  app.use(urlencoded({ extended: true }))
  app.use(cp())
  app.use('/api', routesConfig)
}
