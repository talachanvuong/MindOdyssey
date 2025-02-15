import Joi from 'joi'

export const reviewDocumentSchema = Joi.object({
  document: Joi.number().integer().strict().min(1).required(),
  isApproved: Joi.boolean().required(),
}).when(Joi.object({ isApproved: false }).unknown(), {
  then: Joi.object({
    reason: Joi.string().trim().max(2048).allow(null).required(),
  }),
})
