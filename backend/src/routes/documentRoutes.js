import { Router } from 'express'
import {
  createDocument,
  createQuestion,
} from '../controllers/documentController.js'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'

const router = Router()
router.post(
  '/create',
  authMiddleware.verifyUser,
  asyncHandler(createDocument),
  errorHandler
)
router.post(
  '/question',
  authMiddleware.verifyUser,
  asyncHandler(createQuestion),
  errorHandler
)

export default router
