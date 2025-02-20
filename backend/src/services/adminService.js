import client from '../db/db.js'
import { timeConvert } from '../utils/convert.js'

export const selectTotalUnapprovedDocuments = async () => {
  const result = await client.query(
    `SELECT COUNT(*) AS total_unapproved_documents
     FROM documents
     WHERE status = 'Chưa duyệt';`
  )
  return parseInt(result.rows[0].total_unapproved_documents)
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
  if (reason) {
    updates.push(`reason_reject = $${index}`)
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
