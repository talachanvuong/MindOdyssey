import { Router } from 'express'
import {
  createDocument,
  getDocumentDetail,
} from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'
import { transactionHandler } from '../middleware/transactionMiddleware.js'

const router = Router()
router.post(
  '/create',
  authMiddleware.verifyUser,
  mutexLockHandler,
  transactionHandler(createDocument),
  errorHandler
)
router.get(
  '/detail',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(getDocumentDetail),
  errorHandler
)

export default router
