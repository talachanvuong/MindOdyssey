import Joi from 'joi'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

const schema = Joi.object().max(0)

export const noPayloadHandler = (req, res, next) => {
  const { error } = schema.validate(req.body)

  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.SERVER.NO_PAYLOAD)
  }

  next()
}
