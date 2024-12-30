import { json } from 'express'
import cors from 'cors'

export default (app) => {
  app.use(cors())
  app.use(json())
}
