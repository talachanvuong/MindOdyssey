import Joi from 'joi'

const createCourse = Joi.object({
  title: Joi.string().trim().min(8).max(256).required(),
})

const getCourses = Joi.object({
  keyword: Joi.string().trim(),
})

export default {
  createCourse,
  getCourses,
}
