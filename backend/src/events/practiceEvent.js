import practiceSocket from '../sockets/practiceSocket.js'

export default (io, socket) => {
  /**
   * get started to practice 
   * reupload all questions
   */
  socket.on('getStarted',async (data,callback)=>{
    await practiceSocket.getStarted(socket,data,callback)
  })

  
  /**
   * client to request new question 
   */
  socket.on('getNewQuestion', (data,callback)=>{
    practiceSocket.getNewQuestion(socket,data,callback)
  })
  
  /**
   * client post userAnswer and order of question  to check 
   * server check,send response 
   */
  socket.on('postUserAnswer', ( data,callback) => {
    practiceSocket.postUserAnswer(socket,data,callback)
  })

  /**
   * client emit finished event to finish practice 
   * server insert practice_histories
   */
  socket.on('finished', (data,callback) => {
    practiceSocket.finished(socket,data,callback)
  })


}
