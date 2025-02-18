import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { errorHandler } from '../middleware/errorMiddleware.js'
import { mutexLockHandler } from '../middleware/mutexLockMiddleware.js'
import practiceController from '../controllers/practiceController.js'
const router=Router()
router.get('/getdocsforprac',asyncHandler(authMiddleware.verifyUser),mutexLockHandler,(practiceController.getDocumentforPratice),errorHandler)
router.get('/getpracticehistory',asyncHandler(authMiddleware.verifyUser),mutexLockHandler,(practiceController.getPracticeHistory),errorHandler)
export default router