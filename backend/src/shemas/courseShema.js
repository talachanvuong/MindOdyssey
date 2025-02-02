import Joi from 'joi'

export const createCourseShema = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
})

export const getCoursesShema = Joi.object({
  keyword: Joi.string().trim().allow(''),
})
