import Joi from 'joi'

// 5 MB
const maxFileSize = 5 * 1024 * 1024
// Only allow image/audio
const mimeTypePattern = /^data:(image|audio)\/([a-zA-Z0-9\-+]+);base64,/

const createDocument = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
  description: Joi.string().trim().max(2048),
  course: Joi.number().integer().strict().min(1).required(),
  questions: Joi.array()
    .items(
      Joi.object({
        correct: Joi.string().trim().valid('A', 'B', 'C', 'D').required(),
        contents: Joi.array()
          .length(5)
          .items(
            Joi.object({
              text: Joi.string().trim().max(4096),
              attachment: Joi.string()
                .trim()
                .dataUri()
                .regex(mimeTypePattern)
                .max(maxFileSize),
              type: Joi.string()
                .trim()
                .valid('A', 'B', 'C', 'D', 'Q')
                .required(),
            }).or('text', 'attachment')
          )
          .unique('type')
          .required(),
      })
    )
    .min(1)
    .required(),
})

const getDocumentDetail = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})

const removeDocument = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})

const editDocument = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
  title: Joi.string().trim().min(8).max(256),
  description: Joi.string().trim().max(2048).allow(null),
  course: Joi.number().integer().strict().min(1),
  questions: Joi.array()
    .items(
      Joi.object({
        action: Joi.string().trim().valid('add', 'delete', 'edit').required(),
      })
        .when(Joi.object({ action: 'add' }).unknown(), {
          then: Joi.object({
            order: Joi.number().integer().strict().min(1).required(),
            correct: Joi.string().trim().valid('A', 'B', 'C', 'D').required(),
            contents: Joi.array()
              .length(5)
              .items(
                Joi.object({
                  text: Joi.string().trim().max(4096),
                  attachment: Joi.string()
                    .trim()
                    .dataUri()
                    .regex(mimeTypePattern)
                    .max(maxFileSize),
                  type: Joi.string()
                    .trim()
                    .valid('A', 'B', 'C', 'D', 'Q')
                    .required(),
                }).or('text', 'attachment')
              )
              .unique('type')
              .required(),
          }),
        })
        .when(Joi.object({ action: 'delete' }).unknown(), {
          then: Joi.object({
            id: Joi.number().integer().strict().min(1).required(),
          }),
        })
        .when(Joi.object({ action: 'edit' }).unknown(), {
          then: Joi.object({
            id: Joi.number().integer().strict().min(1).required(),
            order: Joi.number().integer().strict().min(1),
            correct: Joi.string().trim().valid('A', 'B', 'C', 'D'),
            contents: Joi.array()
              .items(
                Joi.object({
                  id: Joi.number().integer().strict().min(1).required(),
                  text: Joi.string().trim().max(4096).allow(null),
                  attachment: Joi.string()
                    .trim()
                    .dataUri()
                    .regex(mimeTypePattern)
                    .max(maxFileSize)
                    .allow(null),
                })
                  .or('text', 'attachment')
                  .custom((value, helpers) => {
                    if (value.text === null && value.attachment === null) {
                      return helpers.error('any.invalid')
                    }

                    return value
                  })
              )
              .min(1)
              .max(5),
          }).or('order', 'correct', 'contents'),
        })
    )
    .min(1),
}).or('title', 'description', 'course', 'questions')

const getDocuments = Joi.object({
  pagination: Joi.object({
    page: Joi.number().integer().strict().min(1).required(),
    perPage: Joi.number().integer().strict().min(1).required(),
  }),
  keyword: Joi.string().trim(),
  filter: Joi.date().timestamp(),
})

export default {
  createDocument,
  getDocumentDetail,
  removeDocument,
  editDocument,
  getDocuments,
}
