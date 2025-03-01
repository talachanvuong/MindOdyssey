import { Router } from 'express'
import adminController from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()

// Login
router.post('/login', asyncHandler(adminController.login), errorHandler)

// Get unapproved documents
router.get(
  '/get-unapproved-documents',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.getUnapprovedDocuments),
  errorHandler
)

// Get document detail
router.get(
  '/get-document-detail',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.getDocumentDetail),
  errorHandler
)

// Review document
router.post(
  '/review-document',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.reviewDocument),
  errorHandler
)

export default router
