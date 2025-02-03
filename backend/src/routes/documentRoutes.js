import { Router } from 'express'
import {
  createDocument,
  getDocumentDetail,
  removeDocument,
} from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'
import {
  destroyTransactionHandler,
  uploadTransactionHandler,
} from '../middleware/transactionMiddleware.js'

const router = Router()
// Create document
router.post(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  uploadTransactionHandler(createDocument),
  errorHandler
)
// Get document detail
router.get(
  '/detail',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(getDocumentDetail),
  errorHandler
)
// Remove document
router.delete(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  destroyTransactionHandler(removeDocument),
  errorHandler
)

export default router
