import Joi from 'joi'

export const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
})

export const getCoursesSchema = Joi.object({
  keyword: Joi.string().trim(),
})
