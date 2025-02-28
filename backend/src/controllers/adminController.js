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

const getUnapprovedDocuments = async (req, res) => {
  const { error, value } = adminSchema.getUnapprovedDocuments.validate(req.body)
  const { pagination, keyword, filter } = value

  // Check validation
  if (error) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, error.details[0].message)
  }

  // Get unapproved documents
  const unapprovedDocuments = await adminService.getUnapprovedDocuments(
    pagination,
    keyword,
    filter
  )

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.ADMIN.GET_UNAPPROVED_DOCUMENTS_SUCCESS,
    unapprovedDocuments
  )
}

const getDocumentDetail = async (req, res) => {
  const { error, value } = adminSchema.getDocumentDetail.validate(req.body)
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
  const isDocumentReview = await adminService.isDocumentReview(document)
  if (isDocumentReview) {
    return sendResponse(res, STATUS_CODE.BAD_REQUEST, MESSAGE.DOCUMENT.REVIEWED)
  }

  // Get document detail
  const documentDetail = await adminService.getDocumentDetail(document)

  return sendResponse(
    res,
    STATUS_CODE.SUCCESS,
    MESSAGE.ADMIN.GET_DOCUMENT_DETAIL_SUCCESS,
    documentDetail
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
  const isDocumentReview = await adminService.isDocumentReview(document)
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
  getUnapprovedDocuments,
  getDocumentDetail,
  reviewDocument,
}
