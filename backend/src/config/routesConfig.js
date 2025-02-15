import { Router } from 'express'
import adminRoutes from '../routes/adminRoutes.js'
import courseRoutes from '../routes/courseRoutes.js'
import documentRoutes from '../routes/documentRoutes.js'
import userRoutes from '../routes/userRoutes.js'

const router = Router()
router.use('/user', userRoutes)
router.use('/course', courseRoutes)
router.use('/document', documentRoutes)
router.use('/admin', adminRoutes)

export default router
