import Joi from 'joi'
import client from '../db/db.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

// Schema
const createCourseShema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
})

const getCoursesShema = Joi.object({
  keyword: Joi.string().trim().allow(''),
})

/**
 * Create a new course.
 */
export const createCourse = async (req, res) => {
  const { error, value } = createCourseShema.validate(req.body)
  const { title } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const existedCourse = await client.query(
    `SELECT 1
     FROM courses
     WHERE title ILIKE $1
     LIMIT 1;`,
    [title]
  )
  if (existedCourse.rowCount > 0) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.COURSE.EXISTED)
  }

  // Insert new course
  await client.query(
    `INSERT INTO courses (title)
     VALUES ($1);`,
    [title]
  )
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.COURSE.CREATE_SUCCESS)
}

/**
 * Get list of courses.
 */
export const getCourses = async (req, res) => {
  const { error, value } = getCoursesShema.validate(req.query)
  const { keyword } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  const result = await client.query(
    `SELECT course_id, title
     FROM courses
     WHERE title ILIKE $1;`,
    !keyword ? ['%%'] : [`%${keyword}%`]
  )
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.COURSE.GET_SUCCESS,
    result.rows
  )
}
