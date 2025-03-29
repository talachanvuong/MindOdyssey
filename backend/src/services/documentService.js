import client from '../db/db.js'

const isDocumentExist = async (document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE document_id = $1
     LIMIT 1;`,
    [document_id]
  )

  return result.rowCount > 0
}

const createDocument = async (
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

const getDocumentDetail = async (document_id) => {
  const result = await client.query(
    `SELECT
      d.title,
      d.description,
      d.created_at,
      d.last_updated,
      json_build_object(
          'id', c.course_id,
          'title', c.title
      ) AS course,
      d.status,
      a.display_name AS reviewer,
      d.reject_reason,
      d.total_questions,
      json_agg(
        json_build_object(
          'id', q.question_id,
          'correct_answer', q.correct_answer,
          'contents', (
            SELECT json_agg(
              json_build_object(
                'id', con.content_id,
                'text', con.text,
                'attachment', con.attachment,
                'attachment_id', con.attachment_id,
                'type', con."type"
              )
            )
            FROM contents AS con
            WHERE q.question_id = con.question_id
          )
        )
        ORDER BY q."order"
      ) AS questions
     FROM documents AS d
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     LEFT OUTER JOIN admins AS a
     ON d.admin_id = a.admin_id
     INNER JOIN questions AS q
     ON d.document_id = q.document_id
     WHERE d.document_id = $1
     GROUP BY
      d.title,
      d.description,
      d.created_at,
      d.last_updated,
      c.course_id,
      c.title,
      d.status,
      a.display_name,
      d.reject_reason,
      d.total_questions;`,
    [document_id]
  )

  return result.rows[0]
}

const deleteDocument = async (document_id) => {
  await client.query(
    `DELETE FROM documents
     WHERE document_id = $1;`,
    [document_id]
  )
}

const isDocumentAuthor = async (user_id, document_id) => {
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

const editDocument = async (title, description, course_id, document_id) => {
  const updates = []
  const refs = [document_id]
  let index = 2

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
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE documents
       SET ${updates.join(', ')}
       WHERE document_id = $1;`,
      refs
    )
  }
}

const updateDocument = async (document_id) => {
  await client.query(
    `UPDATE documents
     SET
      last_updated = NOW(),
      status = 'Pending',
      admin_id = NULL,
      reject_reason = NULL
     WHERE document_id = $1;`,
    [document_id]
  )
}

const getTotalQuestions = async (document_id) => {
  const result = await client.query(
    `SELECT total_questions
     FROM documents
     WHERE document_id = $1
     LIMIT 1;`,
    [document_id]
  )

  return parseInt(result.rows[0].total_questions)
}

const getDocuments = async (pagination, keyword, filter, user_id) => {
  const conditions = []
  const refs = [user_id]
  let index = 2

  if (keyword) {
    conditions.push(`title ILIKE $${index}`)
    refs.push(`%${keyword}%`)
    index++
  }

  if (filter) {
    conditions.push(`created_at >= $${index}`)
    refs.push(new Date(filter).toISOString())
  }

  const tempResult = await client.query(
    `SELECT COUNT(*) AS filtered_documents
     FROM documents
     WHERE user_id = $1
     ${conditions.map((condition) => `AND ${condition}`).join(' ')}
     LIMIT 1;`,
    refs
  )
  const filteredDocuments = parseInt(tempResult.rows[0].filtered_documents)

  // Empty result
  if (filteredDocuments === 0) {
    return {
      total_pages: 0,
      documents: [],
    }
  }

  let limit = ''
  let totalPages = 1

  if (pagination) {
    const { page, perPage } = pagination
    limit = `LIMIT ${perPage} OFFSET ${perPage * (page - 1)}`
    totalPages = Math.ceil(filteredDocuments / perPage)
  }

  const result = await client.query(
    `SELECT
      document_id,
      title,
      created_at
     FROM documents
     WHERE user_id = $1
     ${conditions.map((condition) => `AND ${condition}`).join(' ')}
     ORDER BY created_at DESC
     ${limit};`,
    refs
  )

  return {
    total_pages: totalPages,
    documents: result.rows
  }
}

const updateTotalQuestions = async (document_id) => {
  await client.query(
    `UPDATE documents AS d
     SET total_questions = (
      SELECT COUNT(*)
      FROM questions AS q
      WHERE q.document_id = d.document_id
     )
     WHERE d.document_id = $1;`,
    [document_id]
  )
}

const isDocumentApprove = async (document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE status = 'Approved'
     AND document_id = $1
     LIMIT 1;`,
    [document_id]
  )

  return result.rowCount > 0
}

const isDocumentReview = async (document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE status <> 'Pending'
     AND document_id = $1
     LIMIT 1;`,
    [document_id]
  )

  return result.rowCount > 0
}

const getDocumentInfo = async (document_id) => {
  const result = await client.query(
    `SELECT
      d.title,
      d.description,
      json_build_object(
          'id', d.user_id,
          'display_name', u.display_name
      ) AS author,
      d.created_at,
      d.last_updated,
      c.title AS course,
      d.total_questions
     FROM documents AS d
     INNER JOIN users AS u
     ON d.user_id = u.user_id
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     WHERE d.document_id = $1;`,
    [document_id]
  )

  return result.rows[0]
}

export default {
  isDocumentExist,
  createDocument,
  getDocumentDetail,
  deleteDocument,
  isDocumentAuthor,
  editDocument,
  updateDocument,
  getTotalQuestions,
  getDocuments,
  updateTotalQuestions,
  isDocumentApprove,
  isDocumentReview,
  getDocumentInfo
}
