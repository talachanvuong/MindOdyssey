import 'dotenv/config'

export default {
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPass: process.env.DB_PASS,
  dbPort: process.env.DB_PORT,
  serverPort: process.env.SERVER_PORT,
}
