import { nanoid } from 'nanoid'
import practiceService from './practiceService.js'
import practiceSchema from '../schemas/practiceSchema.js'
const createRoom = (socket, rooms, mode, user_id) => {
  // Kiểm tra mode hợp lệ
  const { error } = practiceSchema.modeSchema.validate(mode)

  if (error) {
    socket.emit('message', 'Invalid mode')
    return
  }

  const roomId = randomRoomID(rooms)
  socket.join(roomId)

  // Nếu phòng chưa tồn tại, tạo mới
  rooms[roomId] = rooms[roomId] || { players: [], mode: mode }

  rooms[roomId].players.push(user_id)
  console.log(`Room ${roomId} created with mode ${mode}`)
  socket.emit('getroomId', roomId)
}

const joinRoom = (socket, roomId, rooms, user_id) => {
  // Kiểm tra phòng có tồn tại không
  if (!(roomId in rooms)) {
    console.log(`Room ${roomId} does not exist`)
    socket.emit('message', 'Room not found')
    return
  }

  const room = rooms[roomId]

  // Kiểm tra số lượng người chơi tối đa
  if (
    (room.mode === 'practice' && room.players.length == 1) ||
    (room.mode === 'arena' && room.players.length == 2)
  ) {
    socket.emit('message', 'Room is full')
    return
  }

  socket.join(roomId)
  room.players.push(user_id)
  console.log(`Player ${user_id} joined room ${roomId}`)
  socket.emit('getroomId', roomId)
}

const getNewQuestion = async (io, roomId, doc_id, questionorder) => {
  const question = await practiceService.sendQuestion(doc_id, questionorder)
  io.to(roomId).emit('getQuestion', question)
}

const postAnswer = async (io, socket, roomId, answerStatus, user_id) => {
  const { error } = practiceSchema.answerStatusValidate.validate(
    answerStatus.Answer
  )

  if (error) {
    return socket.emit('message', 'Invalid answer')
  }
  const userAnswer = answerStatus.Answer
  const question_id = answerStatus.question_id
  const question_order = answerStatus.question_order
  const correct_answer = await practiceService.getCorrectAnswer(question_id)

  if (userAnswer === correct_answer) {
    io.to(roomId).emit(
      'message',
      `Player ${user_id} correct with question ${question_order}`
    )
  }
}

const disconnect = (socket, rooms, user_id) => {
  for (const roomId in rooms) {
    rooms[roomId].players = rooms[roomId].players.filter(
      (player) => player !== user_id
    )
    if (rooms[roomId].players.length === 0) delete rooms[roomId]
  }
  console.log(`Player ${socket.id} leaved`)
}

const randomRoomID = (rooms) => {
  let roomId
  do {
    roomId = nanoid(6)
  } while (roomId in rooms)
  return roomId
}

export default { createRoom, disconnect, joinRoom, getNewQuestion, postAnswer }
