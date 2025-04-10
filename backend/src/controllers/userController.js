import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'
import userSchema from '../schemas/userSchema.js'
import userService from '../services/userService.js'
import { MESSAGE, STATUS_CODE } from '../utils/constantUtils.js'
import { sendResponse } from '../utils/responseUtils.js'

// Login user and send token
export const login = async (req, res) => {
  // Check validation
  const { error, value } = userSchema.loginValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { email, password } = value

  // Check exist user
  const userExist = await userService.isUserExist(email)

  if (!userExist) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.USER.NOT_FOUND)
  }

  const result = await userService.selectPasswordUserIDbyEmail(email)
  const user_id = result.user_id
  const hashedPassword = result.password

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
  await userService.insertRefreshToken(user_id, refreshToken)

  // Send token
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge: 3600000,
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge: 31556952000,
  })
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.LOGIN_SUCCESS)
}

export const verifyEmail = async (req, res) => {
  // Check validation
  const { error, value } = userSchema.emailValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { email } = value
  // Check exist user
  const userExist = await userService.isUserExist(email)
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

  const subject = 'MindOdysey Registration Verification'
  const text =
    'Your MindOdysey registration verification link is only valid for 5 minutes.'
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <h1 style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">Welcome to MindOdysey!</h1>
    <p style="margin: 20px 0; line-height: 1.6; color: #333;">Hi,</p>
    <p style="margin: 20px 0; line-height: 1.6; color: #333;">Thank you for choosing us. Please click the button below to complete your registration:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${linkRegister}" target="_blank" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Complete Registration</a>
    </div>
    <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">Please do not reply to this email.</p>
    <p style="text-align: center; font-size: 12px; color: #888;">&copy; 2025 MindOdysey. All rights reserved.</p>
  </div>
`

  await userService.sendEmail(email, subject, text, html)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.SEND_EMAIL_SUCCESS)
}

export const register = async (req, res) => {
  const { email } = req.user

  // Check validation
  const { error, value } = userSchema.registerValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { display_name, password } = value

  const hashedPassword = await bcrypt.hash(password, 10)
  await userService.insertUser(email, display_name, hashedPassword)
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.USER.REGISTER_SUCCESS)
}

// Get information
export const getInfo = async (req, res) => {
  const { user_id } = req.user
  const result = await userService.selectInfoUser(user_id)
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.USER.GET_INFO_SUCCESS,
    result
  )
}

// Update user
export const update = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = userSchema.newDisplayNameValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { new_display_name } = value

  const result_select = await userService.selectDisplayname(user_id)
  if (result_select === new_display_name) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.SAME_DISPLAY_NAME
    )
  }

  await userService.updateDisplayname(new_display_name, user_id)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.UPDATE_SUCCESS)
}

// Forget password
export const forgetPassword = async (req, res) => {
  // Check validation
  const { error, value } = userSchema.emailValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { email } = value
  // Check exist user
  const userExist = await userService.isUserExist(email)
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

  const subject = 'MindOdysey Password Reset Verification'
  const text =
    'MindOdysey registration verification link is only valid for 5 minutes.'
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <h1 style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">MindOdysey Password Recovery</h1>
    <p style="margin: 20px 0; line-height: 1.6; color: #333;">Hello,</p>
    <p style="margin: 20px 0; line-height: 1.6; color: #333;">We received a request to reset your password. Please click the button below to reset your password:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${linkForgetPass}" target="_blank" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Reset Password</a>
    </div>
    <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
    <p style="text-align: center; font-size: 12px; color: #888;">&copy; 2025 MindOdysey. All rights reserved.</p>
  </div>`
  await userService.sendEmail(email, subject, text, html)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.SEND_EMAIL_SUCCESS)
}

export const resetPassword = async (req, res) => {
  const { email } = req.user

  // Check validation
  const { error, value } = userSchema.resetPasswordValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { newPassword, confirmNewPassword } = value

  if (newPassword !== confirmNewPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.PASSWORD_NOT_MATCH
    )
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await userService.updateResetPassword(hashedPassword, email)
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.USER.RESET_PASSWORD_SUCCESS
  )
}

export const changePassword = async (req, res) => {
  const { user_id } = req.user

  // Check validation
  const { error, value } = userSchema.changePasswordValidate.validate(req.body)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { oldPassword, newPassword } = value

  const result_select = await userService.selectPassword(user_id)
  const hashedPassword = result_select
  const isMatchedPassword = await bcrypt.compare(oldPassword, hashedPassword)
  if (!isMatchedPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.USER.WRONG_PASSWORD
    )
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)
  await userService.updateChangePassword(hashedNewPassword, user_id)
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.USER.CHANGE_PASSWORD_SUCCESS
  )
}

// Logout
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  const { error } = userSchema.refreshTokenValidate.validate(refreshToken)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  const isRefreshTokenExist = await userService.isRefreshTokenExist(
    refreshToken
  )
  if (!isRefreshTokenExist) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.AUTH.REFRESH_TOKEN.NOT_FOUND
    )
  }

  await userService.deleteRefreshToken(refreshToken)
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.USER.LOGOUT_SUCCESS)
}

export const setCookieRegister = (req, res) => {
  const token = req.token
  const { error } = userSchema.accessTokenValidate.validate(token)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge: 300000,
  })

  return res.redirect(`${envConfig.frontendUrl}${envConfig.registerPath}`)
}

export const setCookieForgetPass = (req, res) => {
  const token = req.token
  const { error } = userSchema.accessTokenValidate.validate(token)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge: 300000,
  })

  return res.redirect(`${envConfig.frontendUrl}${envConfig.forgetPassPath}`)
}
