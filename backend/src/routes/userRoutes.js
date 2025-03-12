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
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
const router = Router()

// Log in and log out
router.post('/login', asyncHandler(login), errorHandler)
router.post(
  '/logout',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(logout),
  errorHandler
)

// Register
router.post('/verifyemail', asyncHandler(verifyEmail), errorHandler)
router.get(
  '/verifyemail',
  asyncHandler(authMiddleware.verifyEmail),
  asyncHandler(setCookieRegister),
  errorHandler
)
router.post(
  '/register',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(register),
  errorHandler
)

// Forget password
router.post('/forgetpassword', asyncHandler(forgetPassword), errorHandler)
router.get(
  '/forgetpassword',
  asyncHandler(authMiddleware.verifyEmail),
  setCookieForgetPass
)
router.post(
  '/resetpassword',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(resetPassword),
  errorHandler
)

// Update
router.post(
  '/changepassword',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(changePassword),
  errorHandler
)
router.patch(
  '/update',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(update),
  errorHandler
)

// Get info
router.get(
  '/showinfo',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(getInfo),
  errorHandler
)

// Refresh token
router.post(
  '/refreshtoken',
  asyncHandler(authMiddleware.postRefreshToken),
  errorHandler
)

export default router
