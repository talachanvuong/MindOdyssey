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
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'
const router = Router()

// Log in and log out
router.post('/login', asyncHandler(login), errorHandler)
router.post(
  '/logout',
  asyncHandler(authMiddleware.verifyUser),
  mutexLockHandler,
  asyncHandler(logout),
  errorHandler
)

// Register
router.post(
  '/verifyemail',
  asyncHandler(verifyEmail),
  mutexLockHandler,
  errorHandler
)
router.get(
  '/verifyemail',
  asyncHandler(authMiddleware.verifyEmail),
  mutexLockHandler,
  asyncHandler(setCookieRegister),
  errorHandler
)
router.post(
  '/register',
  asyncHandler(authMiddleware.verifyUser),
  mutexLockHandler,
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
  mutexLockHandler,
  asyncHandler(resetPassword),
  errorHandler
)

// Update
router.post(
  '/changepassword',
  asyncHandler(authMiddleware.verifyUser),
  mutexLockHandler,
  asyncHandler(changePassword),
  errorHandler
)
router.patch(
  '/update',
  asyncHandler(authMiddleware.verifyUser),
  mutexLockHandler,
  asyncHandler(update),
  errorHandler
)

// Get info
router.get(
  '/showinfo',
  asyncHandler(authMiddleware.verifyUser),
  mutexLockHandler,
  asyncHandler(getInfo),
  errorHandler
)

// Refresh token
router.post(
  '/refreshtoken',
  //mutexLockHandler,
  asyncHandler(authMiddleware.postRefreshToken),
  errorHandler
)

export default router
