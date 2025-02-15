import client from '../db/db.js'
import { timeConvert } from '../utils/convert.js'

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
 * Check content exist.
 */
export const isContentExist = async (content_id) => {
  const result = await client.query(
    `SELECT 1
     FROM contents
     WHERE content_id = $1
     LIMIT 1;`,
    [content_id]
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
    `INSERT INTO contents (text, attachment, attachment_id, "type", question_id)
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
      c.title AS course,
      u.display_name AS author,
      d.created_at,
      d.last_updated,
      d.status,
      a.display_name AS reviewer,
      d.reject_reason
     FROM documents AS d
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     LEFT OUTER JOIN admins AS a
     ON d.admin_id = a.admin_id
     INNER JOIN users AS u
     ON d.user_id = u.user_id
     WHERE d.document_id = $1;`,
    [document_id]
  )
  return result.rows.map((row) => ({
    ...row,
    created_at: timeConvert(row.created_at),
    last_updated: timeConvert(row.last_updated),
  }))[0]
}

/**
 * Check for illegal access to a document.
 */
export const illegalAccessDocument = async (user_id, document_id) => {
  const result = await client.query(
    `SELECT user_id, status
     FROM documents
     WHERE document_id = $1;`,
    [document_id]
  )
  const document = result.rows[0]
  return document.user_id !== user_id && document.status !== 'Đã duyệt'
}

/**
 * Select questions.
 */
export const selectQuestions = async (document_id) => {
  const result = await client.query(
    `SELECT
      question_id AS id,
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
      content_id AS id,
      text,
      attachment,
      attachment_id,
      "type"
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

/**
 * Check author of document.
 */
export const isDocumentAuthor = async (user_id, document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE user_id = $1
     AND document_id = $2
     LIMIT 1;`,
    [user_id, document_id]
  )
  return result.rowCount > 0
}

/**
 * Check author of question.
 */
export const isQuestionAuthor = async (user_id, document_id, question_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents AS d
     INNER JOIN questions AS q
     ON d.document_id = q.document_id
     WHERE d.user_id = $1
     AND d.document_id = $2
     AND q.question_id = $3
     LIMIT 1;`,
    [user_id, document_id, question_id]
  )
  return result.rowCount > 0
}

/**
 * Check author of content.
 */
export const isContentAuthor = async (
  user_id,
  document_id,
  question_id,
  content_id
) => {
  const result = await client.query(
    `SELECT 1
     FROM documents AS d
     INNER JOIN questions AS q
     ON d.document_id = q.document_id
     INNER JOIN contents AS c
     ON q.question_id = c.question_id
     WHERE d.user_id = $1
     AND d.document_id = $2
     AND q.question_id = $3
     AND c.content_id = $4
     LIMIT 1;`,
    [user_id, document_id, question_id, content_id]
  )
  return result.rowCount > 0
}

/**
 * Update a document.
 */
export const updateDocument = async (
  title,
  description,
  course_id,
  document_id
) => {
  const updates = []
  const refs = []
  let index = 1

  if (title) {
    updates.push(`title = $${index}`)
    refs.push(title)
    index++
  }

  if (course_id) {
    updates.push(`course_id = $${index}`)
    refs.push(course_id)
    index++
  }

  if (description !== undefined) {
    updates.push(`description = $${index}`)
    refs.push(description)
    index++
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE documents
       SET ${updates.join(', ')}
       WHERE document_id = $${index};`,
      [...refs, document_id]
    )
  }
}

/**
 * Update a question.
 */
export const updateQuestion = async (order, correct_answer, question_id) => {
  const updates = []
  const refs = []
  let index = 1

  if (order) {
    updates.push(`"order" = $${index}`)
    refs.push(order)
    index++
  }

  if (correct_answer) {
    updates.push(`correct_answer = $${index}`)
    refs.push(correct_answer)
    index++
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE questions
       SET ${updates.join(', ')}
       WHERE question_id = $${index};`,
      [...refs, question_id]
    )
  }
}

/**
 * Update a content.
 */
export const updateContent = async (
  text,
  attachment,
  attachment_id,
  content_id
) => {
  const updates = []
  const refs = []
  let index = 1

  if (text !== undefined) {
    updates.push(`text = $${index}`)
    refs.push(text)
    index++
  }

  if (attachment !== undefined) {
    updates.push(`attachment = $${index}`)
    refs.push(attachment)
    index++
  }

  if (attachment_id !== undefined) {
    updates.push(`attachment_id = $${index}`)
    refs.push(attachment_id)
    index++
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE contents
       SET ${updates.join(', ')}
       WHERE content_id = $${index};`,
      [...refs, content_id]
    )
  }
}

/**
 * Confirm updating a document, including questions/contents inside.
 */
export const confirmUpdateDocument = async (document_id) => {
  await client.query(
    `UPDATE documents
     SET
      last_updated = NOW(),
      status = 'Chưa duyệt',
      admin_id = NULL,
      reject_reason = NULL
     WHERE document_id = $1;`,
    [document_id]
  )
}

/**
 * Select total questions.
 */
export const selectTotalQuestions = async (document_id) => {
  const result = await client.query(
    `SELECT total_questions
     FROM documents
     WHERE document_id = $1;`,
    [document_id]
  )
  return parseInt(result.rows[0].total_questions)
}

/**
 * Delete a question.
 */
export const deleteQuestion = async (question_id) => {
  const result = await client.query(
    `DELETE FROM questions
     WHERE question_id = $1
     RETURNING "order";`,
    [question_id]
  )
  return result.rows[0].order
}

/**
 * Select a question.
 */
export const selectQuestion = async (question_id) => {
  const result = await client.query(
    `SELECT "order"
     FROM questions
     WHERE question_id = $1;`,
    [question_id]
  )
  return result.rows[0]
}

/**
 * Select a content.
 */
export const selectContent = async (content_id) => {
  const result = await client.query(
    `SELECT
      text,
      attachment_id
     FROM contents
     WHERE content_id = $1;`,
    [content_id]
  )
  return result.rows[0]
}

/**
 * Arrange order question after delete.
 */
export const arrangeOrderAfterDelete = async (order, document_id) => {
  await client.query(
    `UPDATE questions
     SET "order" = "order" - 1
     WHERE "order" > $1
     AND document_id = $2;`,
    [order, document_id]
  )
}

/**
 * Arrange order question before insert.
 */
export const arrangeOrderBeforeInsert = async (order, document_id) => {
  await client.query(
    `UPDATE questions
     SET "order" = "order" + 1
     WHERE "order" >= $1
     AND document_id = $2;`,
    [order, document_id]
  )
}

/**
 * Arrange order question after update.
 */
export const arrangeOrderAfterUpdate = async (
  old_order,
  new_order,
  question_id,
  document_id
) => {
  await client.query(
    `UPDATE questions
     SET "order" = CASE
                    WHEN "order" > $1 AND "order" <= $2 THEN "order" - 1
                    WHEN "order" < $1 AND "order" >= $2 THEN "order" + 1
                    ELSE "order"
                   END
     WHERE question_id <> $3
     AND document_id = $4;`,
    [old_order, new_order, question_id, document_id]
  )
}

/**
 * Select documents.
 */
export const selectDocuments = async (pagination, keyword, filter, user_id) => {
  const options = []
  const conditions = []
  const refs = []
  let index = 1

  if (pagination) {
    options.push(`LIMIT $${index} OFFSET $${index + 1}`)
    refs.push(pagination.perPage)
    refs.push(pagination.perPage * (pagination.page - 1))
    index += 2
  }

  if (keyword) {
    conditions.push(`d.title ILIKE $${index}`)
    refs.push(`%${keyword}%`)
    index++
  }

  if (filter) {
    conditions.push(`d.created_at >= $${index}`)
    refs.push(new Date(filter).toISOString())
    index++
  }

  const result = await client.query(
    `SELECT
      d.document_id,
      d.title,
      d.description,
      d.total_questions,
      c.title AS course,
      d.created_at,
      d.last_updated,
      d.status,
      a.display_name AS reviewer,
      d.reject_reason,
      COUNT(*) OVER() AS total_pages
     FROM documents AS d
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     LEFT OUTER JOIN admins AS a
     ON d.admin_id = a.admin_id
     WHERE d.user_id = $${index}
     ${conditions.map((condition) => `AND ${condition}`).join(' ')}
     ${options.join(' ')};`,
    [...refs, user_id]
  )
  return result.rows.map((row) => ({
    ...row,
    created_at: timeConvert(row.created_at),
    last_updated: timeConvert(row.last_updated),
    total_pages: parseInt(row.total_pages),
  }))
}
