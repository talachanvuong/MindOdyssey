import bcrypt from 'bcryptjs'
import client from '../db/db.js'
import { timeConvert } from '../utils/convert.js'

export const isMatchedPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const isReviewedDocument = async (document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM documents
     WHERE status <> 'Chưa duyệt'
     AND document_id = $1
     LIMIT 1;`,
    [document_id]
  )
  return result.rowCount > 0
}

export const selectAdminByDisplayName = async (display_name) => {
  const result = await client.query(
    `SELECT admin_id, "password"
     FROM admins
     WHERE display_name = $1;`,
    [display_name]
  )
  return result.rows[0]
}

export const updateDocument = async (
  admin_id,
  isApproved,
  reason,
  document_id
) => {
  const updates = []
  const refs = []
  let index = 3

  // Reviewer
  updates.push('admin_id = $1')
  refs.push(admin_id)

  // Status
  updates.push('status = $2')
  refs.push(isApproved ? 'Đã duyệt' : 'Từ chối')

  // Reason
  if (reason !== undefined) {
    updates.push(`reject_reason = $${index}`)
    refs.push(reason)
    index++
  }

  await client.query(
    `UPDATE documents
     SET ${updates.join(', ')}
     WHERE document_id = $${index};`,
    [...refs, document_id]
  )
}

export const selectDocuments = async (pagination, keyword, filter) => {
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
    conditions.push(`title ILIKE $${index}`)
    refs.push(`%${keyword}%`)
    index++
  }

  if (filter) {
    conditions.push(`created_at >= $${index}`)
    refs.push(new Date(filter).toISOString())
    index++
  }

  const result = await client.query(
    `SELECT
      document_id,
      title,
      created_at,
      COUNT(*) OVER() AS total_pages
     FROM documents
     WHERE status = $${index}
     ${conditions.map((condition) => `AND ${condition}`).join(' ')}
     ${options.join(' ')};`,
    [...refs, 'Chưa duyệt']
  )
  return result.rows.map((row) => ({
    ...row,
    created_at: timeConvert(row.created_at),
    total_pages: parseInt(row.total_pages),
  }))
}

export const selectDocumentDetail = async (document_id) => {
  const result = await client.query(
    `SELECT
      d.title,
      d.description,
      c.title AS course,
      u.display_name AS author,
      d.created_at,
      d.last_updated,
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
        ) ORDER BY q."order"
      ) AS questions
     FROM documents AS d
     INNER JOIN courses AS c
     ON d.course_id = c.course_id
     INNER JOIN users AS u
     ON d.user_id = u.user_id
     INNER JOIN questions AS q
     ON d.document_id = q.document_id
     WHERE d.document_id = $1
     GROUP BY
      d.title,
      d.description,
      c.title,
      u.display_name,
      d.created_at,
      d.last_updated;`,
    [document_id]
  )
  return result.rows.map((row) => ({
    ...row,
    created_at: timeConvert(row.created_at),
    last_updated: timeConvert(row.last_updated),
  }))[0]
}
