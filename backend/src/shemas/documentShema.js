import Joi from 'joi'

export const createDocumentShema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
  description: Joi.string().trim().max(2048),
  total_questions: Joi.number().integer().strict().min(1).required(),
  course: Joi.number().integer().strict().min(1).required(),
})

export const createQuestionShema = Joi.object({
  order: Joi.number().integer().strict().min(1).required(),
  correct: Joi.string()
    .trim()
    .pattern(/^[ABCD]$/)
    .required(),
  document: Joi.number().integer().strict().min(1).required(),
})

export const createContentShema = Joi.object({
  text: Joi.string().trim().max(4096),
  attachment: Joi.string().trim().max(4096),
  type: Joi.string()
    .trim()
    .pattern(/^[ABCDQ]$/)
    .required(),
  question: Joi.number().integer().strict().min(1).required(),
}).or('text', 'attachment')
