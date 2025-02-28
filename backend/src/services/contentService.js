import client from '../db/db.js'

const isContentExist = async (content_id) => {
  const result = await client.query(
    `SELECT 1
     FROM contents
     WHERE content_id = $1
     LIMIT 1;`,
    [content_id]
  )

  return result.rowCount > 0
}

const createContent = async (
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

const getContents = async (question_id) => {
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

const isContentAuthor = async (
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

const editContent = async (text, attachment, attachment_id, content_id) => {
  const updates = []
  const refs = [content_id]
  let index = 2

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
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE contents
       SET ${updates.join(', ')}
       WHERE content_id = $1;`,
      refs
    )
  }
}

const getContent = async (content_id) => {
  const result = await client.query(
    `SELECT
      text,
      attachment_id
     FROM contents
     WHERE content_id = $1
     LIMIT 1;`,
    [content_id]
  )

  return result.rows[0]
}

const isContentBelong = async (content_id, question_id) => {
  const result = await client.query(
    `SELECT 1
     FROM contents
     WHERE content_id = $1
     AND question_id = $2
     LIMIT 1;`,
    [content_id, question_id]
  )

  return result.rowCount > 0
}

export default {
  isContentExist,
  createContent,
  getContents,
  isContentAuthor,
  editContent,
  getContent,
  isContentBelong,
}
