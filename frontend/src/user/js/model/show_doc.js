import callApi from './callApi'

async function typeChecker(url) {
  return await callApi.checkAttachmentType(url)
}

function showDocList(id, array) {
  console.log(array)
  const list = document.getElementById(id)
  list.innerHTML = ''
  array.forEach((doc) => {
    const li = document.createElement('li')
    const achor = document.createElement('a')
    li.appendChild(achor)
    achor.href = `practiceScreen.html?id=${doc.document_id}`
    achor.className =
      'flex flex-row items-center rounded-md bg-white p-2 shadow-md shadow-gray-300 hover:bg-stone-200 hover:scale-95 duration-500'

    const imgIcon = document.createElement('img')
    imgIcon.src = '../img/docIcon.png'
    imgIcon.className = 'h-10 w-1/14'
    achor.appendChild(imgIcon)

    const p = document.createElement('p')
    p.className = 'ml-2 w-full'
    p.textContent = doc.document_title
    achor.appendChild(p)

    const courseDiv = document.createElement('div')
    courseDiv.classList = 'flex flex-row w-1/2 gap-2 mr-4'
    const course = document.createElement('p')
    course.className = 'font-bold'
    course.textContent = 'Course:'
    courseDiv.appendChild(course)
    const courseName = document.createElement('p')
    courseName.textContent = doc.course_title
    courseDiv.appendChild(courseName)
    achor.appendChild(courseDiv)

    const a = document.createElement('a')
    a.href = `practiceScreen.html?id=${doc.document_id}`

    const imgDot = document.createElement('img')
    imgDot.className = 'h-7 hover:scale-105'
    imgDot.src = '../img/threeDot.png'

    a.appendChild(imgDot)
    achor.appendChild(a)
    list.appendChild(li)
  })
}
async function showHistoryPractice(id, originArray) {
  const array = originArray.map((question) => {
    let sortContent = [
      question.contents.find((c) => c.type === 'Q') || {
        text: '',
        attachment: null,
        type: 'Q',
      },
      question.contents.find((c) => c.type === 'A') || {
        text: '',
        attachment: null,
        type: 'A',
      },
      question.contents.find((c) => c.type === 'B') || {
        text: '',
        attachment: null,
        type: 'B',
      },
      question.contents.find((c) => c.type === 'C') || {
        text: '',
        attachment: null,
        type: 'C',
      },
      question.contents.find((c) => c.type === 'D') || {
        text: '',
        attachment: null,
        type: 'D',
      },
    ].map((c, index) => ({
      id: c.id || undefined,
      text: c.text || '',
      attachment: c.attachment || null,
      attachment_id: c.attachment_id || null,
      type: ['Q', 'A', 'B', 'C', 'D'][index],
    }))
    return {
      ...question,
      contents: sortContent,
    }
  })
  const list = document.getElementById(id)
  list.className = 'flex flex-col gap-3'
  list.innerHTML = ``
  for (const [index, ques] of array.entries()) {
    let correctAnswer
    let userAnswer
    const li = document.createElement('li')
    li.className =
      'h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3 overflow-hidden'

    const questionDiv = document.createElement('div')
    questionDiv.classList = 'flex flex-col border-b border-black p-2'
    li.appendChild(questionDiv)

    //question
    if (ques.contents[0].text) {
      const question = document.createElement('p')
      question.className = 'mb-2 font-bold'
      question.textContent = `Question ${index + 1}: ` + ques.contents[0].text
      questionDiv.appendChild(question)
    }

    if (ques.contents[0].attachment) {
      let type = await typeChecker(ques.contents[0].attachment)
      if (type === 'image') {
        const attachment = document.createElement('img')
        attachment.src = ques.contents[0].attachment
        attachment.className =
          'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border '
        questionDiv.appendChild(attachment)
      }
      if (type === 'audio') {
        let audio = document.createElement('audio')
        audio.src = ques.contents[0].attachment
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
    for (const [i, ans] of ques.contents.slice(1).entries()) {
      const answer = document.createElement('li')
      answer.className =
        'shadow-lg rounded-md p-2 border border-gray-100 bg-white '
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
        if (type === 'image') {
          const answerImage = document.createElement('img')
          answerImage.src = ans.attachment
          answerImage.className =
            'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
          answer.appendChild(answerImage)
        }
        if (type === 'audio') {
          const answerAudio = document.createElement('audio')
          answerAudio.src = ans.attachment
          answerAudio.controls = true
          answer.appendChild(answerAudio)
        }
      }
      div.appendChild(imgChecker)
    }
    list.appendChild(li)
  }
}
async function showPracticeSocket(id, data) {
  const list = document.getElementById(id)
  list.className = 'overflow-hidden p-4'
  list.replaceChildren()

  //question
  const question = document.createElement('div')
  question.className =
    'flex flex-col items-start border-b border-black mb-4 p-2 gap-2'
  list.appendChild(question)

  if (data.question) {
    const questionText = document.createElement('p')
    questionText.textContent = 'Question :' + data.question.text
    questionText.className = 'font-bold'
    question.appendChild(questionText)
  }
  if (data.question.attachment) {
    let type = await typeChecker(data.question.attachment)
    if (type === 'image') {
      const questionImage = document.createElement('img')
      questionImage.src = data.question.attachment
      questionImage.className =
        'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
      question.appendChild(questionImage)
    }
    if (type === 'audio') {
      const questionAudio = document.createElement('audio')
      questionAudio.src = data.question.attachment
      questionAudio.controls = true
      question.appendChild(questionAudio)
    }
  }
  const answerList = document.createElement('div')
  answerList.className = 'flex flex-col h-fit gap-3'
  list.appendChild(answerList)
  for (const answer of data.answers) {
    //create label for input
    const label = document.createElement(`label`)
    label.className = 'border rounded-md shadow-lg hover:bg-gray-200 duration-500 cursor-pointer py-1 px-5'
    answerList.appendChild(label)

    const inputDiv = document.createElement('div')
    label.appendChild(inputDiv)
    inputDiv.className = "flex flex-row gap-2"

    //create elements for the label
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'answer'
    input.className = `w-5`

    const checkImage = document.createElement('img')
    checkImage.className = 'h-7'

    inputDiv.appendChild(input)
    //check if the answer does not have text
    if (answer.text) {
      const p = document.createElement(`p`)
      inputDiv.appendChild(p)
      p.textContent = answer.text
      p.className='row-start-1'
    }
    inputDiv.appendChild(checkImage)

    //classify type of attachment
    if (answer.attachment) {
      const type = await typeChecker(answer.attachment)
      if (type === 'image') {
        const image = document.createElement('img')
        image.src = answer.attachment
        image.className = "h-96 w-fit rounded-md shadow-gray-300 shadow-lg mx-auto mb-3"
        label.appendChild(image)
      }
      if (type === 'audio') {
        const audio = document.createElement('audio')
        audio.controls = true
        audio.src = answer.attachment
        audio.classList = "mb-3"
        label.appendChild(audio)
      }
    }
  }
}
function showListOfHistoryPractice(id, data) {
  const list = document.getElementById(id)
  list.replaceChildren()
  data.forEach((ele) => {
    const li = document.createElement('li')
    li.className =
      'bg-white p-1 rounded-md flex flex-row items-center shadow-md justify-around cursor-pointer hover:scale-95 duration-500 hover:bg-gray-100 hover:border'
    list.appendChild(li)

    li.addEventListener('click', () => {
      const history_id = ele.practice_history_id
      window.location.href = `seeResult.html?history_id=${history_id}`
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
    const totalSeconds = Math.floor(timer / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minute = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      '0'
    )
    const second = String(totalSeconds % 60).padStart(2, '0')
    timerValue.textContent = `${hours}:` + `${minute}:` + `${second}s`

    const score = document.createElement('p')
    score.className = 'font-bold w-1/4'

    li.appendChild(score)
    score.textContent = 'Score:' + ele.score.toFixed(1)

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
  showHistoryPractice,
  showPracticeSocket,
  showListOfHistoryPractice,
}
