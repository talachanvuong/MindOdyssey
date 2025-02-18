import { Router } from 'express'
import courseRoutes from '../routes/courseRoutes.js'
import documentRoutes from '../routes/documentRoutes.js'
import userRoutes from '../routes/userRoutes.js'
import practiceRoutes from '../routes/practiceRoutes.js'

const router = Router()
router.use('/user', userRoutes)
router.use('/course', courseRoutes)
router.use('/document', documentRoutes)
router.use('/practice', practiceRoutes)

export default router
