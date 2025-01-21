import client from '../db/db.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'
import { requiredValidate, titleCourseValidate } from '../utils/validate.js'

/**
 * Create a new course.
 */
export const createCourse = async (req, res) => {
  const title = req.body.title?.trim()

  // Check validation
  const requiredError = requiredValidate([title])
  if (requiredError) {
    return res.status(400).json({ message: requiredError })
  }

  const titleError = titleCourseValidate(title)
  if (titleError) {
    return res.status(400).json({ message: titleError })
  }

  try {
    // Check exist
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
  } catch (error) {
    console.log('Error createCourse: ', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}

/**
 * Get list of courses.
 */
export const getCourses = async (req, res) => {
  const { keyword } = req.query

  try {
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
  } catch (error) {
    console.log('Error getCourses: ', error.message)
    return sendResponse(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGE.SERVER.ERROR
    )
  }
}
