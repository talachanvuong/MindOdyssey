import pg from 'pg'
import envConfig from '../config/envConfig.js'

const client = new pg.Pool({
  user: envConfig.dbUser,
  host: envConfig.dbHost,
  database: envConfig.dbName,
  password: envConfig.dbPass,
  port: envConfig.dbPort,
})

export default client
