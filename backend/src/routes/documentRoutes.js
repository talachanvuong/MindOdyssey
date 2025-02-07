import { Router } from 'express'
import {
  createDocument,
  editDocument,
  getDocumentDetail,
  removeDocument,
} from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'

const router = Router()
// Create document
router.post(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(createDocument),
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
  asyncHandler(removeDocument),
  errorHandler
)
// Update document
router.patch(
  '/',
  authMiddleware.verifyUser,
  mutexLockHandler,
  asyncHandler(editDocument),
  errorHandler
)

export default router
