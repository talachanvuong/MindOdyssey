import client from '../db/db.js'
import { requiredValidate, titleCourseValidate } from '../utils/validate.js'
import { MESSAGE } from '../utils/constant.js'

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
      return res.status(400).json({ message: MESSAGE.COURSE.EXISTED })
    }

    // Insert new course
    await client.query(
      `INSERT INTO courses (title)
       VALUES ($1);`,
      [title]
    )
    return res.status(201).json({ message: MESSAGE.COURSE.CREATE_SUCCESS })
  } catch (error) {
    console.log('Error createCourse: ', error.message)
    return res.status(500).json({ message: MESSAGE.SERVER.ERROR })
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
    return res.status(200).json(result.rows)
  } catch (error) {
    console.log('Error getCourses: ', error.message)
    return res.status(500).json({ message: MESSAGE.SERVER.ERROR })
  }
}
