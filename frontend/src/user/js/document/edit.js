import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'

document.addEventListener('DOMContentLoaded', async function () {
  const API_DOCUMENTS = 'http://localhost:3000/api/document'
  const API_COURSE = 'http://localhost:3000/api/course'
  const docNameInput = document.getElementById('documentName')
  const descriptionInput = document.getElementById('description')
  const courseSelect = document.getElementById('course')
  const fileInput = document.getElementById('fileInput')
  const createCourseBtn = document.getElementById('createcourse')
  const questionsContainer = document.getElementById('questionsContainer')
  const saveButton = document.getElementById('btn_save')
  const addQuestionBtn = document.getElementById('addQuestionBtn')

  const urlParams = new URLSearchParams(window.location.search)
  const documentId = urlParams.get('documentId')

  console.log('Document ID from URL:', documentId)

  if (!documentId || isNaN(Number(documentId))) {
    showPopup('No valid document ID found!')
  }
  //   popup menu
  function popupMenu() {
    const button = document.getElementById('popupMenuBtn')
    const modal = document.getElementById('popupMenu')

    //open
    button.addEventListener('click', () => {
      modal.classList.remove('invisible')
      document.body.classList.add('overflow-hidden')
    })

    //close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }
  // Open popup
  const showPopup = (message) => {
    document.getElementById('popupText').innerText = message
    document.getElementById('popupMessage').classList.remove('hidden')
  }

  // Close popup
  const closePopup = () => {
    document.getElementById('popupMessage').classList.add('hidden')
  }

  window.closePopup = closePopup

  //get user info
  async function userInfo() {
    const userName = document.getElementById('userName')

    const apiResult = await callApi.callApi(api.apiShowInfo, null, 'GET')
    if (apiResult.status === 'success') {
      userName.textContent = apiResult.data.display_name
    } else {
      console.log(apiResult)
      userName.textContent = 'display_error'
    }
  }

  // load document _id from url
  const loadCourses = async (selectedCourseId) => {
    try {
      const response = await callApi.callApi(
        `${API_COURSE}/get-courses`,
        null,
        'POST'
      )

      if (!response || response.status !== 'success') {
        throw new Error(`API Error: ${response?.status || 'Unknown error'}`)
      }

      const responseData = response.data

      if (!Array.isArray(responseData)) {
        console.warn('Invalid course data format:', responseData)
        return
      }

      const courses = responseData
      console.log('Courses:', courses)

      if (!courseSelect) {
        console.error('courseSelect element not found!')
        return
      }

      courseSelect.innerHTML = '<option value="">Select course</option>'

      courses.forEach((course) => {
        const option = document.createElement('option')
        option.value = course.course_id
        option.textContent = course.title
        if (selectedCourseId && course.course_id === selectedCourseId) {
          option.selected = true
        }
        courseSelect.appendChild(option)
      })
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  // Call loadCourses() when the page opens
  document.addEventListener('DOMContentLoaded', loadCourses)

  // Create new course
  const createCourse = async () => {
    const courseName = prompt('Enter course name:')
    if (!courseName || courseName.length < 8) {
      showPopup('Course name must be at least 8 characters!')
      return
    }

    try {
      const createResponse = await fetch(`${API_COURSE}/create-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: courseName }),
      })

      if (!createResponse.ok) {
        throw new Error(responseData.message || 'Unable to create course')
      }

      showPopup('Create a successful course!')
      loadCourses()
    } catch (error) {
      showPopup(error.message)
    }
  }
  createCourseBtn.addEventListener('click', createCourse)

  window.setCorrectAnswer = (index, answer) => {
    if (!questions[index]) {
      console.error(`Question not found in index ${index}`)
      return
    }
    questions[index].correct_answer = answer
  }

  // Load document from api
  async function loadDocument() {
    try {
      const response = await fetch(`${API_DOCUMENTS}/get-document-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ document: Number(documentId) }),
      })

      if (!response.ok) throw new Error('Error loading document!')
      const data = await response.json()
      if (!data || !data.result) {
        showPopup('Document not found!')
        return
      }

      console.log('Document data:', data.result)

      const doc = data.result
      docNameInput.value = doc.title || ''
      descriptionInput.value = doc.description || ''
      await loadCourses(doc.course.id)

      questions = await Promise.all(
        doc.questions
          .map(async (q, index) => {
            if (!Array.isArray(q.contents) || q.contents.length === 0)
              return null
            const correctAnswer = q.correct_answer || ''
            console.log(
              `Question ${index + 1} - Correct answer:`,
              correctAnswer
            )

            // Convert attachment to Base64 if it is a URL
            if (
              q.contents[0]?.attachment &&
              q.contents[0].attachment.startsWith('http')
            ) {
              q.contents[0].attachment = await urlToBase64(
                q.contents[0].attachment
              )
            }
            for (let i = 1; i < q.contents.length; i++) {
              if (
                q.contents[i].attachment &&
                q.contents[i].attachment.startsWith('http')
              ) {
                q.contents[i].attachment = await urlToBase64(
                  q.contents[i].attachment
                )
              }
            }
            // Sắp xếp lại contents theo type: Q, A, B, C, D
            const sortedContents = [
              q.contents.find((c) => c.type === 'Q') || {
                text: '',
                attachment: null,
                type: 'Q',
              },
              q.contents.find((c) => c.type === 'A') || {
                text: '',
                attachment: null,
                type: 'A',
              },
              q.contents.find((c) => c.type === 'B') || {
                text: '',
                attachment: null,
                type: 'B',
              },
              q.contents.find((c) => c.type === 'C') || {
                text: '',
                attachment: null,
                type: 'C',
              },
              q.contents.find((c) => c.type === 'D') || {
                text: '',
                attachment: null,
                type: 'D',
              },
            ].map((c, idx) => ({
              id: c.id || undefined,
              text: c.text || '',
              attachment: c.attachment || null,
              attachment_id: c.attachment_id || null,
              type: ['Q', 'A', 'B', 'C', 'D'][idx],
            }))
            return {
              id: q.id || undefined,
              action: q.id && !q.action ? 'edit' : q.action || 'add',
              correct: q.correct_answer || '',
              contents: sortedContents,
              order: q.order || index + 1,
            }
          })
          .filter(Boolean)
      )

      renderQuestions()
    } catch (error) {
      console.error('Error loading document:', error)
      showPopup(error.message)
    }
  }

  // Function to automatically expand textarea according to content
  window.autoResize = (element) => {
    element.style.height = 'auto' // Reset height for accurate measurement
    element.style.height = element.scrollHeight + 'px' // Update height according to content
  }

  // Update question content
  window.updateQuestion = (index, value, position) => {
    questions[index].contents[position].text = value
  }

  // Update answer
  window.updateAnswer = (index, optionIndex, element) => {
    if (!questions[index]) {
      console.error(`Error: Question not found in index ${index}`)
      return
    }

    if (!questions[index].contents) {
      questions[index].contents = []
    }

    while (questions[index].contents.length <= optionIndex) {
      questions[index].contents.push({ text: '', attachment: '' })
    }

    questions[index].contents[optionIndex].text = element.value.trim()
  }
  // Update correct answer
  window.setCorrectAnswer = (index, answer) => {
    if (!questions[index]) {
      console.error(`Error: Question not found in index ${index}`)
      return
    }
    questions[index].correct = answer // Assign the correct answer to `questions`
    console.log(` Selected answer: ${answer} for question ${index + 1}`)
  }

  //Add new question with image and audio support
  addQuestionBtn.addEventListener('click', () => {
    questions.push({
      action: 'add',
      contents: [
        { text: '', attachment: null, type: 'Q' },
        { text: '', attachment: null, type: 'A' },
        { text: '', attachment: null, type: 'B' },
        { text: '', attachment: null, type: 'C' },
        { text: '', attachment: null, type: 'D' },
      ],
      correct: '',
    })

    console.log(
      'List of questions after adding:',
      JSON.stringify(questions, null, 2)
    )

    renderQuestions()
  })

  // Save data(question, answer and correct answer) from ui
  const saveUserInput = () => {
    document.querySelectorAll('textarea').forEach((textarea, index) => {
      const questionIndex = Math.floor(index / 5)
      const optionIndex = index % 5

      if (
        !questions[questionIndex] ||
        !questions[questionIndex].contents[optionIndex]
      )
        return
      // Only update if textarea has a value and is different from current value
      const currentText =
        questions[questionIndex].contents[optionIndex].text || ''
      if (textarea.value.trim() !== currentText) {
        questions[questionIndex].contents[optionIndex].text =
          textarea.value.trim()
      }
    })

    document
      .querySelectorAll('input[type="radio"]:checked')
      .forEach((radio) => {
        const match = radio.name.match(/question(\d+)/)
        if (match) {
          const questionIndex = parseInt(match[1])
          const selectedOption = radio.value
          if (questions[questionIndex]) {
            questions[questionIndex].correct = selectedOption
          }
        }
      })
  }

  //Delete attachment
  window.removeAttachment = (index, position) => {
    if (!questions[index] || !questions[index].contents[position]) {
      console.error(
        `Error: Invalid question index ${index} or position ${position}`
      )
      return
    }

    // Delete attachment = null
    questions[index].contents[position].attachment = null
    questions[index].contents[position].attachment_id = null
    console.log(
      `Removed attachment from questions[${index}].contents[${position}]`
    )

    renderQuestions()
  }

  // Delete question
  window.deleteQuestion = async (id) => {
    const index = questions.findIndex((q) => q.id === id)
    if (index === -1) {
      console.error(`Question ID ${id} not found`)
      showPopup('Question not found!')
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete question ${index + 1}?`
    )
    if (!confirmDelete) {
      console.log(`Cancel delete question ${index + 1}`)
      return
    }

    console.log(`Mark question ${index + 1} for deletion`)

    if (questions[index].action !== 'delete') {
      questions[index].action = 'delete'
    }

    renderQuestions()
  }
  let isFirstRender = true

  // Show question on ui
  const renderQuestions = () => {
    console.log('Update interface with question list:', questions)

    // Only call saveUserInput after the first render
    if (!isFirstRender) {
      saveUserInput()
    }
    questionsContainer.innerHTML = ''

    // Sort questions in order
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)

    sortedQuestions.forEach((q, index) => {
      const questionDiv = document.createElement('div')
      questionDiv.className = `rounded-lg border p-4 my-3 shadow bg-white flex flex-col transition-opacity ${
        q.action === 'delete' ? 'bg-black/10 line-through' : ''
      }`

      const questionContent = document.createElement('div')
      questionContent.className = 'flex justify-between items-start'

      const questionInnerDiv = document.createElement('div')
      questionInnerDiv.className = 'w-full'

      questionInnerDiv.innerHTML = `
        <label class="block font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</label>
        <textarea class="w-full border p-2 rounded mb-3 overflow-hidden"
                  placeholder="Enter question..."
                  rows="1"
                  ${q.action === 'delete' ? 'disabled' : ''}
                  oninput="updateQuestion(${index}, this.value, 0); autoResize(this)">${q.contents?.[0]?.text || ''}</textarea>
  
        <input type="file" accept="image/*,audio/*" class="mb-2 mt-2" 
                ${q.action === 'delete' ? 'disabled' : ''}
                onchange="handleMediaUpload(event, ${index}, 0)" />
  
        <div id="mediaPreview${index}_0" class="mt-2 flex justify-center p-2">
        ${
          q.contents?.[0]?.attachment
            ? q.contents[0].attachment.startsWith('data:audio')
              ? `<audio controls class="mt-2"><source src="${q.contents[0].attachment}" type="audio/mpeg">Your browser does not support the audio element.</audio>
                 <button class="text-red-500 hover:text-red-700 ml-2" onclick="removeAttachment(${index}, 0)">Delete</button>`
              : `<img src="${q.contents[0].attachment}" class="max-w-xs h-auto rounded-lg shadow-md object-contain">
                 <button class="text-red-500 hover:text-red-700 ml-2" onclick="removeAttachment(${index}, 0)">Delete</button>`
            : ''
        }
        </div>
  
        <div class="space-y-2">
          ${
            Array.isArray(q.contents)
              ? q.contents
                  .slice(1)
                  .map(
                    (option, i) => `
            <label class="space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100 flex flex-col">
              <div class="flex items-center space-x-2">
                <input type="radio" name="question${index}" class="mb-2"
                  value="${['A', 'B', 'C', 'D'][i]}"
                  ${q.correct === ['A', 'B', 'C', 'D'][i] ? 'checked' : ''}
                  ${q.action === 'delete' ? 'disabled' : ''}
                  onchange="setCorrectAnswer(${index}, '${['A', 'B', 'C', 'D'][i]}')" />
                <textarea class="border p-1 w-11/12 rounded resize-none overflow-hidden"
                          placeholder="Enter the answer..."
                          rows="1"
                          ${q.action === 'delete' ? 'disabled' : ''}
                          oninput="updateAnswer(${index}, ${i + 1}, this); autoResize(this)">${option.text || ''}</textarea>
              </div>
  
              <input type="file" accept="image/*,audio/*" class="ml-2 mt-2" 
                      ${q.action === 'delete' ? 'disabled' : ''}
                      onchange="handleMediaUpload(event, ${index}, ${i + 1})" />
  
              <div id="mediaPreview${index}_${i + 1}" class="mt-2 flex justify-center p-2">
                ${
                  option.attachment
                    ? option.attachment.startsWith('data:audio')
                      ? `<audio controls class="mt-2"><source src="${option.attachment}" type="audio/mpeg">Your browser does not support the audio element.</audio>
                         <button class="text-red-500 hover:text-red-700 ml-2" onclick="removeAttachment(${index}, ${i + 1})">Delete</button>`
                      : `<img src="${option.attachment}" class="max-w-xs h-auto rounded-lg shadow-md object-contain">
                         <button class="text-red-500 hover:text-red-700 ml-2" onclick="removeAttachment(${index}, ${i + 1})">Delete</button>`
                    : ''
                }
              </div>
            </label>
          `
                  )
                  .join('')
              : ''
          }
        </div>
      `

      if (questions.length > 1) {
        const deleteButton = document.createElement('button')
        deleteButton.textContent = q.action === 'delete' ? 'Undo' : 'X'
        deleteButton.className =
          'text-red-500 hover:text-red-700 ml-3 self-start'
        deleteButton.onclick = () => {
          if (q.action === 'delete') {
            q.action = q.id ? 'edit' : 'add'
          } else if (q.action === 'add') {
            questions.splice(index, 1)
          } else {
            q.action = 'delete'
          }
          renderQuestions()
        }
        questionContent.appendChild(questionInnerDiv)
        questionContent.appendChild(deleteButton)
      } else {
        questionContent.appendChild(questionInnerDiv)
      }

      questionDiv.appendChild(questionContent)
      questionsContainer.appendChild(questionDiv)
    })

    document.querySelectorAll('textarea').forEach(autoResize)
  }

  //Upload file Excel
  let questions = []
  window.handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (
      !file ||
      (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))
    ) {
      showPopup('Please upload a valid Excel file!')
      return
    }

    const reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' })
      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 }
      )

      if (jsonData.length < 2) {
        showPopup('Excel file has no data!')
        return
      }

      const newQuestions = jsonData
        .slice(1)
        .map((row, index) => {
          if (!row[0] || !row[1] || !row[2] || !row[3] || !row[4]) {
            console.warn(` Skipping line ${index + 1} due to missing data`)
            return null
          }

          return {
            action: 'add',
            contents: [
              { text: String(row[0] ?? '').trim(), type: 'Q' },
              { text: String(row[1] ?? '').trim(), type: 'A' },
              { text: String(row[2] ?? '').trim(), type: 'B' },
              { text: String(row[3] ?? '').trim(), type: 'C' },
              { text: String(row[4] ?? '').trim(), type: 'D' },
            ],
            correct: String(row[5] ?? 'A').trim(),
          }
        })
        .filter(Boolean) // Remove null elements
      questions.push(...newQuestions)

      console.log(
        'List of questions after uploading Excel:',
        JSON.stringify(questions, null, 2)
      )
      renderQuestions()
    }
  }

  //Upload attachment and preview it
  window.handleMediaUpload = async (event, idOrIndex, position) => {
    const file = event.target.files[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64String = reader.result
      console.log('Base64 generated:', base64String.substring(0, 50) + '...')

      let index =
        typeof idOrIndex === 'number' ? idOrIndex : parseInt(idOrIndex, 10)
      if (isNaN(index) || index < 0 || index >= questions.length) {
        index = questions.findIndex((q) => String(q.id) === String(idOrIndex))
      }

      if (index === -1 || !questions[index]) {
        console.error(`Error: No question found at ID/Index: ${idOrIndex}`)
        return
      }

      if (!questions[index].contents[position]) {
        console.error(
          `Error: Invalid position ${position} for question ${idOrIndex}`
        )
        return
      }

      questions[index].contents[position].attachment = base64String
      console.log(
        `Assigned attachment to questions[${index}][${position}]:`,
        questions[index].contents[position]
      )
      renderQuestions()
    }
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
    }
  }
  fileInput.addEventListener('change', handleFileUpload)

  //Convert url to base64
  async function urlToBase64(url) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    } catch (error) {
      console.error(`Error convert from URL to Base64: ${error}`)
      return undefined
    }
  }

  //Save and upload on api
  saveButton.addEventListener('click', async function (event) {
    event.preventDefault()
    saveButton.innerText = 'Loading...'
    saveButton.disabled = true

    if (questions.length < 1 || questions.every((q) => q.action === 'delete')) {
      showPopup(`Document must have at least 1 question!`)
      saveButton.innerText = 'Save'
      saveButton.disabled = false
      return
    }
    // Normalize data before sending
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (q.action !== 'delete') {
        if (q.action === 'add') {
          while (q.contents.length < 5) {
            q.contents.push({
              text: '',
              attachment: null,
              type:
                q.contents.length === 0
                  ? 'Q'
                  : ['A', 'B', 'C', 'D'][q.contents.length - 1],
            })
          }
        }
        for (let j = 0; j < q.contents.length; j++) {
          const isTextEmpty =
            !q.contents[j].text || q.contents[j].text.trim() === ''
          const isAttachmentEmpty =
            q.contents[j].attachment === null ||
            q.contents[j].attachment === undefined

          if (isTextEmpty && isAttachmentEmpty) {
            showPopup(
              `Question ${i + 1}, content ${j + 1} must have either text or attachment!`
            )
            saveButton.innerText = 'Save'
            saveButton.disabled = false
            return
          }

          if (isTextEmpty && !isAttachmentEmpty) {
            q.contents[j].text = undefined
          }
          if (!isTextEmpty && isAttachmentEmpty) {
            q.contents[j].attachment = undefined
          }
        }
        if (!['A', 'B', 'C', 'D'].includes(q.correct)) {
          showPopup(
            `Question ${i + 1} must have a valid correct answer (A, B, C, D)!`
          )
          saveButton.innerText = 'Save'
          saveButton.disabled = false
          return
        }
      }
    }

    //Log before sending data
    console.log('Questions before sending:', JSON.stringify(questions, null, 2))

    // Data upload
    const updatedData = {
      document: Number(documentId),
      title: docNameInput.value.trim(),
      description: descriptionInput.value.trim() || undefined,
      course: Number(courseSelect.value) || 0,
      questions: await Promise.all(
        questions.map(async (q, index) => {
          let questionData = {
            action: q.action === 'delete' ? 'delete' : q.id ? 'edit' : 'add',
          }

          if (q.action === 'delete') {
            questionData.id = q.id
          } else {
            questionData.order = index + 1
            questionData.correct = q.correct

            if (q.action === 'edit') {
              questionData.id = q.id
            }

            questionData.contents = await Promise.all(
              q.contents.map(async (c, idx) => {
                let attachmentBase64 = c.attachment
                if (c.attachment && c.attachment.startsWith('http')) {
                  attachmentBase64 = await urlToBase64(c.attachment)
                }
                const contentData = {
                  text:
                    c.text !== undefined
                      ? c.text
                      : q.action === 'add'
                        ? ' '
                        : null,
                }
                // Chỉ thêm attachment nếu nó có giá trị hợp lệ và không phải null/undefined
                if (q.action === 'add') {
                  if (
                    attachmentBase64 !== null &&
                    attachmentBase64 !== undefined
                  ) {
                    contentData.attachment = attachmentBase64
                  }
                } else {
                  // Với action !== 'add', giữ nguyên logic gửi attachment (bao gồm null)
                  contentData.attachment =
                    attachmentBase64 === undefined ? null : attachmentBase64
                }
                if (q.action === 'add') {
                  contentData.type =
                    c.type || (idx === 0 ? 'Q' : ['A', 'B', 'C', 'D'][idx - 1])
                }
                if (q.action === 'edit' && c.id) {
                  contentData.id = c.id
                }
                return contentData
              })
            )
          }

          return questionData
        })
      ),
    }

    console.log('API sent data:', JSON.stringify(updatedData, null, 2))
    console.log('Document ID:', documentId)

    try {
      const responsess = await fetch(`${API_DOCUMENTS}/edit-document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      })

      if (!responsess.ok) {
        const errorData = await responsess.json()
        console.log('Server error response:', errorData)
        throw new Error(errorData.message || 'Error while updating document!')
      }
      showPopup('Update successful!')
      setTimeout(
        () => (window.location.href = `detail.html?documentId=${documentId}`),
        1000
      )
    } catch (error) {
      console.error('Update error:', error)
      showPopup(error.message)
    } finally {
      saveButton.innerText = 'Save'
      saveButton.disabled = false
    }
  })
  ;(async () => {
    await loadDocument()
  })()
  popupMenu()
  userInfo()
})
