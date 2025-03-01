import practiceService from '../services/practiceService.js'
import {isDocumentExist,isQuestionExist} from '../services/documentService.js'
import practiceSchema from '../schemas/practiceSchema.js'
import { MESSAGE } from '../utils/constant.js'
import {reuploadAttachments} from '../services/cloudinaryService.js'

const getStarted = async (socket,data,callback)=>{
  const {user_id} = socket.user
  const {error,value}=practiceSchema.doc_idValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  }
  const {doc_id}=value
  //check doc_id exist
  const doc_idExist = await isDocumentExist(doc_id)
  if(!doc_idExist){
    return socket.emit('error', MESSAGE.DOCUMENT.NOT_FOUND)
  }
  const allQuestion = await practiceService.selectAllQuestions(doc_id)
  //reupload
  const allQuestionreuploaded = await reuploadAttachments(allQuestion)
 
  const practice_history_id = await practiceService.insertPracticeHistory(user_id,0,allQuestionreuploaded)
  callback(practice_history_id)
}

const getNewQuestion = async (socket,data, callback) => {
  
  const {error,value}=practiceSchema.getNewQuestionValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  }
  const {doc_id,questionorder}=value
  const doc_idExist = await isDocumentExist(doc_id)
  if(!doc_idExist){
    return socket.emit('error', MESSAGE.DOCUMENT.NOT_FOUND)
  }

  const question = await practiceService.sendQuestion(doc_id, questionorder)
  if (!question) return socket.emit('error', MESSAGE.PRACTICE.NO_QUESTION)
  callback(question)
}

const postUserAnswer = async (socket,data,callback) => {
  const { error,value } = practiceSchema.answerValidate.validate(
    data
  )
  if (error) {
    return socket.emit('error', error.details[0].message)
  }
  const {userAnswer,question_id,practice_history_id}=value
  const practice_history_idExist = await practiceService.ispractice_history_idExist(practice_history_id)
  if(!practice_history_idExist) {
    return socket.emit('error', MESSAGE.PRACTICE.NOT_EXIST)
  }
  const QuestionExist = await isQuestionExist(question_id)
  if(!QuestionExist) {
    return socket.emit('error', MESSAGE.DOCUMENT.NO_QUESTION)
  }
  const correct_answer = await practiceService.selectCorrectAnswer(question_id)
  await practiceService.updatePracticeHistory(userAnswer ,question_id,practice_history_id)
  
  if (userAnswer == correct_answer) {
    return callback('Correct')
  }
  else {
    return callback('Incorrect')
  }
}


const finished = async (socket,data,callback) => {
  const {error,value} = practiceSchema.finishedValidate.validate(data)
  if (error) {
    return socket.emit('error', error.details[0].message)
  } 
  const {practice_history_id,score}=value
  const practice_history_idExist = await practiceService.ispractice_history_idExist(practice_history_id)
  if(!practice_history_idExist) {
    return socket.emit('error', MESSAGE.PRACTICE.NOT_EXIST)
  }
  await practiceService.updateScore(score,practice_history_id)
  const result = await practiceService.selectPracticeHistorybyID(practice_history_id)
  return callback(result)
}

export default {  getNewQuestion, postUserAnswer,getStarted,finished }
