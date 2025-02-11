import client from '../db/db.js'

/**
 * Select total unapproved documents.
 */
export const selectTotalUnapprovedDocuments = async () => {
  const result = await client.query(
    `SELECT COUNT(*) AS total_unapproved_documents
     FROM documents
     WHERE status = 'Chưa duyệt';`
  )
  return parseInt(result.rows[0].total_unapproved_documents)
}
