import client from '../db/db.js'
const selectDocumentforPractice = async (keyword, page, limit, course_id) => {
  const offset = (page - 1) * limit
  let query = `
    SELECT 
        d.document_id,
        d.title AS document_title,
        d.description,
        d.total_questions,
        c.title AS course_title,
        u.display_name AS creater,
        u.user_id 
    FROM documents d
    JOIN courses c ON d.course_id = c.course_id
    JOIN users u ON d.user_id = u.user_id
    WHERE d.status = 'Đã duyệt'
`

  let values = []
  if (keyword) {
    values.push(`%${keyword}%`)
    query += ` AND(d.title ILIKE $${values.length} OR d.description ILIKE $${values.length}) `
  }
  if (course_id) {
    values.push(course_id)
    query += ` AND d.course_id = $${values.length}`
  }
  values.push(limit, offset)
  query += ` ORDER BY d.created_at DESC LIMIT $${values.length - 1} OFFSET $${
    values.length
  }`
  const result = await client.query(query, values)

  return result.rows
}
const countDocumentsByKeyword = async (keyword, limit, course_id) => {
  let countQuery = `
        SELECT COUNT(*) AS total
        FROM documents as d
        WHERE status='Đã duyệt'
    `
  let values = []
  if (keyword) {
    values.push(`%${keyword}%`)
    countQuery += ` AND(d.title ILIKE $${values.length} OR d.description ILIKE $${values.length}) `
  }
  if (course_id) {
    values.push(course_id)
    countQuery += ` AND course_id = $${values.length}`
  }
  const countResult = await client.query(countQuery, values)
  const totalDocs = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalDocs / limit)
  return { totalPages, totalDocs }
}

const selectAllQuestions = async (doc_id) => {
  const query = `
  SELECT 
    q.question_id,
    q.order,
    q.correct_answer,
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'content_id', c.content_id,
        'text', c.text,
        'attachment', c.attachment,
        'attachment_id', c.attachment_id,
        'type', c.type
      )
    ) AS contents
  FROM 
    questions q
  LEFT JOIN 
    contents c 
  ON 
    q.question_id = c.question_id
  WHERE q.document_id = $1
  GROUP BY q.question_id, q.order, q.correct_answer
  ORDER BY q.order;  -- Sắp xếp theo thứ tự câu hỏi
  `

  const result = await client.query(query, [doc_id])
  return result.rows
}

const insertPracticeHistory = async (
  user_id,
  score,
  detail,
  start_time,
  end_time
) => {
  const query = `
    INSERT INTO practice_histories (user_id, score, detail,start_time,end_time)
    VALUES ($1, $2, $3::jsonb,$4,$5)
    RETURNING practice_history_id
  `
  const result = await client.query(query, [
    user_id,
    score,
    JSON.stringify(detail),
    start_time,
    end_time,
  ])
  return result.rows[0].practice_history_id
}

const selectPracticeHistory = async (user_id, limit, page) => {
  const offset = (page - 1) * limit
  const query = `
    SELECT 
      score,
      detail,
      start_time,
      end_time
    FROM 
      practice_histories
    WHERE 
      user_id = $1
    ORDER BY 
      start_time DESC
    LIMIT $2 OFFSET $3
  `
  const result = await client.query(query, [user_id, limit, offset])
  return result.rows
}
const countPracticeHistory = async (user_id, limit) => {
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM practice_histories
    WHERE user_id = $1
  `
  const countResult = await client.query(countQuery, [user_id])
  const totalPracticeHistory = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalPracticeHistory / limit)
  return { totalPages, totalPracticeHistory }
}

const selectPracticeHistorybyID = async (practice_history_id) => {
  const query = `
    SELECT 
      score,
      detail,
      start_time,
      end_time
    FROM 
      practice_histories
    WHERE 
      practice_history_id= $1
  `
  const result = await client.query(query, [practice_history_id])
  return result.rows
}

const selectDocumentbyUserId = async (user_id, limit,page) => {
  const offset = (page - 1) * limit

  const query = `
    SELECT 
      d.document_id,
      d.title AS document_title,
      d.description,
      d.total_questions,
      c.title AS course_title,
      u.display_name AS creater,
      u.user_id 
    FROM 
      documents d
    JOIN courses c ON d.course_id = c.course_id
    JOIN users u ON d.user_id = u.user_id
    WHERE 
      d.status = 'Đã duyệt' AND d.user_id = $1
    ORDER BY 
      d.created_at DESC
    LIMIT $2 OFFSET $3
  `

  const result = await client.query(query, [user_id, limit, offset])
  return result.rows
}

const countDocumentsByUserId = async (user_id,limit) => {
  const countQuery = `
    SELECT COUNT(*) AS total FROM documents 
    WHERE status = 'Đã duyệt' AND user_id = $1
  `
  const countResult = await client.query(countQuery, [user_id])
  const totalDocs = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalDocs / limit)
  return { totalPages, totalDocs }
}
const isUserIDExist = async (user_id) => {
  const query = `
        SELECT 1
        FROM users
        WHERE user_id = $1
        LIMIT 1;
    `
  const result = await client.query(query, [user_id])
  return result.rowCount > 0
}
export default {
  selectDocumentforPractice,
  countDocumentsByKeyword,
  selectAllQuestions,
  insertPracticeHistory,
  selectPracticeHistory,
  countPracticeHistory,
  selectPracticeHistorybyID,
  selectDocumentbyUserId,
  countDocumentsByUserId,
  isUserIDExist
}
