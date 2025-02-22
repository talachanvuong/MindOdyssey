import Joi from 'joi'

export const loginSchema = Joi.object({
  display_name: Joi.string().trim().min(8).max(64).required(),
  password: Joi.string().trim().min(8).max(32).required(),
})

export const reviewDocumentSchema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
  isApproved: Joi.boolean().required(),
}).when(Joi.object({ isApproved: false }).unknown(), {
  then: Joi.object({
    reason: Joi.string().trim().max(2048).allow(null).required(),
  }),
})

export const selectDocumentsSchema = Joi.object({
  pagination: Joi.object({
    page: Joi.number().integer().strict().min(1).required(),
    perPage: Joi.number().integer().strict().min(1).required(),
  }),
  keyword: Joi.string().trim(),
  filter: Joi.date().timestamp(),
})
