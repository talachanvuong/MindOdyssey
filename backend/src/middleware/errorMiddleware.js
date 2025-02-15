import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

export const errorHandler = (err, req, res, next) => {
  console.error(err)
  return sendResponse(res, STATUS_CODE.INTERNAL_SERVER_ERROR, MESSAGE.SERVER.ERROR)
}
