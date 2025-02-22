import { Router } from 'express'
import { login, reviewDocument } from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()
router.post('/login', asyncHandler(login), errorHandler)

// Review document
router.post(
  '/review',
  // Verify admin here
  asyncHandler(reviewDocument),
  errorHandler
)

export default router
