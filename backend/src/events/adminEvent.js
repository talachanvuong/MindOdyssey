import { selectDocumentsSchema } from '../schemas/adminSchema.js'
import {
  selectDocuments,
  selectTotalUnapprovedDocuments,
} from '../services/adminService.js'
import {
  EVENT,
  MESSAGE,
  messageResponse,
  STATUS_CODE,
} from '../utils/constant.js'

export default (io, socket) => {
  socket.on(EVENT.ADMIN.STATISTIC, async (cb) => {
    const data = {
      totalUnapprovedDocuments: await selectTotalUnapprovedDocuments(),
    }
    cb(data)
  })

  socket.on(EVENT.ADMIN.UNAPPROVED_LIST, async (params, cb) => {
    const { error } = selectDocumentsSchema.validate(JSON.parse(params))

    if (error) {
      cb(messageResponse(STATUS_CODE.BAD_REQUEST, MESSAGE.SERVER.ERROR))
    }

    const data = await selectDocuments(
      params.pagination,
      params.keyword,
      params.filter
    )
    cb(data)
  })
}
