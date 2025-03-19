import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import io from 'socket.io-client'
import show_doc from '../model/show_doc.js'

const quesData = {
  question: null,
  attachmentQues: '',
  answers: [  
  ],
  checked: false,
  userAnswer: '',
  order: null,
}


let isCompleted = false
let score = 0
let interval

const practiceResult = {
  time: null,
  score: 0,
  correct: 0,
}

const socket = io('http://localhost:3000', { withCredentials: true })

document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('nextBtn')
  const currentQues = document.getElementById('quantity')
  const form = document.getElementById('form')
  

  const urlParams = new URLSearchParams(window.location.search)
  const id = Number(urlParams.get('id'))
  let total = Number(urlParams.get('total'))
  let current = 1
  if(total == 1) nextBtn.textContent='Submit'

  function inputController(){
    const input = document.querySelectorAll('input[name="answer"]')
    input.forEach((element,index)=>{
      element.addEventListener('change',()=>{
        input.forEach((el)=>{
          quesData.checked = true
          quesData.userAnswer = String.fromCharCode(65 + index)
          el.disabled = true
        })
        socketEvent.postUserAnswer(element)
      })
    })  
  }

  //send id document again if user go back
  document.getElementById('back').href = `practiceScreen.html?id=${id}`

  window.addEventListener('beforeunload', (event) => {
    if (!isCompleted) event.preventDefault()
  })

  
  currentQues.textContent = current
  const socketEvent = {
    async init() {
      socket.emit('getStarted', { doc_id: id }, (res) => {
        if (res === 'ready') {
          timer(true)
          this.getNewQuestion()
        }
      })
    },
    async getNewQuestion() {
      socket.emit('getNewQuestion',async  (question) => {
        quesData.question = question.contents[0].text
        quesData.attachmentQues = question.contents[0].attachment
        // else attachmentQuestion.remove()
       quesData.answers = question.contents.slice(1).map((ele)=>({
        text:ele.text,
        attachment:ele.attachment
       }))
        quesData.checked = false
        quesData.order = question.order
        await show_doc.showPracticeSocket('list',quesData)
        inputController()
      })
     
    },
    async postUserAnswer(ans) {
      if (quesData.checked) {
        socket.emit(
          'postUserAnswer',
          { userAnswer: quesData.userAnswer, order: quesData.order },
          (result) => {
            const img = ans.parentElement.querySelector('img')
            if (result === 'Correct') {
              practiceResult.correct++
              score += 100 / total
              if(ans.labels[0]){
                ans.labels[0].classList.add(
                  'bg-green-200',
                  'bg-opacity-80',
                  'p-1',
                  'rounded-md'
                )
                img.src = '../../page/img/done.png'
              }
              else img.src = '../../page/img/done.png'
              
            } else {
              if(ans.labels[0]){
                ans.labels[0].classList.add(
                  'bg-red-200',
                  'bg-opacity-80',
                  'p-1',
                  'rounded-md'
                )
                img.src = '../../page/img/incorrect.png'
              }
              else  img.src = '../../page/img/incorrect.png'
              
            }
            console.log('hello')
          }
        )
      }
    },
    async finish() {
      timer(false)
      socket.emit('finished', { score: score }, (response) => {
        response.forEach((ele) => {
          const start_time = new Date(ele.start_time)
          const end_time = new Date(ele.end_time)
          practiceResult.time = Math.floor((end_time - start_time) / 1000)
          practiceResult.score = ele.score
          console.log(response)
          socket.response = response
         
        })
      })
    },
  }


  async function socketFunc() {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    socketEvent.init()

    nextBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      if (form.checkValidity()) {
        console.log('check')
        current++
        currentQues.textContent = current
        if (current >= total) {
          nextBtn.textContent = 'Submit'
          if (current > total) {
            currentQues.textContent = 'End'
            socketEvent.finish()
            isCompleted = true
            setTimeout(() => {
              window.location.href = `practiceResult.html?total=${total}&time=${practiceResult.time}&score=${practiceResult.score.toFixed(2)}&correct=${practiceResult.correct}&incorrect=${total - practiceResult.correct}&id=${id}`
            }, 100)
          } else {
            socketEvent.getNewQuestion()
          }
        } else {
          socketEvent.getNewQuestion(socket)
        }
      } else {
        form.reportValidity()
      }
    })
  }

  async function userInfo() {
    const userName = document.getElementById('userName')
    const apiResult = await callApi.callApi(api.apiShowInfo, null, 'GET')
    userName.textContent =
      apiResult.status === 'success'
        ? apiResult.data.display_name
        : 'display_error'
  }

  function popupAlert() {
    const modal = document.getElementById('alert')
    const closeBtn = document.getElementById('continueBtn')

    closeBtn.addEventListener('click', () => {
      modal.classList.add('invisible')
      document.body.classList.remove('overflow-hidden')
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }

  function timer(state = true) {
    let seconds = 0
    let running = state
    function formatTime(sec) {
      let h = String(Math.floor(sec / 3600)).padStart(2, '0')
      let m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
      let s = String(sec % 60).padStart(2, '0')
      return `${h}:${m}:${s}`
    }

    function startTimer() {
      interval = setInterval(() => {
        seconds++
        document.getElementById('timer').innerHTML = formatTime(seconds)
      }, 1000)
    }

    function stopTimer() {
      clearInterval(interval)
      interval = null
    }
    running ? startTimer() : stopTimer()
  }

  socketFunc()
  popupAlert()
  userInfo()
  console.log(socket)
})

export default socket



