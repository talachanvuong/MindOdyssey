import { Router } from 'express'
import adminController from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()

// Login
router.post('/login', asyncHandler(adminController.login), errorHandler)

// Logout
router.post(
  '/logout',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.logout),
  errorHandler
)

// Get pending documents
router.post(
  '/get-pending-documents',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.getPendingDocuments),
  errorHandler
)

// Get pending document detail
router.post(
  '/get-pending-document-detail',
  authMiddleware.verifyAdmin,
  asyncHandler(adminController.getPendingDocumentDetail),
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
