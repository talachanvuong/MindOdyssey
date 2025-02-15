import client from '../db/db.js'

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
