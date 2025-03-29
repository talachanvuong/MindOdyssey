import callApi from './callApi.js'
import {timeConvert} from '../../../utils/convertUtils.js'

function showDocList(id, array) {
  const list = document.getElementById(id)
  list.innerHTML = ''
  array.forEach((doc) => {
    const li = document.createElement('li')
    li.className =
      'flex flex-row items-center rounded-md bg-white p-2 shadow-md shadow-gray-300 hover:bg-gray-200 hover:scale-95 duration-500 cursor-pointer'
    li.addEventListener('click', () => {
      window.location.href = `detail.html?id=${doc.document_id}`
    })
    const imgIcon = document.createElement('img')
    imgIcon.src = '../img/docIcon.png'
    imgIcon.className = 'h-10'

    const p = document.createElement('p')
    p.className = 'ml-2 w-full'
    p.textContent = doc.title

    const last_update_div = document.createElement('div')
    last_update_div.className = 'flex flex-row w-full gap-2  overflow-hidden'

    const last_update_date_title = document.createElement('p')
    last_update_date_title.className =
      'font-bold underline w-fit  inline-block whitespace-nowrap'
    last_update_date_title.textContent = 'Last updated: '

    const last_update_date = document.createElement('p')
    last_update_date.className = 'w-fit inline-block whitespace-nowrap'
    last_update_date.textContent = timeConvert(doc.last_updated)

    last_update_div.appendChild(last_update_date_title)
    last_update_div.appendChild(last_update_date)

    li.appendChild(imgIcon)
    li.appendChild(p)
    li.appendChild(last_update_div)

    list.appendChild(li)
  })
}

async function showAnswerList(id, originArray) {
  const list = document.getElementById(id)
  list.innerHTML = ``

  //sort the array if the array were not in order
  const array = originArray.map((question) => {
    //sort and recreate data if it lose
    const sortContent = [
      question.contents.find((c) => c.type === 'Q') || {
        text: ``,
        attachment: null,
        type: 'Q',
      },
      question.contents.find((c) => c.type === 'A') || {
        text: ``,
        attachment: null,
        type: 'A',
      },
      question.contents.find((c) => c.type === 'B') || {
        text: ``,
        attachment: null,
        type: 'B',
      },
      question.contents.find((c) => c.type === 'C') || {
        text: ``,
        attachment: null,
        type: 'C',
      },
      question.contents.find((c) => c.type === 'D') || {
        text: ``,
        attachment: null,
        type: 'D',
      },
    ]
    //reformat data after sorted
    .map((content, index) => ({
      text: content.text || ``,
      attachment: content.attachment || null,
      type: ['Q', 'A', 'B', 'C', 'D'][index],
    }))
    // return data with new contents
    return {
      ...question,
      contents: sortContent,
    }
  })
  
  for (const [index, ques] of array.entries()) {
    const li = document.createElement('li')
    li.className =
      'h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3 overflow-hidden'

    const question = document.createElement('p')
    question.className = 'border-b-4 border-black pb-1 font-bold'
    question.textContent = `Question ${index + 1}: ` + ques.contents[0].text

    if (ques.contents[0].attachment) {
      let type = await callApi.checkAttachmentType(ques.contents[0].attachment)
      if (type === 'image') {
        const quesImage = document.createElement('img')
        quesImage.src = ques.contents[0].attachment
        quesImage.className =
          'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
        question.appendChild(quesImage)
      } else if (type === 'audio') {
        const quesAudio = document.createElement('audio')
        quesAudio.src = ques.contents[0].attachment
        quesAudio.controls = true
        question.appendChild(quesAudio)
      }
    }

    const form = document.createElement('form')
    const ul = document.createElement('ul')

    for (const [i, ans] of ques.contents.slice(1).entries()) {
      const a = document.createElement('li')
      a.className = 'ml-1 flex flex-col gap-2 my-2'

      const inputAndTextDiv = document.createElement('div')
      inputAndTextDiv.classList = 'flex flex-row gap-2'

      const input = document.createElement('input')
      input.type = 'radio'
      input.className = 'scale-150 cursor-pointer border border-black'
      input.disabled = true

      if ('ABCD'[i] === ques.correct_answer) input.checked = true

      const ansContent = document.createElement('p')
      ansContent.textContent = ans.text

      inputAndTextDiv.append(input, ansContent)
      a.appendChild(inputAndTextDiv)
      ul.appendChild(a)

      if (ans.attachment) {
        let type = await callApi.checkAttachmentType(ans.attachment)
        if (type === 'image') {
          const img = document.createElement('img')
          img.className =
            'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
          img.src = ans.attachment
          a.appendChild(img)
        } else if (type === 'audio') {
          const audio = document.createElement('audio')
          audio.src = ans.attachment
          audio.controls = true
          a.appendChild(audio)
        }
      }
    }

    li.append(question, form)
    form.appendChild(ul)
    list.appendChild(li)

    console.log(`Append question: ${index}`)
  }
}

export default { showDocList, showAnswerList }
