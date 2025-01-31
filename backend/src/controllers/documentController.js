import Joi from 'joi'
import client from '../db/db.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Check course exist.
 */
const isCourseExist = async (id) => {
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
 * Check document exist.
 */
const isDocumentExist = async (id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE document_id = $1
     LIMIT 1;`,
    [id]
  )
  return result.rowCount > 0
}

/**
 * Check order exist.
 */
const isOrderExist = async (order, id) => {
  const result = await client.query(
    `SELECT 1
     FROM questions
     WHERE document_id = $2
     AND "order" = $1
     LIMIT 1;`,
    [order, id]
  )
  return result.rowCount > 0
}

/**
 * Check exceed total questions.
 */
const isQuestionExceed = async (id) => {
  const result = await client.query(
    `SELECT
      (SELECT total_questions
       FROM documents
       WHERE document_id = $1) AS total,
      (SELECT COUNT(*)
       FROM questions
       WHERE document_id = $1) AS current;`,
    [id]
  )
  const { total, current } = result.rows[0]
  return current >= total
}

// Shema
const createDocumentShema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
  description: Joi.string().trim().max(2048),
  total_questions: Joi.number().integer().strict().min(1).required(),
  course: Joi.number().integer().strict().min(1).required(),
})

const createQuestionShema = Joi.object({
  order: Joi.number().integer().strict().min(1).required(),
  correct: Joi.string()
    .trim()
    .pattern(/^[ABCD]$/)
    .required(),
  document: Joi.number().integer().strict().min(1).required(),
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
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.DOCUMENT.CREATE_SUCCESS)
}

/**
 * Create a new question.
 */
export const createQuestion = async (req, res) => {
  const { error, value } = createQuestionShema.validate(req.body)
  const { order, correct, document } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const existedDocument = await isDocumentExist(document)
  if (!existedDocument) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.NOT_FOUND
    )
  }

  // Check order exist
  const existedOrder = await isOrderExist(order, document)
  if (existedOrder) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.QUESTION.EXISTED_ORDER
    )
  }

  // Check exceed total questions
  const exceededQuestion = await isQuestionExceed(document)
  if (exceededQuestion) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.QUESTION.EXCEEDED)
  }

  // Insert new question
  await client.query(
    `INSERT INTO questions ("order", correct_answer, document_id)
     VALUES ($1, $2, $3);`,
    [order, correct, document]
  )
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.QUESTION.CREATE_SUCCESS)
}
