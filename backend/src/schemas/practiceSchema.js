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
const orderSchema = joi.number().integer().min(1).required().messages({
  'number.base': 'order must be a number.',
  'number.integer': 'order must be an integer.',
  'number.min': 'order must be at least 1.',
  'any.required': 'order is required.',
})

const doc_idSchema = joi.number().integer().min(1).required().messages({
  'number.base': 'doc_id must be a number.',
  'number.integer': 'doc_id must be an integer.',
  'number.min': 'doc_id must be at least 1.',
  'any.required': 'doc_id is required.',
})

const answerSchema = joi
  .string()
  .valid('A', 'B', 'C', 'D')
  .required()
  .messages({
    'any.only': 'userAnswer must be one of A, B, C, or D.',
    'any.required': 'userAnswer is required.',
  })

const scoreSchema = joi.number().min(0).max(100).required().messages({
  'number.base': 'Score must be a number.',
  'number.min': 'Score cannot be less than 0.',
  'number.max': 'Score cannot be more than 100.',
  'any.required': 'Score is required.',
})

const user_idSchema = joi.number().integer().positive().required().messages({
  'number.base': 'user_id must be a number.',
  'number.integer': 'user_id must be an integer.',
  'number.positive': 'user_id must be a positive integer.',
  'any.required': 'user_id is required.',
})

const practice_history_idSchema = joi.number().integer().positive().required().messages({
  'number.base': 'Practice history id must be a number.',
  'number.integer': 'Practice history id must be an integer.',
  'number.positive': 'Practice history id must be a positive integer.',
  'any.required': 'Practice history id is required.',
})

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
const getDocumentbyUserIDValidate = joi.object({
  user_id: user_idSchema,
  page: pageSchema,
  limit: limitSchema,
})
const doc_idValidate = joi.object({
  doc_id: doc_idSchema,
})
const answerValidate = joi.object({
  userAnswer: answerSchema,
  order: orderSchema,
})
const finishedValidate = joi.object({
  score: scoreSchema,
})
const getPracticeHistorybyIDValidate = joi.object({
  practice_history_id: practice_history_idSchema,
})
export default {
  getDocumentforPraticeValidate,
  getPracticeHistoryValidate,
  doc_idValidate,
  answerValidate,
  finishedValidate,
  getDocumentbyUserIDValidate,
  getPracticeHistorybyIDValidate
}
