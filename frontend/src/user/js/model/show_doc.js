import callApi from "./callApi"

async function typeChecker(url) {
  return await callApi.checkAttachmentType(url)
}

 function showDocList(id, array) {
  const list = document.getElementById(id)
  list.innerHTML = ''
  array.forEach((doc) => {
    const li = document.createElement('li')
    li.className =
      'flex flex-row items-center rounded-md bg-white p-2 shadow-md shadow-gray-300'

    const imgIcon = document.createElement('img')
    imgIcon.src = '../img/docIcon.png'
    imgIcon.className = 'h-10'

    const p = document.createElement('p')
    p.className = 'ml-2 w-full'
    p.textContent = doc.document_title

    const a = document.createElement('a')
    a.href = `practiceScreen.html?id=${doc.document_id}`

    const imgDot = document.createElement('img')
    imgDot.className = 'h-7'
    imgDot.src = '../img/threeDot.png'

    imgDot.addEventListener
    a.appendChild(imgDot)
    li.appendChild(imgIcon)
    li.appendChild(p)
    li.appendChild(a)

    list.appendChild(li)
  })
}
 function showAnswerList(id, array) {
  const list = document.getElementById(id)
  list.innerHTML = ``
  console.log(array)
  array.forEach( async (ques, index) => {
    console.log('hello')
    const li = document.createElement('li')
    li.className =
      'h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3x`'

    //question
    const question = document.createElement('p')
    question.className = ' border-b border-black pb-2 font-bold'
    question.textContent = `Question ${index + 1}: ` + ques.contents[0].text
   
    if (ques.contents[0].attachment) {
    console.log('hello')
      const type = await typeChecker(ques.contents[0].attachment) 
    
      if(type==="audio"){
        let audio = document.createElement('audio')
        audio.src = ques.contents[0].attachment
        audio.controls= true
        console.log(question)
        question.appendChild(audio)
      }
      if(type==="image"){
        const attachment = document.createElement('img')
        attachment.src = ques.contents[0].attachment
        question.appendChild(attachment)
      }
    
    }

    const form = document.createElement('form')
    const ul = document.createElement('ul')

    //answer
    ques.contents.slice(1).forEach(async (ans)=> {
      const a = document.createElement('li')
      const inputAndTextDiv = document.createElement('div')
      inputAndTextDiv.classList = 'flex flex-row gap-2'

      a.className = 'ml-1 flex flex-col gap-2 my-2'

      const input = document.createElement('input')
      input.type = 'radio'
      input.className = 'scale-150 cursor-pointer border border-black'

      const ansContent = document.createElement('p')
      ansContent.textContent = ans.text

      input.disabled = true

      a.appendChild(inputAndTextDiv)
      inputAndTextDiv.appendChild(input)
      inputAndTextDiv.appendChild(ansContent)

      ul.appendChild(a)
      if (ans.attachment) {
        const type = await typeChecker(ans.attachment)
        if(type==="image"){
          const img = document.createElement('img')
          img.src = ans.attachment
          a.appendChild(img)
        }
        if(type === "audio"){
          let audio = document.createElement('audio')
          audio.src = ans.attachment
          audio.controls = true 
          a.appendChild(audio)
        }
      }
    })

    li.appendChild(question)
    li.appendChild(form)

    form.appendChild(ul)

    list.appendChild(li)
  })
}
function showHistoryPractice(id, array) {
  console.log(array)
  const list = document.getElementById(id)
  list.className = 'flex flex-col gap-3'
  list.innerHTML = ``
  array.forEach(async (ques, index) => {
    let correctAnswer
    let userAnswer
    console.log(ques.userAnswer)
    console.log(ques.correct_answer)
    const li = document.createElement('li')
    li.className =
      'h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3'

    const questionDiv = document.createElement('div')
    questionDiv.classList = 'flex flex-col border-b border-black p-2'
    li.appendChild(questionDiv)

    //question
    if (ques.contents[0].text) {
      const question = document.createElement('p')
      question.className = 'mb-2'
      question.textContent = `Question ${index + 1}: ` + ques.contents[0].text
      questionDiv.appendChild(question)
    }

    if (ques.contents[0].attachment) {
      let type = await typeChecker(ques.contents[0].attachment)
      console.log(type)
      if(type === "image"){
        const attachment = document.createElement('img')
        attachment.src = ques.contents[0].attachment
        questionDiv.appendChild(attachment)
      }
      if(type === "audio"){
        let audio = document.createElement('audio')
        audio.src =ques.contents[0].attachment
        audio.controls = true 
        questionDiv.appendChild(audio)
      }
     
    }

    const ul = document.createElement('ul')
    ul.className = 'flex flex-col gap-2 mt-3'
    li.appendChild(ul)

    switch (ques.correct_answer) {
      case 'A': {
        correctAnswer = 0
        break
      }
      case 'B': {
        correctAnswer = 1
        break
      }

      case 'C': {
        correctAnswer = 2
        break
      }

      case 'D': {
        correctAnswer = 3
        break
      }
    }
    switch (ques.userAnswer) {
      case 'A': {
        userAnswer = 0
        break
      }
      case 'B': {
        userAnswer = 1
        break
      }

      case 'C': {
        userAnswer = 2
        break
      }

      case 'D': {
        userAnswer = 3
        break
      }
    }

    //answer
    ques.contents.slice(1).forEach(async (ans, i) => {
      console.log(ans)
      const answer = document.createElement('li')
      answer.className = ''
      ul.appendChild(answer)

      const div = document.createElement('div')
      div.classList = 'flex flex-row items-center w-fit gap-2 mb-3 '
      answer.appendChild(div)

      const answerInput = document.createElement('input')
      answerInput.className = 'w-fit'
      div.appendChild(answerInput)
      answerInput.type = 'radio'

      const imgChecker = document.createElement('img')
      imgChecker.className = 'h-5'

      if (i == correctAnswer) {
        div.classList.add('bg-green-300', 'rounded-md', 'p-1')
      }
      if (i == userAnswer) {
        answerInput.checked = true
        if (correctAnswer != userAnswer) {
          imgChecker.src = '../../page/img/incorrect.png'
          div.classList.add('bg-red-300', 'rounded-md', 'p-1')
        } else {
          imgChecker.src = '../../page/img/done.png'
          div.classList.add('bg-green-300', 'rounded-md', 'p-1')
        }
      }
      answerInput.disabled = true

      if (ans.text) {
        const answerText = document.createElement('p')
        answerText.textContent = ans.text
        div.appendChild(answerText)
      }
      if (ans.attachment) {
        let type = await typeChecker(ans.attachment)
        if(type === "image"){
          const answerImage = document.createElement('img')
          answerImage.src = ans.attachment
          answer.appendChild(answerImage)
        }
        if(type === "audio"){
          const answerAudio = document.createElement('audio')
          answerAudio.src = ans.attachment
          answerAudio.controls = true
          answer.appendChild(answerAudio)
        }
      }
      div.appendChild(imgChecker)
    })
    list.appendChild(li)
  })
}
async function showPracticeSocket(id, data) {
  const list = document.getElementById(id)
  list.replaceChildren()

  //question
  const question = document.createElement('div')
  question.className =
    'flex flex-col items-start border-b border-black mb-4 p-2'
  list.appendChild(question)

  if (data.question) {
    const questionText = document.createElement('p')
    questionText.textContent = 'Question :' + data.question
    questionText.className = 'font-bold'
    question.appendChild(questionText)
  }
  if (data.attachmentQues) {
    let type = await typeChecker(data.attachmentQues)
    if(type === "image"){
      const questionImage = document.createElement('img')
      questionImage.src = data.attachmentQues
      question.appendChild(questionImage)
    }
    if(type === "audio"){
      const questionAudio = document.createElement('audio')
      questionAudio.src = data.attachmentQues
      questionAudio.controls = true
      question.appendChild(questionAudio)
    }
  
  }

  data.answers.forEach(async (answer, index) => {
    const li = document.createElement('li')
    li.className = "my-1"
    list.appendChild(li)

    const div = document.createElement('div')
    div.className = 'flex flex-row gap-3 items-center mb-2'
    li.appendChild(div)

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'answer'
    input.required = true
    input.id = `ans${index + 1}`
    div.appendChild(input)

    if (answer.text) {
      const answerText = document.createElement('label')
      answerText.textContent = answer.text
      answerText.htmlFor = `ans${index + 1}`
      div.appendChild(answerText)
    }

    const checkImage = document.createElement('img')
    checkImage.setAttribute('data-name', 'checker')
    checkImage.src = ''
    checkImage.className = 'h-5'
    div.appendChild(checkImage)

    if (answer.attachment) {
      console.log('hello')
      let type = await typeChecker(answer.attachment)
      if(type === "image"){
        const answerImage = document.createElement('img')
        answerImage.src = answer.attachment
        li.appendChild(answerImage)
      }
      if(type === "audio"){
        const answerAudio = document.createElement('audio')
        answerAudio.src = answer.attachment
        answerAudio.controls = true
        li.appendChild(answerAudio)
      }
        
    
    }
  })
}
function showListOfHistoryPractice(id, data) {
  const list = document.getElementById(id)
  list.replaceChildren()
  console.log(data)
  data.forEach((ele) => {
    const li = document.createElement('li')
    li.className =
      'bg-white p-1 rounded-md flex flex-row items-center shadow-md justify-around cursor-pointer hover:scale-105 hover:bg-gray-100 hover:border'
    list.appendChild(li)

    li.addEventListener('click', () => {
      const encodedData = encodeURIComponent(JSON.stringify(ele))
      window.location.href = `seeResult.html?detail=${encodedData}`
    })

    const timeDiv = document.createElement('div')
    timeDiv.className = 'block gap-1 w-1/4'
    li.appendChild(timeDiv)
    const start_time = document.createElement('p')
    timeDiv.appendChild(start_time)
    const time_value = document.createElement('p')
    timeDiv.appendChild(time_value)
    let time_start = new Date(ele.start_time)
    time_value.textContent = time_start.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
    })
    start_time.className = 'font-bold underline'
    start_time.textContent = 'Practice at:'

    const timerDiv = document.createElement('div')
    timerDiv.className = 'block gap-1 w-1/4'
    li.appendChild(timerDiv)
    const timerText = document.createElement('p')
    timerDiv.appendChild(timerText)
    timerText.className = 'font-bold'
    timerText.textContent = 'Time:'
    const timerValue = document.createElement('p')
    timerDiv.appendChild(timerValue)
    let time_end = new Date(ele.end_time)

    const timer = time_end - time_start
    const totalSeconds = Math.floor(timer/1000)
    const hours = String(Math.floor(totalSeconds/3600)).padStart(2,'0')
    const minute = String(Math.floor((totalSeconds%3600)/60)).padStart(2,'0')
    const second = String(totalSeconds%60).padStart(2,'0')
    timerValue.textContent = `${hours}:` + `${minute}:` + `${second}s`

    const score = document.createElement('p')
    score.className = 'font-bold w-1/4'

    li.appendChild(score)
    score.textContent = 'Score:' + ele.score

    const correctDiv = document.createElement('div')
    correctDiv.className = 'flex flex-row items-center'
    li.appendChild(correctDiv)
    const correctImg = document.createElement('img')
    correctImg.src = '../../page/img/done.png'
    correctImg.className = 'h-5 w-5'
    correctDiv.appendChild(correctImg)
    const correctNumber = document.createElement('p')
    correctNumber.textContent =
      Math.round((ele.score * ele.detail.length) / 100) + '/'
    correctDiv.appendChild(correctNumber)
    const totalNumber = document.createElement('p')
    totalNumber.textContent = ele.detail.length
    correctDiv.appendChild(totalNumber)
  })
}

export default {
  showDocList,
  showAnswerList,
  showHistoryPractice,
  showPracticeSocket,
  showListOfHistoryPractice,
}
