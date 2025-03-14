import documentSchema from '../schemas/documentSchema.js'
import cloudinaryService from '../services/cloudinaryService.js'
import contentService from '../services/contentService.js'
import courseService from '../services/courseService.js'
import documentService from '../services/documentService.js'
import questionService from '../services/questionService.js'
import { MESSAGE, STATUS_CODE } from '../utils/constantUtils.js'
import { sendResponse } from '../utils/responseUtils.js'

const createDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = documentSchema.createDocument.validate(req.body)
  const { title, description, course, questions } = value
  const totalQuestions = questions.length

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const isCourseExist = await courseService.isCourseExistById(course)
  if (!isCourseExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.COURSE.NOT_FOUND)
  }

  // Create document
  const document_id = await documentService.createDocument(
    title,
    description,
    totalQuestions,
    course,
    user_id
  )

  for (let i = 0; i < totalQuestions; i++) {
    const question = questions[i]

    // Create question
    const question_id = await questionService.createQuestion(
      i + 1,
      question.correct,
      document_id
    )

    for (const content of question.contents) {
      // Upload attachment to Cloudinary
      const attachment = await cloudinaryService.upload(content.attachment)

      // Create content
      await contentService.createContent(
        content.text,
        attachment?.secure_url,
        attachment?.public_id,
        content.type,
        question_id
      )
    }
  }

  return sendResponse(
    res,
    STATUS_CODE.CREATED,
    MESSAGE.DOCUMENT.CREATE_DOCUMENT_SUCCESS
  )
}

const getDocumentDetail = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = documentSchema.getDocumentDetail.validate(req.body)
  const { document } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const isDocumentExist = await documentService.isDocumentExist(document)
  if (!isDocumentExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document author
  const isDocumentAuthor = await documentService.isDocumentAuthor(
    user_id,
    document
  )
  if (!isDocumentAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.NOT_OWNED
    )
  }

  // Get document detail
  const documentDetail = await documentService.getDocumentDetail(document)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.GET_DOCUMENT_DETAIL_SUCCESS,
    documentDetail
  )
}

const deleteDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = documentSchema.deleteDocument.validate(req.body)
  const { document } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const isDocumentExist = await documentService.isDocumentExist(document)
  if (!isDocumentExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document author
  const isDocumentAuthor = await documentService.isDocumentAuthor(
    user_id,
    document
  )
  if (!isDocumentAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.NOT_OWNED
    )
  }

  // Get questions
  const questions = await questionService.getQuestions(document)
  for (const question of questions) {
    // Get contents
    const contents = await contentService.getContents(question.id)
    for (const content of contents) {
      // Destroy attachment in Cloudinary
      await cloudinaryService.destroy(content.attachment_id)
    }
  }

  // Delete document
  await documentService.deleteDocument(document)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.DELETE_DOCMENT_SUCCESS
  )
}

const editDocument = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = documentSchema.editDocument.validate(req.body)
  const { document, title, description, course, questions } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const isDocumentExist = await documentService.isDocumentExist(document)
  if (!isDocumentExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document author
  const isDocumentAuthor = await documentService.isDocumentAuthor(
    user_id,
    document
  )
  if (!isDocumentAuthor) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.DOCUMENT.NOT_OWNED
    )
  }

  // Check course exist
  if (course) {
    const isCourseExist = await courseService.isCourseExistById(course)
    if (!isCourseExist) {
      return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.COURSE.NOT_FOUND)
    }
  }

  // Edit document
  await documentService.editDocument(title, description, course, document)

  // Edit questions
  if (questions) {
    for (const question of questions) {
      switch (question.action) {
        case 'add': {
          // Check order valid
          const totalQuestions = documentService.getTotalQuestions(document)
          if (question.order > totalQuestions + 1) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.INVALID_ORDER
            )
          }

          // Arrange other questions in order before add
          await questionService.arrangeOrderBeforeAdd(question.order, document)

          // Create question
          const question_id = await questionService.createQuestion(
            question.order,
            question.correct,
            document
          )

          for (const content of question.contents) {
            // Upload attachment to Cloudinary
            const attachment = await cloudinaryService.upload(
              content.attachment
            )

            // Create content
            await contentService.createContent(
              content.text,
              attachment?.secure_url,
              attachment?.public_id,
              content.type,
              question_id
            )
          }

          break
        }

        case 'delete': {
          // Check total questions remain
          const totalQuestions = documentService.getTotalQuestions(document)
          if (totalQuestions === 1) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.LAST_REMAIN
            )
          }

          // Check question exist
          const isQuestionExist = await questionService.isQuestionExist(
            question.id
          )
          if (!isQuestionExist) {
            return sendResponse(
              res,
              STATUS_CODE.NOT_FOUND,
              MESSAGE.QUESTION.NOT_FOUND
            )
          }

          // Check question author
          const isQuestionAuthor = await questionService.isQuestionAuthor(
            user_id,
            document,
            question.id
          )
          if (!isQuestionAuthor) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.NOT_OWNED
            )
          }

          // Check question belong
          const isQuestionBelong = await questionService.isQuestionBelong(
            question.id,
            document
          )
          if (!isQuestionBelong) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.NOT_BELONGED
            )
          }

          // Get contents
          const contents = await contentService.getContents(question.id)
          for (const content of contents) {
            // Destroy attachment in Cloudinary
            await cloudinaryService.destroy(content.attachment_id)
          }

          // Delete question
          const questionOrder = await questionService.deleteQuestion(
            question.id
          )

          // Arrange other questions in order after delete
          await questionService.arrangeOrderAfterDelete(questionOrder, document)

          break
        }

        case 'edit': {
          // Check order valid
          if (question.order) {
            const totalQuestions = documentService.getTotalQuestions(document)
            if (question.order > totalQuestions) {
              return sendResponse(
                res,
                STATUS_CODE.BAD_REQUEST,
                MESSAGE.QUESTION.INVALID_ORDER
              )
            }
          }

          // Check question exist
          const isQuestionExist = await questionService.isQuestionExist(
            question.id
          )
          if (!isQuestionExist) {
            return sendResponse(
              res,
              STATUS_CODE.NOT_FOUND,
              MESSAGE.QUESTION.NOT_FOUND
            )
          }

          // Check question author
          const isQuestionAuthor = await questionService.isQuestionAuthor(
            user_id,
            document,
            question.id
          )
          if (!isQuestionAuthor) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.NOT_OWNED
            )
          }

          // Check question belong
          const isQuestionBelong = await questionService.isQuestionBelong(
            question.id,
            document
          )
          if (!isQuestionBelong) {
            return sendResponse(
              res,
              STATUS_CODE.BAD_REQUEST,
              MESSAGE.QUESTION.NOT_BELONGED
            )
          }

          // Get question
          const tempQuestion = await questionService.getQuestion(question.id)

          // Edit question
          await questionService.editQuestion(
            question.order,
            question.correct,
            question.id
          )

          // Arrange other questions in order after edit
          if (question.order) {
            await questionService.arrangeOrderAfterEdit(
              tempQuestion.order,
              question.order,
              question.id,
              document
            )
          }

          // Edit contents
          if (question.contents) {
            for (const content of question.contents) {
              // Check content exist
              const isContentExist = await contentService.isContentExist(
                content.id
              )
              if (!isContentExist) {
                return sendResponse(
                  res,
                  STATUS_CODE.NOT_FOUND,
                  MESSAGE.CONTENT.NOT_FOUND
                )
              }

              // Check content author
              const isContentAuthor = await contentService.isContentAuthor(
                user_id,
                document,
                question.id,
                content.id
              )
              if (!isContentAuthor) {
                return sendResponse(
                  res,
                  STATUS_CODE.BAD_REQUEST,
                  MESSAGE.CONTENT.NOT_OWNED
                )
              }

              // Check content belong
              const isContentBelong = await contentService.isContentBelong(
                content.id,
                question.id
              )
              if (!isContentBelong) {
                return sendResponse(
                  res,
                  STATUS_CODE.BAD_REQUEST,
                  MESSAGE.CONTENT.NOT_BELONGED
                )
              }

              // Get content
              const tempContent = await contentService.getContent(content.id)

              // Check content empty
              const isTextEmpty =
                tempContent.text === null && content.attachment === null
              const isAttachmentEmpty =
                content.text === null && tempContent.attachment_id === null
              if (isTextEmpty || isAttachmentEmpty) {
                return sendResponse(
                  res,
                  STATUS_CODE.BAD_REQUEST,
                  MESSAGE.CONTENT.EMPTY
                )
              }

              let secureUrl = undefined
              let publicId = undefined

              // Assign attachment to new value/null
              if (content.attachment !== undefined) {
                // Destroy attachment in Cloudinary
                await cloudinaryService.destroy(tempContent.attachment_id)
                secureUrl = null
                publicId = null

                // Assign attachment to new value
                if (content.attachment !== null) {
                  // Upload attachment to Cloudinary
                  const attachment = await cloudinaryService.upload(
                    content.attachment
                  )
                  secureUrl = attachment.secure_url
                  publicId = attachment.public_id
                }
              }

              // Edit content
              await contentService.editContent(
                content.text,
                secureUrl,
                publicId,
                content.id
              )
            }
          }

          break
        }
      }
    }

    // Update total questions
    await documentService.updateTotalQuestions(document)
  }

  // Update document
  await documentService.updateDocument(document)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.EDIT_DOCUMENT_SUCCESS
  )
}

const getDocuments = async (req, res) => {
  const { user_id } = req.user
  const { error, value } = documentSchema.getDocuments.validate(req.body)
  const { pagination, keyword, filter } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get documents
  const documents = await documentService.getDocuments(
    pagination,
    keyword,
    filter,
    user_id
  )

  // Check page valid
  if (pagination?.page > documents.total_pages) {
    return sendResponse(
      res,
      STATUS_CODE.NOT_FOUND,
      MESSAGE.PAGINATION.PAGE_NOT_VALID
    )
  }

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.DOCUMENT.GET_DOCUMENTS_SUCCESS,
    documents
  )
}

export default {
  createDocument,
  getDocumentDetail,
  deleteDocument,
  editDocument,
  getDocuments,
}
