import { Router } from 'express'
import practiceController from '../controllers/practiceController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
const router = Router()
router.get(
  '/getdocsforprac',
  asyncHandler(authMiddleware.verifyUser),
  practiceController.getDocumentforPratice,
  errorHandler
)
router.get(
  '/getpracticehistory',
  asyncHandler(authMiddleware.verifyUser),
  practiceController.getPracticeHistory,
  errorHandler
)
export default router
