import { Router } from 'express'
import { createCourse, getCourses } from '../controllers/courseController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authMiddleware.verifyUser, createCourse)
router.get('/', authMiddleware.verifyUser, getCourses)

export default router
