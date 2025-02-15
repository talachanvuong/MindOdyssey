import { reviewDocumentSchema } from '../schemas/adminSchema.js'
import { updateDocument } from '../services/adminService.js'
import { isDocumentExist } from '../services/documentService.js'
import { MESSAGE, sendResponse, STATUS_CODE } from '../utils/constant.js'

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
