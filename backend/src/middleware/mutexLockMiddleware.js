import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

const inProcess = new Set()

export const mutexLockHandler = (req, res, next) => {
  const { use_id: user_id } = req.user

  if (inProcess.has(user_id)) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.SERVER.PROCCESSING
    )
  }

  inProcess.add(user_id)

  res.on('finish', () => {
    inProcess.delete(user_id)
  })

  next()
}
