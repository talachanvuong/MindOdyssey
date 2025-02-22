import { Router } from 'express'
import {
  getUnapprovedDocuments,
  login,
  reviewDocument,
} from '../controllers/adminController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()

// Login
router.post('/login', asyncHandler(login), errorHandler)

// Get unapproved documents
router.get(
  '/document',
  authMiddleware.verifyAdmin,
  asyncHandler(getUnapprovedDocuments),
  errorHandler
)

// Review document
router.post(
  '/review',
  authMiddleware.verifyAdmin,
  asyncHandler(reviewDocument),
  errorHandler
)

export default router
