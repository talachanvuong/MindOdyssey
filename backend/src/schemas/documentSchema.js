import Joi from 'joi'

// 5 MB
const maxFileSize = 5 * 1024 * 1024
// ~ 6.67 MB (↑33%)
const maxBase64Length = Math.ceil((maxFileSize * 4) / 3)
// Only allow image/audio
const mimeTypePattern = /^data:(image|audio)\/([a-zA-Z0-9\-+]+);base64,/

export const createDocumentSchema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
  description: Joi.string().trim().max(2048),
  course: Joi.number().integer().strict().min(1).required(),
  questions: Joi.array()
    .items(
      Joi.object({
        content: Joi.array()
          .length(5)
          .items(
            Joi.object({
              text: Joi.string().trim().max(4096),
              attachment: Joi.string()
                .trim()
                .dataUri()
                .regex(mimeTypePattern)
                .max(maxBase64Length),
              type: Joi.string()
                .trim()
                .valid('A', 'B', 'C', 'D', 'Q')
                .required(),
            }).or('text', 'attachment')
          )
          .unique('type')
          .required(),
        correct: Joi.string().trim().valid('A', 'B', 'C', 'D').required(),
      })
    )
    .min(1)
    .required(),
})

export const getDocumentDetailSchema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})

export const removeDocumentSchema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})

export const editDocumentSchema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
  title: Joi.string().trim().min(8).max(256),
  description: Joi.string().trim().max(2048).allow(null),
  course: Joi.number().integer().strict().min(1),
  questions: Joi.array()
    .items(
      Joi.object({
        action: Joi.string().trim().valid('add', 'remove', 'edit').required(),
      })
        .when(Joi.object({ action: 'add' }).unknown(), {
          then: Joi.object({
            content: Joi.array()
              .length(5)
              .items(
                Joi.object({
                  text: Joi.string().trim().max(4096),
                  attachment: Joi.string()
                    .trim()
                    .dataUri()
                    .regex(mimeTypePattern)
                    .max(maxBase64Length),
                  type: Joi.string()
                    .trim()
                    .valid('A', 'B', 'C', 'D', 'Q')
                    .required(),
                }).or('text', 'attachment')
              )
              .unique('type')
              .required(),
            order: Joi.number().integer().strict().min(1).required(),
            correct: Joi.string().trim().valid('A', 'B', 'C', 'D').required(),
          }),
        })
        .when(Joi.object({ action: 'remove' }).unknown(), {
          then: Joi.object({
            id: Joi.number().integer().strict().min(1).required(),
          }),
        })
        .when(Joi.object({ action: 'edit' }).unknown(), {
          then: Joi.object({
            id: Joi.number().integer().strict().min(1).required(),
            content: Joi.array()
              .items(
                Joi.object({
                  id: Joi.number().integer().strict().min(1).required(),
                  text: Joi.string().trim().max(4096).allow(null),
                  attachment: Joi.string()
                    .trim()
                    .dataUri()
                    .regex(mimeTypePattern)
                    .max(maxBase64Length)
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
            order: Joi.number().integer().strict().min(1),
            correct: Joi.string().trim().valid('A', 'B', 'C', 'D'),
          }).or('order', 'correct', 'content'),
        })
    )
    .min(1),
}).or('title', 'description', 'course', 'questions')
