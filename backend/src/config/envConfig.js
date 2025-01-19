import 'dotenv/config'

export default {
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPass: process.env.DB_PASS,
  dbPort: process.env.DB_PORT,
  serverPort: process.env.SERVER_PORT,
  accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
  refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
  mailerEmail: process.env.MAILER_EMAIL,
  mailerPass: process.env.MAILER_PASS,
  frontendUrl: process.env.FRONTEND_URL,
  forgetPassPath: process.env.FORGET_PASS_PATH,
  registerPath: process.env.REGISTER_PATH,
}
