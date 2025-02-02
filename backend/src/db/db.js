import pg from 'pg'
import envConfig from '../config/envConfig.js'

const client = new pg.Pool({
  user: envConfig.dbUser,
  host: envConfig.dbHost,
  database: envConfig.dbName,
  password: envConfig.dbPass,
  port: envConfig.dbPort,
})

export const startTransaction = async () => {
  await client.query('BEGIN')
}

export const commitTransaction = async () => {
  await client.query('COMMIT')
}

export const rollbackTransaction = async () => {
  await client.query('ROLLBACK')
}

export default client
