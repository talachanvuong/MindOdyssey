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
        u.display_name AS creater
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

const sendQuestion = async (doc_id, questionorder) => {
  const query = `
    SELECT 
      q.question_id,
      q."order",
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
    WHERE 
      q.document_id = $1
      AND (
        cardinality($2::int[]) = 0 
        OR q."order" NOT IN (SELECT unnest($2::int[]))
      )
    GROUP BY 
      q.question_id, q."order", q.correct_answer
    LIMIT 1;
  `

  const result = await client.query(query, [doc_id, questionorder])
  return result.rows[0] // Chỉ trả về một câu hỏi
}

const selectCorrectAnswer = async (question_id) => {
  const query = `
    SELECT correct_answer
    FROM questions
    WHERE question_id=$1
    LIMIT 1
  `
  const result = await client.query(query, [question_id])
  return result.rows[0].correct_answer
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

const insertPracticeHistory = async (user_id, score, detail) => {
  const query = `
    INSERT INTO practice_histories (user_id, score, detail)
    VALUES ($1, $2, $3::jsonb)
    RETURNING practice_history_id
  `
  const result = await client.query(query, [user_id, score, JSON.stringify(detail)])
  return result.rows[0].practice_history_id
}

const updatePracticeHistory = async (
  userAnswer,
  question_id,
  practice_history_id
) => {
  const query = `
    UPDATE practice_histories
SET detail = (
  SELECT jsonb_agg(
    CASE 
      WHEN obj->>'question_id' = $2::text 
      THEN jsonb_set(obj, '{userAnswer}', to_jsonb($1::text))
      ELSE obj 
    END
  )
  FROM jsonb_array_elements(detail) AS obj
)
WHERE practice_history_id = $3;
  `

  return await client.query(query, [userAnswer, question_id, practice_history_id])
}
const selectPracticeHistory = async (user_id, limit, page) => {
  const offset = (page - 1) * limit
  const query = `
    SELECT 
      score,
      detail,
      created_at
    FROM 
      practice_histories
    WHERE 
      user_id = $1
    ORDER BY 
      created_at DESC
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

const updateScore = async(score,practice_history_id) =>{
  const query = `
    UPDATE practice_histories
    SET 
    score = $1,
    WHERE 
    practice_history_id = $2;

  `
  await client.query(query,[score,practice_history_id])
}
const ispractice_history_idExist = async (practice_history_id)=>{
  const query = `
      SELECT 1
      FROM practice_histories
      WHERE practice_history_id = $1
      LIMIT 1
  `
  const result = await client.query(query,[practice_history_id])
  return result.rowCount>0
}

const selectPracticeHistorybyID = async(practice_history_id)=>{
  const query=`
    SELECT 
      score,
      detail,
      created_at
    FROM 
      practice_histories
    WHERE 
      practice_history_id= $1
  `
  const result = await client.query(query,[practice_history_id])
  return result.rows
}

export default {
  selectDocumentforPractice,
  countDocumentsByKeyword,
  sendQuestion,
  selectAllQuestions,
  insertPracticeHistory,
  selectCorrectAnswer,
  selectPracticeHistory,
  countPracticeHistory,
  updatePracticeHistory,
  ispractice_history_idExist,
  selectPracticeHistorybyID,
  updateScore
}
