import { Router } from 'express'
import {
  changePassword,
  forgetPassword,
  getInfo,
  login,
  logout,
  register,
  resetPassword,
  setCookieForgetPass,
  setCookieRegister,
  update,
  verifyEmail,
} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

// Log in and log out
router.post('/login', login)
router.post('/logout', authMiddleware.verifyUser, logout)

// Register
router.post('/verifyemail', verifyEmail)
router.get('/verifyemail', authMiddleware.verifyEmail, setCookieRegister)
router.post('/register', authMiddleware.verifyUser, register)

// Forget password
router.post('/forgetpassword', forgetPassword)
router.get('/forgetpassword', authMiddleware.verifyEmail, setCookieForgetPass)
router.post('/resetpassword', authMiddleware.verifyUser, resetPassword)

// Update
router.post('/changepassword', authMiddleware.verifyUser, changePassword)
router.patch('/update', authMiddleware.verifyUser, update)

// Get info
router.get('/showinfo', authMiddleware.verifyUser, getInfo)

// Refresh token
router.post('/refreshtoken', authMiddleware.postRefreshToken)

export default router
