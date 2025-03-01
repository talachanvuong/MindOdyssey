import practiceSocket from '../sockets/practiceSocket.js'

export default (io, socket) => {
  /**
   * get started to practice 
   * server send practice_history_id to client
   */
  socket.on('getStarted',(data,callback)=>{
    practiceSocket.getStarted(socket,data,callback)
  })

  /**
   * client to request new question 
   */
  socket.on('getNewQuestion', (data,callback)=>{
    practiceSocket.getNewQuestion(socket,data,callback)
  })
  
  /**
   * client post userAnswer and question_id,practice_history_id to check 
   * server check,send response then update practice_histories
   */
  socket.on('postUserAnswer', ( data,callback) => {
    practiceSocket.postUserAnswer(socket,data,callback)
  })
}
