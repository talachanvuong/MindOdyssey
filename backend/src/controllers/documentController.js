import Joi from 'joi'
import client from '../db/db.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Check course exist.
 */
const isCourseExist = async (id) => {
  try {
    const result = await client.query(
      `SELECT 1
       FROM courses
       WHERE course_id = $1
       LIMIT 1;`,
      [id]
    )
    return result.rowCount > 0
  } catch {
    throw new Error('Database error!')
  }
}

// Shema
const createDocumentShema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
  description: Joi.string().trim().max(2048),
  total_questions: Joi.number().integer().strict().min(1).required(),
  course: Joi.number().integer().strict().min(1).required(),
})

/**
 * Create a new document.
 */
export const createDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = createDocumentShema.validate(req.body)
  const { title, description, total_questions, course } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const existedCourse = await isCourseExist(course)
  if (!existedCourse) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.COURSE.NOT_FOUND)
  }

  // Insert new document
  await client.query(
    `INSERT INTO documents (title, description, total_questions, course_id, user_id)
     VALUES ($1, $2, $3, $4, $5);`,
    [title, description, total_questions, course, user_id]
  )
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.COURSE.CREATE_SUCCESS)
}
