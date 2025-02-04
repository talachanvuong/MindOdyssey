import { Router } from 'express'
import { createCourse, getCourses } from '../controllers/courseController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'

const router = Router()
router.post(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(createCourse),
  errorHandler
)
router.get(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(getCourses),
  errorHandler
)

export default router
