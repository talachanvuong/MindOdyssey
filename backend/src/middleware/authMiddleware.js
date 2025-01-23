import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'
import client from '../db/db.js'
import { MESSAGE, STATUS_CODE, sendResponse } from '../utils/constant.js'

const verifyUser = (req, res, next) => {
  const token = req.cookies?.accessToken

  if (!token) {
    return sendResponse(
      res,
      STATUS_CODE.UNAUTHORIZED,
      MESSAGE.AUTH.ACCESS_TOKEN.MISSING
    )
  }

  try {
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
  } catch (error) {
    console.error('Error:', error)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

const verifyEmail = (req, res, next) => {
  const token = req.query.token

  if (!token) {
    return sendResponse(
      res,
      STATUS_CODE.UNAUTHORIZED,
      MESSAGE.AUTH.ACCESS_TOKEN.MISSING
    )
  }

  try {
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
  } catch (error) {
    console.error('Error:', error)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

const postRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.AUTH.REFRESH_TOKEN.MISSING
    )
  }

  try {
    const queryCheckRefreshToken = `
        SELECT 1
        FROM refresh_tokens
        WHERE token = $1
        LIMIT 1;
    `
    const result = await client.query(queryCheckRefreshToken, [refreshToken])
    if (result.rowCount === 0) {
      return sendResponse(
        res,
        STATUS_CODE.BAD_REQUEST,
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
          sameSite: 'strict',
          maxAge: 3600000,
        })
        return sendResponse(
          res,
          STATUS_CODE.SUCCESS,
          MESSAGE.AUTH.REFRESH_TOKEN.SUCCESS
        )
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export default { verifyUser, verifyEmail, postRefreshToken }
