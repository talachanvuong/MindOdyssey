import {
  destroyCloudinary,
  uploadCloudinary,
} from '../services/cloudinaryService.js'
import { isCourseExistById } from '../services/courseService.js'
import {
  deleteDocument,
  insertContent,
  insertDocument,
  insertQuestion,
  isDocumentAuthor,
  isDocumentExist,
  selectContents,
  selectDocument,
  selectQuestions,
} from '../services/documentService.js'
import {
  createDocumentSchema,
  getDocumentDetailSchema,
  removeDocumentSchema,
} from '../schemas/documentSchema.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'
import { timeConvert } from '../utils/convert.js'

/**
 * Create a new document.
 */
export const createDocument = async (uploadedImages, req, res) => {
  const { user_id } = req.user
  const { error, value } = createDocumentSchema.validate(req.body)
  const { title, description, course, questions } = value
  const totalQuestions = questions.length

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
  const document_id = await insertDocument(
    title,
    description,
    totalQuestions,
    course,
    user_id
  )

  for (let i = 0; i < totalQuestions; i++) {
    const question = questions[i]

    // Insert new question
    const question_id = await insertQuestion(
      i + 1,
      question.correct,
      document_id
    )

    for (const content of question.content) {
      // Upload attachment to cloudinary
      const attachment = await uploadCloudinary(content.attachment)

      // Store public_id of uploaded images
      if (attachment) {
        uploadedImages.push(attachment.public_id)
      }

      // Insert new content
      await insertContent(
        content.text,
        attachment?.secure_url,
        attachment?.public_id,
        content.type,
        question_id
      )
    }
  }

  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.DOCUMENT.CREATE_SUCCESS)
}

/**
 * Get the details of a document.
 */
export const getDocumentDetail = async (req, res) => {
  const { error, value } = getDocumentDetailSchema.validate(req.body)
  const { document } = value
  const result = {}

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

  // Get document detail
  const resultDocument = await selectDocument(document)
  result.title = resultDocument.title
  result.description = resultDocument.description
  result.total_questions = resultDocument.total_questions
  result.course = resultDocument.course
  result.author = resultDocument.author
  result.created_at = timeConvert(resultDocument.created_at)
  result.last_updated = timeConvert(resultDocument.last_updated)
  result.status = resultDocument.status
  result.reviewer = resultDocument.reviewer
  result.reject_reason = resultDocument.reject_reason
  result.questions = []

  // Get questions detail
  const resultQuestions = await selectQuestions(document)
  for (let i = 0; i < resultQuestions.length; i++) {
    const resultQuestion = resultQuestions[i]
    result.questions.push({
      id: resultQuestion.question_id,
      content: [],
      correct: resultQuestion.correct_answer,
    })

    // Get contents detail
    const resultContents = await selectContents(resultQuestion.question_id)
    for (const resultContent of resultContents) {
      result.questions[i].content.push({
        id: resultContent.content_id,
        text: resultContent.text,
        attachment: resultContent.attachment,
        attachment_id: resultContent.attachment_id,
        type: resultContent.type,
      })
    }
  }

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.GET_SUCCESS,
    result
  )
}

/**
 * Remove a document.
 */
export const removeDocument = async (destroyedImages, req, res) => {
  const { user_id } = req.user
  const { error, value } = removeDocumentSchema.validate(req.body)
  const { document } = value

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

  // Check document author
  const validAuthor = await isDocumentAuthor(user_id, document)
  if (!validAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.INVALID_AUTHOR
    )
  }

  // Get questions detail
  const resultQuestions = await selectQuestions(document)
  for (const resultQuestion of resultQuestions) {
    // Get contents detail
    const resultContents = await selectContents(resultQuestion.question_id)
    for (const resultContent of resultContents) {
      // Remove attachment in cloudinary
      if (resultContent.attachment) {
        await destroyCloudinary(resultContent.attachment_id).then(() =>
          // Store public_id of destroyed images
          destroyedImages.push(resultContent.attachment_id)
        )
      }
    }
  }

  // Delete document in database
  await deleteDocument(document)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.DOCUMENT.REMOVE_SUCCESS)
}
