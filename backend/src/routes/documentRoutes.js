import { Router } from 'express'
import documentController from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()

// Create document
router.post(
  '/create-document',
  authMiddleware.verifyUser,
  asyncHandler(documentController.createDocument),
  errorHandler
)

// Get document detail
router.post(
  '/get-document-detail',
  authMiddleware.verifyUser,
  asyncHandler(documentController.getDocumentDetail),
  errorHandler
)

// Delete document
router.delete(
  '/delete-document',
  authMiddleware.verifyUser,
  asyncHandler(documentController.deleteDocument),
  errorHandler
)

// Edit document
router.patch(
  '/edit-document',
  authMiddleware.verifyUser,
  asyncHandler(documentController.editDocument),
  errorHandler
)

// Get documents
router.post(
  '/get-documents',
  authMiddleware.verifyUser,
  asyncHandler(documentController.getDocuments),
  errorHandler
)

export default router
