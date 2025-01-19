import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'
import client from '../db/db.js'

const verifyUser = (req, res, next) => {
  const token = req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ message: 'Token missing!' })
  }

  try {
    jwt.verify(token, envConfig.accessTokenSecretKey, (error, decoded) => {
      if (error) {
        return res.status(400).json({ message: 'Invalid token!' })
      }

      req.user = decoded
      next()
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

const verifyEmail = (req, res, next) => {
  const token = req.query.token

  if (!token) {
    return res.status(401).json({ message: 'Token missing!' })
  }

  try {
    jwt.verify(token, envConfig.accessTokenSecretKey, (error, decoded) => {
      if (error) {
        return res.status(400).json({ message: 'Invalid token!' })
      }

      req.user = decoded
      req.token = token
      next()
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

const postRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required!' })
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
      return res.status(400).json({ message: 'Invalid token!' })
    }

    jwt.verify(
      refreshToken,
      envConfig.refreshTokenSecretKey,
      (error, decoded) => {
        if (error) {
          return res
            .status(400)
            .json({ message: 'Invalid or expired refresh token!' })
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
        res.status(200).json({ message: 'Refresh token successfully!' })
      }
    )
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

export default { verifyUser, verifyEmail, postRefreshToken }
