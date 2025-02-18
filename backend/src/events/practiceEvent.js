import practiceService from '../services/practiceService.js'
import practiceSocket from '../sockets/practiceSocket.js'

export default (io, socket) => {
  let rooms = {} // Store exam room information

  socket.on('createRoom', (mode, user_id) => {
    practiceSocket.createRoom(socket, rooms, mode, user_id)
  })

  socket.on('joinRoom', (roomId, user_id) => {
    practiceSocket.joinRoom(socket, roomId, rooms, user_id)
  })

  socket.on('getNewQuestion', (io, roomId, doc_id, questionorder) => {
    practiceSocket.getNewQuestion(io, roomId, doc_id, questionorder)
  })

  socket.on('postAnswer', async (io, roomId, answerStatus, user_id) => {
    practiceSocket.postAnswer(io, roomId, answerStatus, user_id)
  })

  socket.on('callallquestion', async (roomId, doc_id) => {
    const question = await practiceService.sendAllQuestions(doc_id)
    io.to(roomId).emit('getquestion', question)
  })

  // save history
  socket.on('saveHistory', async (user_id, score, history) => {
    console.log(`Player ${socket.id} history: ${history}`)
    await practiceService.insertPracticeHistory(user_id, score, history)
  })

  // Handle when a player disconnects
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(
        (player) => player !== socket.id
      )
      if (rooms[roomId].players.length === 0) delete rooms[roomId]
    }
    console.log(`User ${socket.id} has disconnected`)
  })
}
