import { MESSAGE, STATUS_CODE } from '../utils/constantUtils.js'
import { sendResponse } from '../utils/responseUtils.js'

export const errorHandler = (err, req, res, next) => {
  console.error(err)
  
  return sendResponse(
    res,
    STATUS_CODE.INTERNAL_SERVER_ERROR,
    MESSAGE.SERVER.ERROR
  )
}
