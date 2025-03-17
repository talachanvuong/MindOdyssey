import { Router } from 'express'
import practiceController from '../controllers/practiceController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
const router = Router()
router.get(
  '/getdocsforprac',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(practiceController.getDocumentforPratice),
  errorHandler
)
router.get(
  '/getpracticehistory',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(practiceController.getPracticeHistory),
  errorHandler
)
router.get(
  '/getdocsbyuserid',
  asyncHandler(authMiddleware.verifyUser),
  asyncHandler(practiceController.getDocumentbyUserID),
  errorHandler
)
export default router
