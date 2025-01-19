import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nm from 'nodemailer'
import envConfig from '../config/envConfig.js'
import client from '../db/db.js'
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
    return res.status(400).json({ message: requiredError })
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return res.status(400).json({ message: emailError })
  }

  const passwordError = passwordValidate(password)
  if (passwordError) {
    return res.status(400).json({ message: passwordError })
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (!userExist) {
      return res.status(400).json({ messsage: 'User is not found!' })
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
      return res.status(400).json({ messsage: 'Wrong password!' })
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
    return res.status(200).json({ message: 'Login succesfully!' })
  } catch (error) {
    console.error('Error login:', error.message)
    return res.status(500).json({ message: 'Internal server error!' })
  }
}

export const verifyEmail = async (req, res) => {
  const { email } = req.body

  // Check validation
  const requiredError = requiredValidate([email])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return res.status(400).json({ message: emailError })
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (userExist) {
      return res.status(400).json({ message: 'User already exists!' })
    }

    const registerToken = jwt.sign(
      { email: email },
      envConfig.accessTokenSecretKey,
      {
        expiresIn: '5m',
      }
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
    return res.status(200).json({ message: 'Send email successfully!' })
  } catch (error) {
    console.error('Error verifyEmail:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

export const register = async (req, res) => {
  const { email } = req.user
  const { display_name, password } = req.body

  // Check validation
  const requiredError = requiredValidate([display_name, password])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const displayNameError = displayNameValidate(display_name)
  if (displayNameError) {
    return res.status(400).json({ message: displayNameError })
  }

  const passwordError = passwordValidate(password)
  if (passwordError) {
    return res.status(400).json({ message: passwordError })
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
    return res.status(201).json({ message: 'User registered successfully!' })
  } catch (error) {
    console.error('Error register:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
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
    return res
      .status(200)
      .json({ message: 'Show info successfully', info: result.rows[0] })
  } catch (error) {
    console.error('Error getInfo:', error.message)
    return res.status(500).json({ message: 'Internal server error!' })
  }
}

// Update user
export const update = async (req, res) => {
  const { user_id } = req.user
  const { new_display_name } = req.body

  // Check validation
  const requiredError = requiredValidate([new_display_name])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const newDisplayNameError = displayNameValidate(new_display_name)
  if (newDisplayNameError) {
    return res.status(400).json({ message: newDisplayNameError })
  }

  try {
    const query = `
      SELECT display_name
      FROM users
      WHERE user_id = $1;
    `
    const result = await client.query(query, [user_id])
    if (result.rows[0].display_name === new_display_name) {
      return res
        .status(400)
        .json({ message: 'New display name is the same as old display name!' })
    }

    const queryUpdate = `
      UPDATE users
      SET display_name = $1
      WHERE user_id = $2;
    `
    await client.query(queryUpdate, [new_display_name, user_id])
    return res.status(200).json({ message: 'Update user successfully!' })
  } catch (error) {
    console.error('Error update:', error.message)
    return res.status(500).json({ message: 'Internal server error!' })
  }
}

// Forget password
export const forgetPassword = async (req, res) => {
  const { email } = req.body

  // Check validation
  const requiredError = requiredValidate([email])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const emailError = emailValidate(email)
  if (emailError) {
    return res.status(400).json({ message: emailError })
  }

  try {
    // Check exist user
    const userExist = await isUserExist(email)
    if (!userExist) {
      return res.status(400).json({ message: 'User is not found!' })
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
    return res.status(200).json({ message: 'Send email successfully!' })
  } catch (error) {
    console.error('Error forgetPassword:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

export const resetPassword = async (req, res) => {
  const { email } = req.user
  const { newPassword, confirmNewPassword } = req.body

  // Check validation
  const requiredError = requiredValidate([newPassword, confirmNewPassword])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const newPasswordError = passwordValidate(newPassword)
  if (newPasswordError) {
    return res.status(400).json({ message: newPasswordError })
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Password is not match!' })
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
    return res.status(201).json({ message: 'Reset password successfully!' })
  } catch (error) {
    console.error('Error resetPassword:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
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
    return res.status(400).json({ message: requiredError })
  }

  const oldPasswordError = passwordValidate(oldPassword)
  if (oldPasswordError) {
    return res.status(400).json({ message: oldPasswordError })
  }

  const newPasswordError = passwordValidate(newPassword)
  if (newPasswordError) {
    return res.status(400).json({ message: newPasswordError })
  }

  if (newPassword === oldPassword) {
    return res
      .status(400)
      .json({ message: 'New password can not be the same as old password!' })
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Password is not match!' })
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
      return res.status(401).json({ messsage: 'Old Password is incorrect!' })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    const queryUpdate = `
      UPDATE users 
      SET password = $2
      WHERE user_id = $1;
    `
    await client.query(queryUpdate, [user_id, hashedNewPassword])
    return res.status(201).json({ message: 'Change password successfully!' })
  } catch (error) {
    console.error('Error changePassword:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

// Logout
export const logout = async (req, res) => {
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
      return res.status(400).json({ message: 'Invalid Token!' })
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
    return res
      .status(200)
      .json({ message: 'Logout and delete refresh token successfully!' })
  } catch (error) {
    console.error('Error logout:', error.message)
    res.status(500).json({ message: 'Internal server error!' })
  }
}

export const setCookieRegister = (req, res) => {
  const token = req.token

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'strict',
    maxAge: 300000,
  })

  res.redirect(`${envConfig.frontendUrl}${envConfig.registerPath}`)
}

export const setCookieForgetPass = (req, res) => {
  const token = req.token

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'strict',
    maxAge: 300000,
  })

  res.redirect(`${envConfig.frontendUrl}${envConfig.forgetPassPath}`)
}
