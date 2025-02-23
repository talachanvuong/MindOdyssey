import practiceSchema from '../schemas/practiceSchema.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'
import practiceService from '../services/practiceService.js'
const getDocumentforPratice = async (req, res) => {
  const { error, value } =
    practiceSchema.getDocumentforPraticeValidate.validate(req.query)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { keyword, page, limit, course_id } = value
  const { totalPages, totalDocs } =
    await practiceService.countDocumentsByKeyword(keyword, limit, course_id)
  if (totalDocs == 0) {
    return sendResponse(
      res,
      STATUS_CODE.NOT_FOUND,
      MESSAGE.PRACTICE.NOT_FOUND_DOCS
    )
  }
  if (page > totalPages) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.PRACTICE.PAGE_EXCEEDS_TOTAL
    )
  }
  const docs = await practiceService.selectDocumentforPractice(
    keyword,
    page,
    limit
  )
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.PRACTICE.GET_DOCS_SUCCESS,
    {
      docs: docs,
      currentPage: page,
      totalPages,
      totalDocs,
    }
  )
}
const getPracticeHistory = async (req, res) => {
  const { user_id } = req.user
  const { error, value } =
    practiceSchema.getPracticeHistoryValidate.validate(req.query)
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }
  const { page, limit } = value
  const {totalPracticeHistory, totalPages} = await practiceService.countPracticeHistory(user_id, limit)
  if (totalPracticeHistory == 0) {
    return sendResponse(
      res,
      STATUS_CODE.NOT_FOUND,
      MESSAGE.PRACTICE.NOT_FOUND_HISTORY
    )
  }
  if (page > totalPages) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.PRACTICE.PAGE_EXCEEDS_TOTAL
    )
  }
  const history = await practiceService.selectPracticeHistory(user_id,limit,page)
  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.PRACTICE.GET_PRACTICE_HISTORY_SUCCESS,
    {
      PracticeHistory: history,
      currentPage: page,
      totalPages,
      totalPracticeHistory,
    }
  )
}
export default { getDocumentforPratice,getPracticeHistory }
