import { selectTotalUnapprovedDocuments } from '../services/adminService.js'
import { EVENT } from '../utils/constant'

export default (socket) => {
  socket.on(EVENT.STATISTIC, async () => {
    const data = {
      totalUnapprovedDocuments: await selectTotalUnapprovedDocuments(),
    }
    socket.emit(EVENT.STATISTIC, data)
  })
}
