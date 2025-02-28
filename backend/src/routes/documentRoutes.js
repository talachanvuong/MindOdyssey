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

// Get document detail owner
router.get(
  '/get-document-detail=owner',
  authMiddleware.verifyUser,
  asyncHandler(documentController.getDocumentDetailOwner),
  errorHandler
)

// Get document detail guest
router.get(
  '/get-document-detail=guest',
  authMiddleware.verifyUser,
  asyncHandler(documentController.getDocumentDetailGuest),
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
router.get(
  '/get-documents',
  authMiddleware.verifyUser,
  asyncHandler(documentController.getDocuments),
  errorHandler
)

export default router
