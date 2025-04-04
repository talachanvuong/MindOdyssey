import client from '../db/db.js'

const getAdminByDisplayName = async (display_name) => {
  const result = await client.query(
    `SELECT admin_id, "password"
     FROM admins
     WHERE display_name = $1
     LIMIT 1;`,
    [display_name]
  )

  return result.rows[0]
}

const getPendingDocuments = async (pagination, keyword, filter) => {
  const conditions = []
  const refs = ['Pending']
  let index = 2

  if (keyword) {
    conditions.push(`title ILIKE $${index}`)
    refs.push(`%${keyword}%`)
    index++
  }

  if (filter) {
    conditions.push(`last_updated >= $${index}`)
    refs.push(new Date(filter).toISOString())
  }

  const tempResult = await client.query(
    `SELECT COUNT(*) AS filtered_documents
     FROM documents
     WHERE status = $1
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
      last_updated
     FROM documents
     WHERE status = $1
     ${conditions.map((condition) => `AND ${condition}`).join(' ')}
     ORDER BY last_updated DESC
     ${limit};`,
    refs
  )

  return {
    total_pages: totalPages,
    documents: result.rows
  }
}

const getPendingDocumentDetail = async (document_id) => {
  const result = await client.query(
    `SELECT
      d.title,
      d.description,
      u.display_name AS author,
      d.created_at,
      d.last_updated,
      c.title AS course,
      d.total_questions,
      json_agg(
        json_build_object(
          'correct_answer', q.correct_answer,
          'contents', (
            SELECT json_agg(
              json_build_object(
                'text', con.text,
                'attachment', con.attachment,
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
     INNER JOIN users AS u
     ON d.user_id = u.user_id
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     INNER JOIN questions AS q
     ON d.document_id = q.document_id
     WHERE d.document_id = $1
     GROUP BY
      d.title,
      d.description,
      u.display_name,
      d.created_at,
      d.last_updated,
      c.title,
      d.total_questions;`,
    [document_id]
  )

  return result.rows[0]
}

const reviewDocument = async (
  admin_id,
  isApproved,
  reject_reason,
  document_id
) => {
  const updates = ['admin_id = $2', 'status = $3']
  const refs = [document_id, admin_id, isApproved ? 'Approved' : 'Rejected']

  if (reject_reason !== undefined) {
    updates.push(`reject_reason = $4`)
    refs.push(reject_reason)
  }

  await client.query(
    `UPDATE documents
     SET ${updates.join(', ')}
     WHERE document_id = $1;`,
    refs
  )
}

export default {
  getAdminByDisplayName,
  getPendingDocuments,
  getPendingDocumentDetail,
  reviewDocument,
}
