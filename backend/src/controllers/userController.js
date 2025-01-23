import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nm from 'nodemailer'
import envConfig from '../config/envConfig.js'
import client from '../db/db.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'
import {
  displayNameValidate,
  emailValidate,
  passwordValidate,
  requiredValidate,
} from '../utils/validate.js'

// Check user exist or not
const isUserExist = async (email) => {
  try {
    const query = `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
    `
    const result = await client.query(query, [email])
    return result.rowCount > 0
  } catch {
    throw new Error('Database error!')
  }
}

// Send email to verify
const sendEmail = async (email, subject, text, html) => {
  const transporter = nm.createTransport({
    service: 'gmail',
    auth: {
      user: envConfig.mailerEmail,
      pass: envConfig.mailerPass,
    },
  })

  // Config email
  const mailOptions = {
    from: envConfig.mailerEmail,
    to: email,
    subject: subject,
    text: text,
    html: html,
  }

  // Send email
  try {
    await transporter.sendMail(mailOptions)
  } catch {
    throw new Error('Send email error!')
  }
}

// Login user and send token
export const login = async (req, res) => {
  const { email, password } = req.body

  // Check validation
  const requiredError = requiredValidate([email, password])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, emailError)
  }

  const passwordError = passwordValidate(password)
  if (passwordError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, passwordError)
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (!userExist) {
      return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.USER.NOT_FOUND)
    }

    const query = `
      SELECT password, user_id
      FROM users
      WHERE email = $1;
    `
    const result = await client.query(query, [email])
    const user_id = result.rows[0].user_id
    const hashedPassword = result.rows[0].password

    // Check correct password
    const isMatchedPassword = await bcrypt.compare(password, hashedPassword)
    if (!isMatchedPassword) {
      return sendResponse(
        res,
        STATUS_CODE.BAD_REQUEST,
        MESSAGE.USER.WRONG_PASSWORD
      )
    }

    // Create token
    const accessToken = jwt.sign(
      { email: email, user_id: user_id },
      envConfig.accessTokenSecretKey,
      { expiresIn: '1h' }
    )
    const refreshToken = jwt.sign(
      { email: email, user_id: user_id },
      envConfig.refreshTokenSecretKey,
      { expiresIn: '365d' }
    )

    // Save refresh token
    const queryRefreshToken = `
      INSERT INTO refresh_tokens(token, user_id)
      VALUES($1, $2);
    `
    await client.query(queryRefreshToken, [refreshToken, user_id])

    // Send token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
      maxAge: 3600000,
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
      maxAge: 31556952000,
    })
    return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.LOGIN_SUCCESS)
  } catch (error) {
    console.error('Error login:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export const verifyEmail = async (req, res) => {
  const { email } = req.body

  // Check validation
  const requiredError = requiredValidate([email])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, emailError)
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (userExist) {
      return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.USER.EXISTED)
    }

    const registerToken = jwt.sign(
      { email: email },
      envConfig.accessTokenSecretKey,
      { expiresIn: '5m' }
    )
    const linkRegister = `${req.protocol}://${req.get(
      'host'
    )}/api/user/verifyemail?token=${registerToken}`

    const subject = 'Xác thực đăng ký MindOdysey'
    const text = 'Xác thực đăng ký MindOdysey link chỉ có hiệu lực trong 5 phút'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">Welcome to MindOdysey!</h1>
        <p style="margin: 20px 0; line-height: 1.6; color: #333;">Hi,</p>
        <p style="margin: 20px 0; line-height: 1.6; color: #333;">Cảm ơn vì đã chọn chúng tôi. Vui lòng click vào nút ở dưới để hoàn thành quá trình đăng ký:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${linkRegister}" target="_blank" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Hoàn thành đăng ký </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">Vui lòng không phản hồi email này.</p>
        <p style="text-align: center; font-size: 12px; color: #888;">&copy; 2025 MindOdysey. All rights reserved.</p>
      </div>
    `
    await sendEmail(email, subject, text, html)
    return sendResponse(
      res,
      STATUS_CODE.SUCCESS,
      MESSAGE.USER.SEND_EMAIL_SUCCESS
    )
  } catch (error) {
    console.error('Error verifyEmail:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export const register = async (req, res) => {
  const { email } = req.user
  const { display_name, password, confirmPassword } = req.body

  // Check validation
  const requiredError = requiredValidate([
    display_name,
    password,
    confirmPassword,
  ])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const displayNameError = displayNameValidate(display_name)
  if (displayNameError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, displayNameError)
  }

  const passwordError = passwordValidate(password)
  if (passwordError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, passwordError)
  }

  if (password !== confirmPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.PASSWORD_NOT_MATCH
    )
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = `
      INSERT INTO users (email, password, display_name)
      VALUES ($1, $2, $3);
    `
    await client.query(query, [email, hashedPassword, display_name])
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
    })
    return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.USER.REGISTER_SUCCESS)
  } catch (error) {
    console.error('Error register:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

// Get information
export const getInfo = async (req, res) => {
  const { user_id } = req.user

  try {
    const query = `
      SELECT email, display_name
      FROM users
      WHERE user_id = $1;
    `
    const result = await client.query(query, [user_id])
    return sendResponse(
      res,
      STATUS_CODE.SUCCESS,
      MESSAGE.USER.GET_INFO_SUCCESS,
      result.rows[0]
    )
  } catch (error) {
    console.error('Error getInfo:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

// Update user
export const update = async (req, res) => {
  const { user_id } = req.user
  const { new_display_name } = req.body

  // Check validation
  const requiredError = requiredValidate([new_display_name])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const newDisplayNameError = displayNameValidate(new_display_name)
  if (newDisplayNameError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, newDisplayNameError)
  }

  try {
    const query = `
      SELECT display_name
      FROM users
      WHERE user_id = $1;
    `
    const result = await client.query(query, [user_id])
    if (result.rows[0].display_name === new_display_name) {
      return sendResponse(
        res,
        STATUS_CODE.BAD_REQUEST,
        MESSAGE.USER.SAME_DISPLAY_NAME
      )
    }

    const queryUpdate = `
      UPDATE users
      SET display_name = $1
      WHERE user_id = $2;
    `
    await client.query(queryUpdate, [new_display_name, user_id])
    return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.UPDATE_SUCCESS)
  } catch (error) {
    console.error('Error update:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

// Forget password
export const forgetPassword = async (req, res) => {
  const { email } = req.body

  // Check validation
  const requiredError = requiredValidate([email])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, emailError)
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (!userExist) {
      return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.USER.NOT_FOUND)
    }

    // Create token and send email
    const resetpasswordToken = jwt.sign(
      { email: email },
      envConfig.accessTokenSecretKey,
      { expiresIn: '5m' }
    )
    const linkForgetPass = `${req.protocol}://${req.get(
      'host'
    )}/api/user/forgetpassword?token=${resetpasswordToken}`

    const subject = 'Xác thực đổi mật khẩu MindOdysey'
    const text = 'Xác thực đăng ký MindOdysey link chỉ có hiệu lực trong 5 phút'
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <h1 style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">Khôi phục mật khẩu MindOdysey</h1>
      <p style="margin: 20px 0; line-height: 1.6; color: #333;">Xin chào,</p>
      <p style="margin: 20px 0; line-height: 1.6; color: #333;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ bạn. Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${linkForgetPass}" target="_blank" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Đặt lại mật khẩu</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      <p style="text-align: center; font-size: 12px; color: #888;">&copy; 2025 MindOdysey. All rights reserved.</p>
    </div>`
    await sendEmail(email, subject, text, html)
    return sendResponse(
      res,
      STATUS_CODE.SUCCESS,
      MESSAGE.USER.SEND_EMAIL_SUCCESS
    )
  } catch (error) {
    console.error('Error forgetPassword:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export const resetPassword = async (req, res) => {
  const { email } = req.user
  const { newPassword, confirmNewPassword } = req.body

  // Check validation
  const requiredError = requiredValidate([newPassword, confirmNewPassword])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const newPasswordError = passwordValidate(newPassword)
  if (newPasswordError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, newPasswordError)
  }

  if (newPassword !== confirmNewPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.PASSWORD_NOT_MATCH
    )
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const query = `
      UPDATE users
      SET password = $2
      WHERE email = $1;
    `
    await client.query(query, [email, hashedPassword])
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
    })
    return sendResponse(
      res,
      STATUS_CODE.SUCCESS,
      MESSAGE.USER.RESET_PASSWORD_SUCCESS
    )
  } catch (error) {
    console.error('Error resetPassword:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export const changePassword = async (req, res) => {
  const { user_id } = req.user
  const { oldPassword, newPassword, confirmNewPassword } = req.body

  // Check validation
  const requiredError = requiredValidate([
    oldPassword,
    newPassword,
    confirmNewPassword,
  ])
  if (requiredError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, requiredError)
  }

  const oldPasswordError = passwordValidate(oldPassword)
  if (oldPasswordError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, oldPasswordError)
  }

  const newPasswordError = passwordValidate(newPassword)
  if (newPasswordError) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, newPasswordError)
  }

  if (newPassword === oldPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.SAME_PASSWORD
    )
  }

  if (newPassword !== confirmNewPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.PASSWORD_NOT_MATCH
    )
  }

  try {
    const query = `
      SELECT password
      FROM users
      WHERE user_id = $1;
    `
    const result = await client.query(query, [user_id])
    const hashedPassword = result.rows[0].password
    const isMatchedPassword = await bcrypt.compare(oldPassword, hashedPassword)
    if (!isMatchedPassword) {
      return sendResponse(
        res,
        STATUS_CODE.BAD_REQUEST,
        MESSAGE.USER.WRONG_PASSWORD
      )
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    const queryUpdate = `
      UPDATE users 
      SET password = $2
      WHERE user_id = $1;
    `
    await client.query(queryUpdate, [user_id, hashedNewPassword])
    return sendResponse(
      res,
      STATUS_CODE.SUCCESS,
      MESSAGE.USER.CHANGE_PASSWORD_SUCCESS
    )
  } catch (error) {
    console.error('Error changePassword:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

// Logout
export const logout = async (req, res) => {
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

    const queryDeleteRefreshToken = `
      DELETE FROM refresh_tokens
      WHERE token = $1;
    `
    await client.query(queryDeleteRefreshToken, [refreshToken])
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
    })
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'strict',
    })
    return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.LOGOUT_SUCCESS)
  } catch (error) {
    console.error('Error logout:', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

export const setCookieRegister = (req, res) => {
  const token = req.token

  if (!token) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.AUTH.ACCESS_TOKEN.MISSING
    )
  }

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'strict',
    maxAge: 300000,
  })

  return res.redirect(`${envConfig.frontendUrl}${envConfig.registerPath}`)
}

export const setCookieForgetPass = (req, res) => {
  const token = req.token

  if (!token) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.AUTH.ACCESS_TOKEN.MISSING
    )
  }

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'strict',
    maxAge: 300000,
  })

  return res.redirect(`${envConfig.frontendUrl}${envConfig.forgetPassPath}`)
}
