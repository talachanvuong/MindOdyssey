import '../../../style.css'
import callApi  from '../model/callApi.js'

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

  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get("documentId");
  
  console.log("Document ID from URL:", documentId);
  
  if (!documentId || isNaN(Number(documentId))) {
    alert("No valid document ID found!");
  
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

  // load document _id from url
  const loadCourses = async (selectedCourseId) => {
    try {
      const response = await callApi.callApi(`${API_COURSE}/get-courses`, null, 'POST');
  
      if (!response || response.status !== 'success') {
        throw new Error(`API Error: ${response?.status || 'Unknown error'}`);
      }
  
      const responseData = response.data; 
  
      if (!Array.isArray(responseData)) {
        console.warn("Invalid course data format:", responseData);
        return;
      }
  
      const courses = responseData;
      console.log("Courses:", courses);
  
      if (!courseSelect) {
        console.error("courseSelect element not found!");
        return;
      }
  
      courseSelect.innerHTML = '<option value="">Select course</option>';
  
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course.course_id;
        option.textContent = course.title;
        if (selectedCourseId && course.course_id === selectedCourseId) {
          option.selected = true;
        }
        courseSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };
  

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

  async function loadDocument() {
    try {
      const response = await fetch(`${API_DOCUMENTS}/get-document-detail`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ document: Number(documentId) }),
        }
      )

      if (!response.ok) throw new Error('Error loading document!')
      const data = await response.json()
      if (!data || !data.result) {
        alert('Document not found!')
        return
      }

      console.log('Document data:', data.result)

      const doc = data.result
      docNameInput.value = doc.title || ''
      descriptionInput.value = doc.description || ''
      await loadCourses(doc.course.id)

      questionsContainer.innerHTML = ''
      questions = doc.questions
        .map((q, index) => {
          if (!Array.isArray(q.contents) || q.contents.length === 0) return null
          const correctAnswer = q.correct_answer || ''
          console.log(`Question ${index + 1} - Correct answer:`, correctAnswer)

          // Create element containing question
          const questionDiv = document.createElement('div')
          questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white'

          questionDiv.innerHTML = `
  <label class="block font-semibold text-lg text-gray-800 mb-2">
    Question ${index + 1}:
  </label>
  <textarea class="w-full border p-2 rounded m-3 overflow-hidden"
            placeholder="Enter question..."
            rows="1"
            oninput="updateQuestion(${index}, this.value, 0); autoResize(this)">${q.contents[0]?.text || ''}</textarea>
  <input type="file" accept="image/*,audio/*" class="m-2" onchange="handleMediaUpload(event, ${index}, 0)" />

  <div id="mediaPreview${index}_0" class="mt-4 flex justify-center">
    ${
      q.contents[0]?.attachment
        ? q.contents[0].attachment.match(/\.(mp3|wav|ogg)$/)
          ? `<audio controls class="mt-2"><source src="${q.contents[0].attachment}" type="audio/mpeg">Your browser does not support the audio tag.</audio>`
          : `<img src="${q.contents[0].attachment}" class="max-w-xs h-auto rounded-lg shadow-md object-contain">`
        : ''
    }
  </div>

  <div class="space-y-2">
    ${q.contents
      .slice(1)
      .map((option, i) => {
        const optionLetter = ['A', 'B', 'C', 'D'][i]
        return `
        <div class="border rounded-lg p-2 space-y-2">
          <label class="flex items-center space-x-2  space-y-3 cursor-pointer hover:bg-gray-100">
            <input type="radio" name="question${index}" value="${optionLetter}"
                   ${correctAnswer === optionLetter ? 'checked' : ''}
                   onchange="setCorrectAnswer(${index}, '${optionLetter}')" />
            <textarea class="border p-1 w-full rounded resize-none overflow-hidden"
                      placeholder="Enter the answer..."
                      rows="1"
                      oninput="updateAnswer(${index}, ${i + 1}, this); autoResize(this)">${option.text || ''}</textarea>
          </label>

          <input type="file" accept="image/*,audio/*" class="ml-2" onchange="handleMediaUpload(event, ${index}, ${i + 1})" />

          <div id="mediaPreview${index}_${i + 1}" class="mt-4 flex justify-center">
            ${
              option.attachment
                ? option.attachment.match(/\.(mp3|wav|ogg)$/)
                  ? `<audio controls class="mt-2"><source src="${option.attachment}" type="audio/mpeg">Your browser does not support the audio tag.</audio>`
                  : `<img src="${option.attachment}" class="max-w-xs h-auto rounded-lg shadow-md object-contain">`
                : ''
            }
          </div>
        </div>
      `
      })
      .join('')}
  </div>
`

          if (questions.length > 1) {
            // Add delete button to `questionDiv`
            questionDiv.className =
              'relative rounded-lg border p-4 my-3 shadow bg-white'
            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'x'
            deleteButton.className =
              'absolute top-2 right-2 text-red-500 hover:text-red-700'
            deleteButton.onclick = () => deleteQuestion(index)
            questionDiv.appendChild(deleteButton)
          }
          questionsContainer.appendChild(questionDiv)

          return {
            id: q.id || undefined,
            action: q.id && !q.action ? 'edit' : q.action || 'add',
            correct: q.correct_answer || '',
            contents: q.contents || [],
          }
        })
        .filter(Boolean) // Remove null questions

        renderQuestions();
    } catch (error) {
      console.error('Error loading document:', error)
      alert(error.message)
    }
    document.querySelectorAll('textarea').forEach(autoResize)
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
        { text: '', attachment: '', type: 'Q' },
        { text: '', attachment: '', type: 'A' },
        { text: '', attachment: '', type: 'B' },
        { text: '', attachment: '', type: 'C' },
        { text: '', attachment: '', type: 'D' },
      ],
      correct: '',
    })

    console.log(
      'List of questions after adding:',
      JSON.stringify(questions, null, 2)
    )

    renderQuestions()
  })

  document.addEventListener('DOMContentLoaded', async () => {
    if (questions.length === 0) {
      questions.push({
        action: 'add',
        contents: [
          { text: '', attachment: '', type: 'Q' },
          { text: '', attachment: '', type: 'A' },
          { text: '', attachment: '', type: 'B' },
          { text: '', attachment: '', type: 'C' },
          { text: '', attachment: '', type: 'D' },
        ],
        correct: '',
      })
    }

    renderQuestions()
  })

  const saveUserInput = () => {
    document.querySelectorAll('textarea').forEach((textarea, index) => {
      const questionIndex = Math.floor(index / 5)
      const optionIndex = index % 5

      if (!questions[questionIndex]) return
      questions[questionIndex].contents[optionIndex].text =
        textarea.value.trim()
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

  window.deleteQuestion = async (index) => {
    if (!questions[index]) {
      console.error(`Question not found in index ${index}`)
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete question ${index + 1}?`
    )
    if (!confirmDelete) return

    console.log(` Mark question ${index + 1} for deletion`)

    questions[index].action = 'delete'

    renderQuestions()
  }

  const renderQuestions = () => {
    console.log('Update interface with question list:', questions)
    
    saveUserInput()

    questionsContainer.innerHTML = ''

    questions.forEach((q, index) => {
      if (q.action === 'delete') return //  Hide deleted questions from the interface

      const questionDiv = document.createElement('div')
      questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white'

      questionDiv.innerHTML = `
      <label class="block font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</label>
      <textarea class="w-full border p-2 rounded mb-3 overflow-hidden"
                placeholder="Enter question..."
                rows="1"
                oninput="updateQuestion(${index}, this.value, 0); autoResize(this)">${q.contents[0].text}</textarea>
      <input type="file" accept="image/*,audio/*" class="mb-2" onchange="handleMediaUpload(event, ${index}, 0)" /><br>
      <div id="mediaPreview${index}_0" class="mt-2">
        ${q.contents[0].attachment ? `<img src="${q.contents[0].attachment}" class="max-w-full h-auto">` : ''}
      </div>
      <div class="space-y-2">
        ${q.contents
          .slice(1)
          .map(
            (option, i) => `
          <label class="block space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
            <input type="radio" name="question${index}" class="mb-2" value="${['A', 'B', 'C', 'D'][i]}"
              ${q.correct === ['A', 'B', 'C', 'D'][i] ? 'checked' : ''}
              onchange="setCorrectAnswer(${index}, '${['A', 'B', 'C', 'D'][i]}')">
            <textarea class="border p-1 w-11/12 rounded resize-none overflow-hidden"
                      placeholder="Enter the answer..."
                      rows="1"
                      oninput="updateAnswer(${index}, ${i + 1}, this); autoResize(this)">${option.text}</textarea>
            <input type="file" accept="image/*,audio/*" class="ml-2" onchange="handleMediaUpload(event, ${index}, ${i + 1})" />
            <div id="mediaPreview${index}_${i + 1}" class="mt-2">
              ${option.attachment ? `<img src="${option.attachment}" class="max-w-full h-auto">` : ''}
            </div>
          </label>
        `
          )
          .join('')}
      </div>
    `
if(questions.length > 1) {
      questionDiv.className =
        'relative rounded-lg border p-4 my-3 shadow bg-white'
      const deleteButton = document.createElement('button')
      deleteButton.textContent = 'x'
      deleteButton.className =
        'absolute top-2 right-2 text-red-500 hover:text-red-700'
      deleteButton.onclick = () => deleteQuestion(index)
      questionDiv.appendChild(deleteButton)
}
      questionsContainer.appendChild(questionDiv)
    })

    document.querySelectorAll('textarea').forEach(autoResize)
  }

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

  window.handleMediaUpload = async (event, index, position) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64String = reader.result
      if (!questions[index]) {
        console.error(`Error: Question not found in index ${index}`)
        return
      }

      questions[index].contents[position].attachment = base64String;
      console.log(`Ảnh cập nhật vào questions[${index}][${position}]:`, base64String);

      document.getElementById(`mediaPreview${index}_${position}`).innerHTML =
        file.type.startsWith('audio')
          ? `<audio controls src="${base64String}"></audio>`
          : `<img src="${base64String}" class="max-w-full h-auto">`
    }
    reader.onerror = (error) => {
      console.error('Error converting file to base64:', error)
    }
  }
  fileInput.addEventListener('change', handleFileUpload)

  async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);  
            reader.onerror = (error) => reject(error);
        });
    } catch (error) {
        console.error(`Error convert from URL to Base64: ${error}`);
        return undefined;
    }
}


  saveButton.addEventListener('click', async function (event) {
    console.log("Save button clicked!"); 
    
    event.preventDefault()
    saveButton.innerText = 'Loading...';
    saveButton.disabled = true;
    const updatedData = {
      document: Number(documentId) ,
      title: docNameInput.value.trim(),
      description: descriptionInput.value.trim(),
      course: Number(courseSelect.value) || 0,
      questions: await Promise.all(
        questions.map(async (q, index) => {
          let questionData = {
            id: q.id || undefined,
            action: q.action === "delete" ? "delete" : q.id ? "edit" : "add",
          };
    
          if (q.action !== "delete") {
            questionData.order = index + 1;
            questionData.correct = ["A", "B", "C", "D"].includes(q.correct)
              ? q.correct
              : undefined;
    
            questionData.contents = await Promise.all(
              (q.contents || []).map(async (c) => {
                let attachmentBase64 = c.attachment;
    
                if (c.attachment) {
                  if (c.attachment.startsWith("http")) {
                    // If link Cloudinary convert to Base64
                    attachmentBase64 = await urlToBase64(c.attachment);
                  
                  } 
                }
    
                return {
                  id: c.id || undefined,
                  text: c.text?.trim() || undefined,
                  attachment: attachmentBase64 && attachmentBase64.trim() !== "" ? attachmentBase64 : undefined,
                  type: q.action === "add" ? c.type || "Q" : undefined,
                };
              })
            );
          }
    
          return questionData;
        })
      ),
    };
    

    console.log(' API sent data:', JSON.stringify(updatedData, null, 2))
    console.log("Document ID:", documentId);

    try {
      const responsess = await fetch(`${API_DOCUMENTS}/edit-document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      })

      if (!responsess.ok) {
        throw new Error('Error while updating document!')
      }
      alert('Update successful!')
      window.location.href = `detail.html?documentId=${documentId}`; 
      // await loadDocument()
    } catch (error) {
      console.error('Update error:', error)
      alert('An error occurred while saving data!')
    }
  });
  (async () => {
    await loadDocument()
  })()

})
