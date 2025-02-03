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
 * Insert new document.
 */
export const insertDocument = async (
  title,
  description,
  total_questions,
  course_id,
  user_id
) => {
  const result = await client.query(
    `INSERT INTO documents (title, description, total_questions, course_id, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING document_id;`,
    [title, description, total_questions, course_id, user_id]
  )
  return result.rows[0].document_id
}

/**
 * Insert new question.
 */
export const insertQuestion = async (order, correct_answer, document_id) => {
  const result = await client.query(
    `INSERT INTO questions ("order", correct_answer, document_id)
     VALUES ($1, $2, $3)
     RETURNING question_id;`,
    [order, correct_answer, document_id]
  )
  return result.rows[0].question_id
}

/**
 * Insert new content.
 */
export const insertContent = async (
  text,
  attachment,
  attachment_id,
  type,
  question_id
) => {
  await client.query(
    `INSERT INTO contents (text, attachment, attachment_id, type, question_id)
     VALUES ($1, $2, $3, $4, $5);`,
    [text, attachment, attachment_id, type, question_id]
  )
}

/**
 * Select a document.
 */
export const selectDocument = async (document_id) => {
  const result = await client.query(
    `SELECT
      d.title,
      d.description,
      d.total_questions,
      c.title as course,
      d.user_id as author,
      d.created_at,
      d.last_updated,
      d.status,
      a.display_name as reviewer,
      d.reject_reason
     FROM documents as d
     INNER JOIN courses as c
     ON d.course_id = c.course_id
     LEFT OUTER JOIN admins as a
     ON d.admin_id = a.admin_id
     WHERE document_id = $1;`,
    [document_id]
  )
  return result.rows[0]
}

/**
 * Select questions.
 */
export const selectQuestions = async (document_id) => {
  const result = await client.query(
    `SELECT
      question_id,
      correct_answer
     FROM questions
     WHERE document_id = $1
     ORDER BY "order" ASC;`,
    [document_id]
  )
  return result.rows
}

/**
 * Select contents.
 */
export const selectContents = async (question_id) => {
  const result = await client.query(
    `SELECT
      content_id,
      text,
      attachment,
      attachment_id,
      type
     FROM contents
     WHERE question_id = $1;`,
    [question_id]
  )
  return result.rows
}

/**
 * Delete a document.
 */
export const deleteDocument = async (document_id) => {
  await client.query(
    `DELETE FROM documents
     WHERE document_id = $1;`,
    [document_id]
  )
}
