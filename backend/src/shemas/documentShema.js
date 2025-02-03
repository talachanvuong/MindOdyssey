import Joi from 'joi'

// 5 MB
const maxFileSize = 5 * 1024 * 1024
// ~ 6.67 MB (↑33%)
const maxBase64Length = Math.ceil((maxFileSize * 4) / 3)
// Only allow image/audio
const mimeTypePattern = /^data:(image|audio)\/([a-zA-Z0-9\-+]+);base64,/

export const createDocumentShema = Joi.object({
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
          .unique((a, b) => a.type === b.type)
          .required(),
        correct: Joi.string().trim().valid('A', 'B', 'C', 'D').required(),
      })
    )
    .min(1)
    .required(),
})

export const getDocumentDetailShema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})

export const removeDocumentShema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
})
