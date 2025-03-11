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
  array.forEach((ques, index) => {
    const li = document.createElement('li')
    li.className =
      'h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3'

    //question
    const question = document.createElement('p')
    question.className = ''
    question.textContent = `Question ${index + 1}: ` + ques.contents[0].text

    const form = document.createElement('form')
    const ul = document.createElement('ul')

    //answer
    ques.contents.slice(1).forEach((ans, i) => {
      const a = document.createElement('li')
      a.className = 'ml-1 flex flex-row gap-2'

      const input = document.createElement('input')
      input.type = 'radio'
      input.className = 'scale-150 cursor-pointer border border-black'

      switch (ques.correct_answer) {
        case `A`: {
          if (i == 0) input.checked = true
          break
        }
        case `B`: {
          if (i == 1)  input.checked = true
          break
        }
        case `C`: {
          if (i == 2)  input.checked = true
          break
        }
        case `D`: {
          if (i == 3)  input.checked = true
          break
        }
        default: {
          console.log('error in gaining answer')
        }
      }
      input.disabled = true

      const ansContent = document.createElement('p')
      ansContent.textContent = ans.text

      a.appendChild(input)
      a.appendChild(ansContent)
      ul.appendChild(a)
    })

    li.appendChild(question)
    li.appendChild(form)

    form.appendChild(ul)

    list.appendChild(li)
  })
}

export default { showDocList, showAnswerList }
