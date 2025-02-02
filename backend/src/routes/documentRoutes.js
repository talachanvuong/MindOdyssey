import { Router } from 'express'
import { createDocument } from '../controllers/documentController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { transactionHandler } from '../middleware/transactionMiddleware.js'

const router = Router()
router.post(
  '/create',
  authMiddleware.verifyUser,
  transactionHandler(createDocument),
  errorHandler
)

export default router
