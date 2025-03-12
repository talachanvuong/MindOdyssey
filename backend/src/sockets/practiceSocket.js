import practiceService from '../services/practiceService.js'
import documentService from '../services/documentService.js'
import practiceSchema from '../schemas/practiceSchema.js'
import { MESSAGE } from '../utils/constantUtils.js'
import cloudinaryService from '../services/cloudinaryService.js'

const getStarted = async (socket, data, callback) => {
  const { error, value } = practiceSchema.doc_idValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  }

  const { doc_id } = value
  const doc_idExist = await documentService.isDocumentExist(doc_id)
  if (!doc_idExist) {
    return socket.emit('error', MESSAGE.DOCUMENT.NOT_FOUND)
  }
  const allQuestion = await practiceService.selectAllQuestions(doc_id)
  socket.allQuestionreuploaded = await cloudinaryService.reuploadAttachments(allQuestion)
  socket.start_time = new Date().toISOString()
  socket.questionOrder = []
  callback('ready')
}

const getNewQuestion = async (socket, callback) => {

  const filteredQuestions = socket.allQuestionreuploaded
    .filter((q) => !socket.questionOrder.includes(q.order))
    .map(({ correct_answer, ...rest }) => rest)

  if (filteredQuestions.length === 0) {
    return socket.emit('error', MESSAGE.PRACTICE.NO_QUESTION)
  }

  const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
  const question = filteredQuestions[randomIndex]

  socket.questionOrder.push(question.order)
  callback(question)
}

const postUserAnswer = async (socket, data, callback) => {
  const { error, value } = practiceSchema.answerValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  }
  const { userAnswer, order } = value
  const correct_answer = socket.allQuestionreuploaded.find(
    (q) => q.order === order
  )?.correct_answer
  let questionIndex = socket.allQuestionreuploaded.findIndex(
    (q) => q.order === order
  )
  if (questionIndex !== -1) {
    socket.allQuestionreuploaded[questionIndex].userAnswer = userAnswer
  }

  if (userAnswer == correct_answer) {
    return callback('Correct')
  } else {
    return callback('Incorrect')
  }
}

const finished = async (socket, data, callback) => {
  const { error, value } = practiceSchema.finishedValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  }
  const { user_id } = socket.user
  socket.end_time = new Date().toISOString()
  const { score } = value
  const practice_history_id = await practiceService.insertPracticeHistory(
    user_id,
    score,
    socket.allQuestionreuploaded,
    socket.start_time,
    socket.end_time
  )
  const result = await practiceService.selectPracticeHistorybyID(
    practice_history_id
  )
  return callback(result)
}

export default { getNewQuestion, postUserAnswer, getStarted, finished }
