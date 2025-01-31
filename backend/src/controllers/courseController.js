import {
  insertCourse,
  isCourseExistByTitle,
  selectCourses,
} from '../services/courseService.js'
import { createCourseShema, getCoursesShema } from '../shemas/courseShema.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Create a new course.
 */
export const createCourse = async (req, res) => {
  const { error, value } = createCourseShema.validate(req.body)
  const { title } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check course exist
  const existedCourse = await isCourseExistByTitle(title)
  if (existedCourse) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.COURSE.EXISTED)
  }

  // Insert new course
  await insertCourse(title)
  return sendResponse(res, STATUS_CODE.CREATED, MESSAGE.COURSE.CREATE_SUCCESS)
}

/**
 * Get list of courses.
 */
export const getCourses = async (req, res) => {
  const { error, value } = getCoursesShema.validate(req.query)
  const { keyword } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get courses
  const courses = await selectCourses(keyword)
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.COURSE.GET_SUCCESS,
    courses
  )
}
