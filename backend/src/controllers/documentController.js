import { isCourseExistById } from '../services/courseService.js'
import {
  insertDocument,
  insertQuestion,
  isDocumentExist,
  isOrderExist,
  isQuestionExceed,
} from '../services/documentService.js'
import {
  createDocumentShema,
  createQuestionShema,
} from '../shemas/documentShema.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Create a new document.
 */
export const createDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = createDocumentShema.validate(req.body)
  const { title, description, total_questions, course } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const existedCourse = await isCourseExistById(course)
  if (!existedCourse) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.COURSE.NOT_FOUND)
  }

  // Insert new document
  await insertDocument(title, description, total_questions, course, user_id)
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.DOCUMENT.CREATE_SUCCESS)
}

/**
 * Create a new question.
 */
export const createQuestion = async (req, res) => {
  const { error, value } = createQuestionShema.validate(req.body)
  const { order, correct, document } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const existedDocument = await isDocumentExist(document)
  if (!existedDocument) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.NOT_FOUND
    )
  }

  // Check order exist
  const existedOrder = await isOrderExist(order, document)
  if (existedOrder) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.QUESTION.EXISTED_ORDER
    )
  }

  // Check exceed total questions
  const exceededQuestion = await isQuestionExceed(document)
  if (exceededQuestion) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.QUESTION.EXCEEDED)
  }

  // Insert new question
  await insertQuestion(order, correct, document)
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.QUESTION.CREATE_SUCCESS)
}
