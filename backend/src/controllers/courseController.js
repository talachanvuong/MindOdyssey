import courseSchema from '../schemas/courseSchema.js'
import courseService from '../services/courseService.js'
import { MESSAGE, STATUS_CODE } from '../utils/constantUtils.js'
import { sendResponse } from '../utils/responseUtils.js'

const createCourse = async (req, res) => {
  const { error, value } = courseSchema.createCourse.validate(req.body)
  const { title } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const isCourseExist = await courseService.isCourseExistByTitle(title)
  if (isCourseExist) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.COURSE.EXISTED)
  }

  // Create course
  await courseService.createCourse(title)

  return sendResponse(
    res,
    STATUS_CODE.CREATED,
    MESSAGE.COURSE.CREATE_COURSE_SUCCESS
  )
}

const getCourses = async (req, res) => {
  const { error, value } = courseSchema.getCourses.validate(req.body)
  const { keyword } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get courses
  const courses = await courseService.getCourses(keyword)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.COURSE.GET_COURSES_SUCCESS,
    courses
  )
}

export default {
  createCourse,
  getCourses,
}
