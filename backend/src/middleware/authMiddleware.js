import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'
import { MESSAGE, STATUS_CODE, sendResponse } from '../utils/constant.js'
import userService from '../services/userService.js'
import userSchema from '../schemas/userSchema.js'
import cookie from 'cookie'
const verifyUser = (req, res, next) => {
  const token = req.cookies?.accessToken

  const { error } = userSchema.accessTokenValidate.validate(token)
  if (error) {
    return sendResponse(res, STATUS_CODE.UNAUTHORIZED, error.details[0].message)
  }

  jwt.verify(token, envConfig.accessTokenSecretKey, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return sendResponse(
          res,
          STATUS_CODE.UNAUTHORIZED,
          MESSAGE.AUTH.ACCESS_TOKEN.EXPIRED
        )
      }

      if (error.name === 'JsonWebTokenError') {
        return sendResponse(
          res,
          STATUS_CODE.UNAUTHORIZED,
          MESSAGE.AUTH.ACCESS_TOKEN.INVALID
        )
      }
    }

    req.user = decoded
    next()
  })
}

const verifyEmail = (req, res, next) => {
  const token = req.query.token
  const { error } = userSchema.accessTokenValidate.validate(token)
  if (error) {
    return sendResponse(res, STATUS_CODE.UNAUTHORIZED, error.details[0].message)
  }

  jwt.verify(token, envConfig.accessTokenSecretKey, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return sendResponse(
          res,
          STATUS_CODE.UNAUTHORIZED,
          MESSAGE.AUTH.ACCESS_TOKEN.EXPIRED
        )
      }

      if (error.name === 'JsonWebTokenError') {
        return sendResponse(
          res,
          STATUS_CODE.UNAUTHORIZED,
          MESSAGE.AUTH.ACCESS_TOKEN.INVALID
        )
      }
    }

    req.user = decoded
    req.token = token
    next()
  })
}

const postRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  const { error } = userSchema.refreshTokenValidate.validate(refreshToken)
  if (error) {
    return sendResponse(res, STATUS_CODE.UNAUTHORIZED, error.details[0].message)
  }

  const isRefreshTokenExist = await userService.isRefreshTokenExist(
    refreshToken
  )
  if (!isRefreshTokenExist) {
    return sendResponse(
      res,
      STATUS_CODE.UNAUTHORIZED,
      MESSAGE.AUTH.REFRESH_TOKEN.NOT_FOUND
    )
  }

  jwt.verify(
    refreshToken,
    envConfig.refreshTokenSecretKey,
    (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return sendResponse(
            res,
            STATUS_CODE.UNAUTHORIZED,
            MESSAGE.AUTH.REFRESH_TOKEN.EXPIRED
          )
        }
        if (error.name === 'JsonWebTokenError') {
          return sendResponse(
            res,
            STATUS_CODE.UNAUTHORIZED,
            MESSAGE.AUTH.REFRESH_TOKEN.INVALID
          )
        }
      }

      const newAccessToken = jwt.sign(
        { email: decoded.email, user_id: decoded.user_id },
        envConfig.accessTokenSecretKey,
        { expiresIn: '1h' }
      )

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'Strict',
        maxAge: 3600000,
      })
      return sendResponse(
        res,
        STATUS_CODE.SUCCESS,
        MESSAGE.AUTH.REFRESH_TOKEN.SUCCESS
      )
    }
  )
}

const authSocket = (socket, next) => {
  try {
    if (!socket.request.headers.cookie) {
      console.log('Not found cookie')
      return socket.emit('error', MESSAGE.AUTH.ACCESS_TOKEN.NOT_FOUND)
    }
    const cookies = cookie.parse(socket.request.headers.cookie)
    const token = cookies.accessToken

    const { error } = userSchema.accessTokenValidate.validate(token)
    if (error) {
      return socket.emit('error', error.details[0].message)
    }

    jwt.verify(token, envConfig.accessTokenSecretKey, (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return socket.emit('error', MESSAGE.AUTH.ACCESS_TOKEN.EXPIRED)
        }

        if (error.name === 'JsonWebTokenError') {
          return socket.emit('error', MESSAGE.AUTH.ACCESS_TOKEN.INVALID)
        }
      }

      socket.user = decoded
      next()
    })
  } catch (error) {
    console.error(error)
    socket.emit('error', MESSAGE.SERVER.ERROR)
  }
}

export default { verifyUser, verifyEmail, postRefreshToken, authSocket }
