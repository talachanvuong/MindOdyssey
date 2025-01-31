import client from '../db/db.js'

/**
 * Check document exist.
 */
export const isDocumentExist = async (document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE document_id = $1
     LIMIT 1;`,
    [document_id]
  )
  return result.rowCount > 0
}

/**
 * Check order exist.
 */
export const isOrderExist = async (order, document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM questions
     WHERE document_id = $2
     AND "order" = $1
     LIMIT 1;`,
    [order, document_id]
  )
  return result.rowCount > 0
}

/**
 * Check exceed total questions.
 */
export const isQuestionExceed = async (document_id) => {
  const result = await client.query(
    `SELECT
      (SELECT total_questions
       FROM documents
       WHERE document_id = $1) AS total,
      (SELECT COUNT(*)
       FROM questions
       WHERE document_id = $1) AS current;`,
    [document_id]
  )
  const { total, current } = result.rows[0]
  return current >= total
}

/**
 * Check question exist.
 */
export const isQuestionExist = async (question_id) => {
  const result = await client.query(
    `SELECT 1
     FROM questions
     WHERE question_id = $1
     LIMIT 1;`,
    [question_id]
  )
  return result.rowCount > 0
}

/**
 * Check type exist.
 */
export const isTypeExist = async (type, question_id) => {
  const result = await client.query(
    `SELECT 1
     FROM contents
     WHERE question_id = $2
     AND type = $1
     LIMIT 1;`,
    [type, question_id]
  )
  return result.rowCount > 0
}

/**
 * Insert new document.
 */
export const insertDocument = async (
  title,
  description,
  total_questions,
  course_id,
  user_id
) => {
  await client.query(
    `INSERT INTO documents (title, description, total_questions, course_id, user_id)
     VALUES ($1, $2, $3, $4, $5);`,
    [title, description, total_questions, course_id, user_id]
  )
}

/**
 * Insert new question.
 */
export const insertQuestion = async (order, correct_answer, document_id) => {
  await client.query(
    `INSERT INTO questions ("order", correct_answer, document_id)
     VALUES ($1, $2, $3);`,
    [order, correct_answer, document_id]
  )
}

/**
 * Insert new content.
 */
export const insertContent = async (text, attachment, type, question_id) => {
  await client.query(
    `INSERT INTO contents (text, attachment, type, question_id)
     VALUES ($1, $2, $3, $4);`,
    [text, attachment, type, question_id]
  )
}
