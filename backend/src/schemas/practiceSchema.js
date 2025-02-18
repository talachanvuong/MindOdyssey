import joi from 'joi'
const keywordSchema = joi.string().trim().min(1).max(255).optional().messages({
  'string.base': 'Keyword must be a string',
  'string.empty': 'Keyword cannot be empty',
  'string.min': 'Keyword must be at least 1 character long',
  'string.max': 'Keyword cannot exceed 255 characters',
})

const pageSchema = joi.number().integer().min(1).default(1).messages({
  'number.base': 'Page must be a number',
  'number.integer': 'Page must be an integer',
  'number.min': 'Page must be greater than or equal to 1',
})

const limitSchema = joi.number().integer().min(1).max(50).default(10).messages({
  'number.base': 'Limit must be a number',
  'number.integer': 'Limit must be an integer',
  'number.min': 'Limit must be greater than or equal to 1',
  'number.max': 'Limit cannot exceed 50',
})
const course_idSchema = joi.number().integer().min(1).optional().messages({
  'number.base': 'course_id must be an integer.',
  'number.integer': 'course_id must be an integer.',
  'number.min': 'course_id must be greater than or equal to 1.',
})
const modeSchema = joi.string().valid('practice', 'arena').required()
const doc_idSchema = joi.number().integer().min(1).required()
const answerStatus=joi.string().valid('A', 'B', 'C', 'D').required()
const getDocumentforPraticeValidate = joi.object({
  keyword: keywordSchema,
  page: pageSchema,
  limit: limitSchema,
  course_id: course_idSchema,
})
const getPracticeHistoryValidate = joi.object({
  page: pageSchema,
  limit: limitSchema,
})
const modeValidate = joi.object({
  mode: modeSchema,
})
const doc_idValidate = joi.object({
  doc_id: doc_idSchema,
})
const answerStatusValidate = joi.object({
  answerStatus: answerStatus,
})

export default {
  getDocumentforPraticeValidate,
  getPracticeHistoryValidate,
  modeValidate,
  doc_idValidate,
  answerStatusValidate
}
