import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'

const signAccessToken = (payload) => {
  return jwt.sign(payload, envConfig.accessTokenSecretKey, {
    expiresIn: '1h',
  })
}

const signRefreshToken = (payload) => {
  return jwt.sign(payload, envConfig.refreshTokenSecretKey, {
    expiresIn: '365d',
  })
}

export default {
  signAccessToken,
  signRefreshToken,
}
