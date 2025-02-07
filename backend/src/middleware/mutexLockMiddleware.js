import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

const inProcess = new Set()

export const mutexLockHandler = (req, res, next) => {
  const { email } = req.user

  if (inProcess.has(email)) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.SERVER.PROCCESSING
    )
  }

  inProcess.add(email)

  res.on('finish', () => {
    inProcess.delete(email)
  })

  next()
}
