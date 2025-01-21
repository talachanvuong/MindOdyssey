import { Router } from 'express'
import { createCourse, getCourses } from '../controllers/documentController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

// Course
router.post('/course', authMiddleware.verifyUser, createCourse)
router.get('/course', authMiddleware.verifyUser, getCourses)

export default router
