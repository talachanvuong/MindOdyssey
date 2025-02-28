import client from '../db/db.js'

const isQuestionExist = async (question_id) => {
  const result = await client.query(
    `SELECT 1
     FROM questions
     WHERE question_id = $1
     LIMIT 1;`,
    [question_id]
  )

  return result.rowCount > 0
}

const createQuestion = async (order, correct_answer, document_id) => {
  const result = await client.query(
    `INSERT INTO questions ("order", correct_answer, document_id)
     VALUES ($1, $2, $3)
     RETURNING question_id;`,
    [order, correct_answer, document_id]
  )

  return result.rows[0].question_id
}

const getQuestions = async (document_id) => {
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

const isQuestionAuthor = async (user_id, document_id, question_id) => {
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

const editQuestion = async (order, correct_answer, question_id) => {
  const updates = []
  const refs = [question_id]
  let index = 2

  if (order) {
    updates.push(`"order" = $${index}`)
    refs.push(order)
    index++
  }

  if (correct_answer) {
    updates.push(`correct_answer = $${index}`)
    refs.push(correct_answer)
  }

  if (updates.length > 0) {
    await client.query(
      `UPDATE questions
       SET ${updates.join(', ')}
       WHERE question_id = $1;`,
      refs
    )
  }
}

const deleteQuestion = async (question_id) => {
  const result = await client.query(
    `DELETE FROM questions
     WHERE question_id = $1
     RETURNING "order";`,
    [question_id]
  )

  return result.rows[0].order
}

const getQuestion = async (question_id) => {
  const result = await client.query(
    `SELECT "order"
     FROM questions
     WHERE question_id = $1
     LIMIT 1;`,
    [question_id]
  )

  return result.rows[0]
}

const arrangeOrderAfterDelete = async (order, document_id) => {
  await client.query(
    `UPDATE questions
     SET "order" = "order" - 1
     WHERE "order" > $1
     AND document_id = $2;`,
    [order, document_id]
  )
}

const arrangeOrderBeforeInsert = async (order, document_id) => {
  await client.query(
    `UPDATE questions
     SET "order" = "order" + 1
     WHERE "order" >= $1
     AND document_id = $2;`,
    [order, document_id]
  )
}

const arrangeOrderAfterUpdate = async (
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

const isQuestionBelong = async (question_id, document_id) => {
  const result = await client.query(
    `SELECT 1
     FROM questions
     WHERE question_id = $1
     AND document_id = $2
     LIMIT 1;`,
    [question_id, document_id]
  )

  return result.rowCount > 0
}

export default {
  isQuestionExist,
  createQuestion,
  getQuestions,
  isQuestionAuthor,
  editQuestion,
  deleteQuestion,
  getQuestion,
  arrangeOrderAfterDelete,
  arrangeOrderBeforeInsert,
  arrangeOrderAfterUpdate,
  isQuestionBelong,
}
