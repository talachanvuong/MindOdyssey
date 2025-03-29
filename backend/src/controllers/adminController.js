import adminSchema from '../schemas/adminSchema.js'
import adminService from '../services/adminService.js'
import documentService from '../services/documentService.js'
import { MESSAGE, STATUS_CODE } from '../utils/constantUtils.js'
import cookieUtils from '../utils/cookieUtils.js'
import jwtUtils from '../utils/jwtUtils.js'
import passwordUtils from '../utils/passwordUtils.js'
import { sendResponse } from '../utils/responseUtils.js'

const login = async (req, res) => {
  const { error, value } = adminSchema.login.validate(req.body)
  const { display_name, password } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check admin exist
  const admin = await adminService.getAdminByDisplayName(display_name)
  if (!admin) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.ADMIN.NOT_FOUND)
  }

  // Get admin info
  const { admin_id, password: hashedPassword } = admin

  // Check password correct
  const isPasswordCorrect = await passwordUtils.isPasswordCorrect(
    password,
    hashedPassword
  )
  if (!isPasswordCorrect) {
    return sendResponse(
      res,
      STATUS_CODE.BAD_REQUEST,
      MESSAGE.ADMIN.WRONG_PASSWORD
    )
  }

  // Clear old cookies
  cookieUtils.clearCookie(res, 'accessToken')
  cookieUtils.clearCookie(res, 'refreshToken')

  // Create access token
  const payload = {
    admin_id,
  }
  const accessToken = jwtUtils.signAccessToken(payload)

  // Send access token
  cookieUtils.setCookie(res, 'accessToken', accessToken, 3600000)

  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.ADMIN.LOGIN_SUCCESS)
}

const logout = async (req, res) => {
  // Clear old cookies
  cookieUtils.clearCookie(res, 'accessToken')
  cookieUtils.clearCookie(res, 'refreshToken')

  return sendResponse(res, STATUS_CODE.SUCCESS, MESSAGE.ADMIN.LOGOUT_SUCCESS)
}

const getPendingDocuments = async (req, res) => {
  const { error, value } = adminSchema.getPendingDocuments.validate(req.body)
  const { pagination, keyword, filter } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get pending documents
  const pendingDocuments = await adminService.getPendingDocuments(
    pagination,
    keyword,
    filter
  )

  // Check page valid
  if (pagination?.page > pendingDocuments.total_pages) {
    return sendResponse(
      res,
      STATUS_CODE.NOT_FOUND,
      MESSAGE.PAGINATION.PAGE_NOT_VALID
    )
  }

  // Check empty result
  if (pendingDocuments.total_pages === 0) {
    return sendResponse(
      res,
      STATUS_CODE.NOT_FOUND,
      MESSAGE.DOCUMENT.EMPTY_RESULT
    )
  }

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.ADMIN.GET_PENDING_DOCUMENTS_SUCCESS,
    pendingDocuments
  )
}

const getPendingDocumentDetail = async (req, res) => {
  const { error, value } = adminSchema.getPendingDocumentDetail.validate(
    req.body
  )
  const { document } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const isDocumentExist = await documentService.isDocumentExist(document)
  if (!isDocumentExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document review
  const isDocumentReview = await documentService.isDocumentReview(document)
  if (isDocumentReview) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.DOCUMENT.REVIEWED)
  }

  // Get pending document detail
  const pendingDocumentDetail = await adminService.getPendingDocumentDetail(
    document
  )

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.ADMIN.GET_PENDING_DOCUMENT_DETAIL_SUCCESS,
    pendingDocumentDetail
  )
}

const reviewDocument = async (req, res) => {
  const { admin_id } = req.admin
  const { error, value } = adminSchema.reviewDocument.validate(req.body)
  const { document, isApproved, reason } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Check document exist
  const isDocumentExist = await documentService.isDocumentExist(document)
  if (!isDocumentExist) {
    return sendResponse(res, STATUS_CODE.NOT_FOUND, MESSAGE.DOCUMENT.NOT_FOUND)
  }

  // Check document review
  const isDocumentReview = await documentService.isDocumentReview(document)
  if (isDocumentReview) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.DOCUMENT.REVIEWED)
  }

  // Review document
  await adminService.reviewDocument(admin_id, isApproved, reason, document)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.ADMIN.REVIEW_DOCUMENT_SUCCESS
  )
}

export default {
  login,
  logout,
  getPendingDocuments,
  getPendingDocumentDetail,
  reviewDocument,
}
