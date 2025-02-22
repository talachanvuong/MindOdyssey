import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js'
import { loginSchema, reviewDocumentSchema } from '../schemas/adminSchema.js'
import {
  isMatchedPassword,
  selectAdminByDisplayName,
  updateDocument,
} from '../services/adminService.js'
import { isDocumentExist } from '../services/documentService.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

/**
 * Login.
 */
export const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body)
  const { display_name, password } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check admin exist
  const resultAdmin = await selectAdminByDisplayName(display_name)
  if (!resultAdmin) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.ADMIN.NOT_FOUND)
  }

  const { admin_id, password: hashedPassword } = resultAdmin

  // Check password match
  const matchedPassword = await isMatchedPassword(password, hashedPassword)
  if (!matchedPassword) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.ADMIN.WRONG_PASSWORD
    )
  }

  // Clear old cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })

  // Create access token
  const accessToken = jwt.sign({ admin_id }, envConfig.accessTokenSecretKey, {
    expiresIn: '1h',
  })

  // Send access token
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge: 3600000,
  })

  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.ADMIN.LOGIN_SUCCESS)
}

/**
 * Review a document.
 */
export const reviewDocument = async (req, res) => {
  const { admin_id } = req.admin
  const { error, value } = reviewDocumentSchema.validate(req.body)
  const { document, isApproved, reason } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const existedDocument = await isDocumentExist(document)
  if (!existedDocument) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Update document in database
  await updateDocument(admin_id, isApproved, reason, document)
  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.DOCUMENT.REVIEW_SUCCESS)
}
