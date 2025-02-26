import { Router } from 'express'
import courseController from '../controllers/courseController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()

// Create course
router.post(
  '/create-course',
  authMiddleware.verifyUser,
  asyncHandler(courseController.createCourse),
  errorHandler
)

// Get courses
router.get(
  '/get-courses',
  authMiddleware.verifyUser,
  asyncHandler(courseController.getCourses),
  errorHandler
)

export default router
