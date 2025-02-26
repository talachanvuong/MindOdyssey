import client from '../db/db.js'

const isCourseExistById = async (course_id) => {
  const result = await client.query(
    `SELECT 1
     FROM courses
     WHERE course_id = $1
     LIMIT 1;`,
    [course_id]
  )

  return result.rowCount > 0
}

const isCourseExistByTitle = async (title) => {
  const result = await client.query(
    `SELECT 1
     FROM courses
     WHERE title = $1
     LIMIT 1;`,
    [title]
  )

  return result.rowCount > 0
}

const createCourse = async (title) => {
  await client.query(
    `INSERT INTO courses (title)
     VALUES ($1);`,
    [title]
  )
}

const getCourses = async (keyword) => {
  const refs = []
  let condition = ''

  if (keyword !== undefined) {
    condition = `WHERE title ILIKE $1`
    refs.push(`%${keyword}%`)
  }

  const result = await client.query(
    `SELECT course_id, title
     FROM courses
     ${condition};`,
    refs
  )
  
  return result.rows
}

export default {
  isCourseExistById,
  isCourseExistByTitle,
  createCourse,
  getCourses,
}
