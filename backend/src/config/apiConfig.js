import cp from 'cookie-parser'
import cors from 'cors'
import { json, urlencoded } from 'express'
import routesConfig from './routesConfig.js'

export default (app) => {
  app.use(cors())
  app.use(json())
  app.use(urlencoded({ extended: true }))
  app.use(cp())
  app.use('/api', routesConfig)
}
