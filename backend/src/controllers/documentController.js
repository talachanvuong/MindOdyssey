import { uploadCloudinary } from '../services/cloudinaryService.js'
import { isCourseExistById } from '../services/courseService.js'
import {
  insertContent,
  insertDocument,
  insertQuestion,
} from '../services/documentService.js'
import { createDocumentShema } from '../shemas/documentShema.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Create a new document.
 */
export const createDocument = async (uploadedImages, req, res) => {
  const { user_id } = req.user
  const { error, value } = createDocumentShema.validate(req.body)
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

    for (let j = 0; j < question.content.length; j++) {
      const content = question.content[j]

      // Upload cloudinary
      const attachment = await uploadCloudinary(content.attachment)

      // Store uploaded image public_id
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
