import pg from 'pg'
import envConfig from '../config/envConfig.js'

const client = new pg.Client({
  user: envConfig.dbUser,
  host: envConfig.dbHost,
  database: envConfig.dbName,
  password: envConfig.dbPass,
  port: envConfig.dbPort,
})

await client.connect().catch((err) => console.error(err))

export default client
