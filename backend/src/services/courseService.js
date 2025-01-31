import client from '../db/db.js'

/**
 * Check course exist by id.
 */
export const isCourseExistById = async (id) => {
  const result = await client.query(
    `SELECT 1
     FROM courses
     WHERE course_id = $1
     LIMIT 1;`,
    [id]
  )
  return result.rowCount > 0
}

/**
 * Check course exist by title.
 */
export const isCourseExistByTitle = async (title) => {
  const result = await client.query(
    `SELECT 1
     FROM courses
     WHERE title = $1
     LIMIT 1;`,
    [title]
  )
  return result.rowCount > 0
}

/**
 * Insert new course.
 */
export const insertCourse = async (title) => {
  await client.query(
    `INSERT INTO courses (title)
     VALUES ($1);`,
    [title]
  )
}

/**
 * Select courses.
 */
export const selectCourses = async (keyword) => {
  const result = await client.query(
    `SELECT course_id, title
     FROM courses
     WHERE title ILIKE $1;`,
    !keyword ? ['%%'] : [`%${keyword}%`]
  )
  return result.rows
}
