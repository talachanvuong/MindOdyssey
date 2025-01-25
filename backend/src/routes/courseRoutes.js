import { Router } from 'express'
import { createCourse, getCourses } from '../controllers/courseController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()
router.post(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(createCourse),
  errorHandler
)
router.get(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(getCourses),
  errorHandler
)

export default router
