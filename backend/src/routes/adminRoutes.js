import { Router } from 'express'
import { login, reviewDocument } from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()
router.post('/login', asyncHandler(login), errorHandler)

// Review document
router.post(
  '/review',
  authMiddleware.verifyAdmin,
  asyncHandler(reviewDocument),
  errorHandler
)

export default router
