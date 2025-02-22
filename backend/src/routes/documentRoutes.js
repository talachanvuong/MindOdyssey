import { Router } from 'express'
import {
  createDocument,
  editDocument,
  getDocumentDetail,
  getDocuments,
  removeDocument,
} from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()
// Create document
router.post(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(createDocument),
  errorHandler
)
// Get document detail
router.get(
  '/detail',
  authMiddleware.verifyUser,
  asyncHandler(getDocumentDetail),
  errorHandler
)
// Remove document
router.delete(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(removeDocument),
  errorHandler
)
// Update document
router.patch(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(editDocument),
  errorHandler
)
// Get documents
router.get(
  '/',
  authMiddleware.verifyUser,
  asyncHandler(getDocuments),
  errorHandler
)

export default router
