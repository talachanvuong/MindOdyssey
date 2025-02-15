import { Router } from 'express'
import { reviewDocument } from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'

const router = Router()
// Review document
router.post(
  '/review',
  // Verify admin here
  mutexLockHandler,
  asyncHandler(reviewDocument),
  errorHandler
)

export default router
