import {
  createDocumentSchema,
  editDocumentSchema,
  getDocumentDetailSchema,
  getDocumentsSchema,
  removeDocumentSchema,
} from '../schemas/documentSchema.js'
import {
  destroyCloudinary,
  uploadCloudinary,
} from '../services/cloudinaryService.js'
import { isCourseExistById } from '../services/courseService.js'
import {
  arrangeOrderAfterDelete,
  arrangeOrderAfterUpdate,
  arrangeOrderBeforeInsert,
  confirmUpdateDocument,
  deleteDocument,
  deleteQuestion,
  illegalAccessDocument,
  insertContent,
  insertDocument,
  insertQuestion,
  isContentAuthor,
  isContentExist,
  isDocumentAuthor,
  isDocumentExist,
  isQuestionAuthor,
  isQuestionExist,
  selectContent,
  selectContents,
  selectDocument,
  selectDocuments,
  selectQuestion,
  selectQuestions,
  selectTotalQuestions,
  updateContent,
  updateDocument,
  updateQuestion,
} from '../services/documentService.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Create a new document.
 */
export const createDocument = async (req, res) => {
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
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.COURSE.NOT_FOUND)
  }

  // Insert new document in database
  const document_id = await insertDocument(
    title,
    description,
    totalQuestions,
    course,
    user_id
  )

  for (let i = 0; i < totalQuestions; i++) {
    const question = questions[i]

    // Insert new question in database
    const question_id = await insertQuestion(
      i + 1,
      question.correct,
      document_id
    )

    for (const content of question.content) {
      // Upload attachment to cloudinary
      const attachment = await uploadCloudinary(content.attachment)

      // Insert new content in database
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
  const { user_id } = req.user
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
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check illegal access
  const illegalAccess = await illegalAccessDocument(user_id, document)
  if (illegalAccess) {
    return sendResponse(res, STATUS_CODE.FORBIDDEN, MESSAGE.SERVER.PRIVACY)
  }

  // Get document detail in database
  const resultDocument = await selectDocument(document)
  Object.assign(result, resultDocument)
  result.questions = []

  // Get questions detail in database
  const resultQuestions = await selectQuestions(document)
  for (const resultQuestion of resultQuestions) {
    // Get contents detail in database
    const resultContents = await selectContents(resultQuestion.id)
    result.questions.push({
      ...resultQuestion,
      content: resultContents,
    })
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
export const removeDocument = async (req, res) => {
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
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document author
  const validDocumentAuthor = await isDocumentAuthor(user_id, document)
  if (!validDocumentAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.INVALID_AUTHOR
    )
  }

  // Get questions detail in database
  const resultQuestions = await selectQuestions(document)
  for (const resultQuestion of resultQuestions) {
    // Get contents detail in database
    const resultContents = await selectContents(resultQuestion.question_id)
    for (const resultContent of resultContents) {
      // Remove attachment in cloudinary
      if (resultContent.attachment) {
        await destroyCloudinary(resultContent.attachment_id)
      }
    }
  }

  // Delete document in database
  await deleteDocument(document)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.DOCUMENT.REMOVE_SUCCESS)
}

/**
 * Edit a document.
 */
export const editDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = editDocumentSchema.validate(req.body)
  const { document, title, description, course, questions } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const existedDocument = await isDocumentExist(document)
  if (!existedDocument) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document author
  const validDocumentAuthor = await isDocumentAuthor(user_id, document)
  if (!validDocumentAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.INVALID_AUTHOR
    )
  }

  // Check course exist if defined
  if (course) {
    const existedCourse = await isCourseExistById(course)
    if (!existedCourse) {
      return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.COURSE.NOT_FOUND)
    }
  }

  // Update document in database
  await updateDocument(title, description, course, document)

  // Update questions in database
  if (questions) {
    for (const question of questions) {
      // Case: add
      if (question.action === 'add') {
        // Check order valid
        const totalQuestions = selectTotalQuestions(document)
        if (question.order > totalQuestions + 1) {
          return sendResponse(
            res,
            STATUS_CODE.BAD_REQUEST,
            MESSAGE.QUESTION.INVALID_ORDER
          )
        }

        // Arrange other question order before insert
        await arrangeOrderBeforeInsert(question.order, document)

        // Insert new question in database
        const question_id = await insertQuestion(
          question.order,
          question.correct,
          document
        )

        for (const content of question.content) {
          // Upload attachment to cloudinary
          const attachment = await uploadCloudinary(content.attachment)

          // Insert new content in database
          await insertContent(
            content.text,
            attachment?.secure_url,
            attachment?.public_id,
            content.type,
            question_id
          )
        }
      }
      // Case: remove
      else if (question.action === 'remove') {
        // Check total questions remain
        const totalQuestions = selectTotalQuestions(document)
        if (totalQuestions === 1) {
          return sendResponse(
            res,
            STATUS_CODE.BAD_REQUEST,
            MESSAGE.QUESTION.LAST
          )
        }

        // Check question exist
        const existedQuestion = await isQuestionExist(question.id)
        if (!existedQuestion) {
          return sendResponse(
            res,
            STATUS_CODE.NOT_FOUND,
            MESSAGE.QUESTION.NOT_FOUND
          )
        }

        // Check question author
        const validQuestionAuthor = await isQuestionAuthor(
          user_id,
          document,
          question.id
        )
        if (!validQuestionAuthor) {
          return sendResponse(
            res,
            STATUS_CODE.BAD_REQUEST,
            MESSAGE.QUESTION.INVALID_AUTHOR
          )
        }

        // Get contents detail in database
        const resultContents = await selectContents(question.id)
        for (const resultContent of resultContents) {
          // Remove attachment in cloudinary
          if (resultContent.attachment) {
            await destroyCloudinary(resultContent.attachment_id)
          }
        }

        // Delete queston in database
        const order = await deleteQuestion(question.id)

        // Arrange other question order after delete
        await arrangeOrderAfterDelete(order, document)
      }
      // Case: edit
      else if (question.action === 'edit') {
        // Check question exist
        const existedQuestion = await isQuestionExist(question.id)
        if (!existedQuestion) {
          return sendResponse(
            res,
            STATUS_CODE.NOT_FOUND,
            MESSAGE.QUESTION.NOT_FOUND
          )
        }

        // Check question author
        const validQuestionAuthor = await isQuestionAuthor(
          user_id,
          document,
          question.id
        )
        if (!validQuestionAuthor) {
          return sendResponse(
            res,
            STATUS_CODE.BAD_REQUEST,
            MESSAGE.QUESTION.INVALID_AUTHOR
          )
        }

        // Check order valid if defined
        if (question.order) {
          const totalQuestions = selectTotalQuestions(document)
          if (question.order > totalQuestions) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.INVALID_ORDER
            )
          }
        }

        // Get order of question
        const resultQuestion = await selectQuestion(question.id)

        // Update queston in database
        await updateQuestion(question.order, question.correct, question.id)

        // Arrange other question order before update
        await arrangeOrderAfterUpdate(
          resultQuestion.order,
          question.order,
          question.id,
          document
        )

        // Update contents in database
        if (question.content) {
          for (const content of question.content) {
            // Check content exist
            const existedContent = await isContentExist(content.id)
            if (!existedContent) {
              return sendResponse(
                res,
                STATUS_CODE.NOT_FOUND,
                MESSAGE.CONTENT.NOT_FOUND
              )
            }

            // Check content author
            const validContentAuthor = await isContentAuthor(
              user_id,
              document,
              question.id,
              content.id
            )
            if (!validContentAuthor) {
              return sendResponse(
                res,
                STATUS_CODE.BAD_REQUEST,
                MESSAGE.CONTENT.INVALID_AUTHOR
              )
            }

            // Set attachment to null
            if (content.attachment === null) {
              // Get attachment_id of content
              const resultContent = await selectContent(content.id)

              // Neither text nor attachment can be null
              if (resultContent.text === null) {
                return sendResponse(
                  res,
                  STATUS_CODE.BAD_REQUEST,
                  MESSAGE.CONTENT.EMPTY
                )
              }

              // Remove attachment in cloudinary
              await destroyCloudinary(resultContent.attachment_id)

              // Update content in database
              await updateContent(content.text, null, null, content.id)
            }
            // Set attachment to new value
            else if (content.attachment !== undefined) {
              // Upload attachment to cloudinary
              const attachment = await uploadCloudinary(content.attachment)

              // Get attachment_id of content
              const resultContent = await selectContent(content.id)
              // Remove attachment in cloudinary
              await destroyCloudinary(resultContent.attachment_id)

              // Update content in database
              await updateContent(
                content.text,
                attachment.secure_url,
                attachment.public_id,
                content.id
              )
            }
            // Only set text to new value/null
            else {
              // Get attachment_id of content
              const resultContent = await selectContent(content.id)

              // Neither text nor attachment can be null
              if (
                content.text === null &&
                resultContent.attachment_id === null
              ) {
                return sendResponse(
                  res,
                  STATUS_CODE.BAD_REQUEST,
                  MESSAGE.CONTENT.EMPTY
                )
              }

              // Update content in database
              await updateContent(
                content.text,
                undefined,
                undefined,
                content.id
              )
            }
          }
        }
      }
    }
  }

  // Confirm update document in database
  await confirmUpdateDocument(document)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.DOCUMENT.EDIT_SUCCESS)
}

/**
 * Get documents.
 */
export const getDocuments = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = getDocumentsSchema.validate(req.body)
  const { pagination, keyword, filter } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get documents in database
  const resultDocuments = await selectDocuments(
    pagination,
    keyword,
    filter,
    user_id
  )

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.GET_SUCCESS,
    resultDocuments
  )
}
