import '../../../style.css'

document.addEventListener('DOMContentLoaded', async function () {
  const API_DOCUMENTS = 'http://localhost:3000/api/document'
  const API_INF_USER = 'http://localhost:3000/api/user'
  const documentTitle = document.getElementById('titleDoc')
  const documentDate = document.getElementById('dateDoc')
  const questionsContainer = document.querySelector('section.mt-6')
  const statusContainer = document.getElementById('statusDoc')
  const editButton = document.getElementById('editButton')
  const deleteButton = document.getElementById('deleteButton')
  const documentDescription = document.getElementById('describeDoc')
  const documentCourse = document.getElementById('courseDoc')
  const totalQuestions = document.getElementById('totalquestion')
  const backButton = document.getElementById('btn_back')

  const urlParams = new URLSearchParams(window.location.search)
  const documentId = urlParams.get('documentId')
  if (!documentId || isNaN(Number(documentId))) {
    alert('No valid document ID found!')
    return
  }
  async function getCurrentUserId() {
    try {
      const response = await fetch(`${API_INF_USER}/getuserid`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) throw new Error(`Lỗi API: ${response.status}`)

      const data = await response.json()
      return data.result ? Number(data.result) : null
    } catch (error) {
      console.error('Error when getting user ID:', error)
      return null
    }
  }

  // async function isDocumentAuthor(userId, documentId) {
  //   try {
  //     const response = await fetch(`${API_DOCUMENTS}/get-document-detail-owner`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include',
  //       // body: JSON.stringify({ user_id: Number(userId), document: Number(documentId) }),
  //       body: JSON.stringify({document: Number(documentId) }),

  //     });

  //     if (!response.ok) {
  //       console.error(`❌ Lỗi API - HTTP Status: ${response.status}`);
  //       return false;
  //     }

  //     const data = await response.json();
  //     console.log('📌 API Response:', data);

  //     // Kiểm tra nếu API trả về `result` và có dữ liệu hợp lệ
  //     return data.result && data.result.length > 0;
  //   } catch (error) {
  //     console.error('❌ Lỗi khi kiểm tra quyền sở hữu tài liệu:', error);
  //     return false;
  //   }
  // }

  async function loadDocument(documentId) {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        alert('Unable to identify user.')
        return
      }

      if (!documentId) {
        console.error('Invalid documentId:', documentId)
        alert('Error: No valid documentId.')
        return
      }

      let response = await fetch(`${API_DOCUMENTS}/get-document-detail-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ document: Number(documentId) }),
      })

      let data
      if (response.ok) {
        data = await response.json()
        console.log('📌 API Owner Response:', data)
      } else {
        // console.warn('⚠ API Owner thất bại, thử API Guest...');
        // response = await fetch(`${API_DOCUMENTS}/get-document-detail-guest`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     credentials: 'include',
        //     body: JSON.stringify({ document: Number(documentId) }),
        // });

        // if (!response.ok) {
        //     const errorData = await response.json();
        //     console.error(`❌ Lỗi khi tải tài liệu - HTTP Status: ${response.status}`, errorData);

        //     if (errorData.message === 'Document not approved!') {
        //         alert('Tài liệu chưa được duyệt. Vui lòng quay lại sau.');
        //         return;
        //     }
        //     alert(errorData.message || 'Không thể tải tài liệu.');
        //     return;
        // }

        // data = await response.json();
        alert('You are not the owner of this document!')
        window.location.href = `datailGuest.html`
      }

      const doc = data.result
      documentTitle.textContent = doc.title || 'No title'
      documentDate.textContent = doc.created_at || 'There is no creation date'
      documentDescription.textContent = `Describe: ${doc.description || 'No description available'}`
      documentCourse.textContent = `Course: ${doc.course?.title || 'No courses'}`
      documentTitle.insertAdjacentElement('afterend', documentDescription)
      documentDescription.insertAdjacentElement('afterend', documentCourse)
      totalQuestions.textContent = `${doc.questions?.length || 0} question`

      statusContainer.textContent = doc.approved
        ? '✅ Approved'
        : '❌ Not approved '
      statusContainer.className = doc.approved
        ? 'text-green-600'
        : 'text-red-600'
      documentTitle.insertAdjacentElement('afterend', statusContainer)

      renderQuestions(doc.questions || [])
    } catch (error) {
      console.error('Error loading document:', error)
      alert('Error loading document. Please try again later!')
    }
  }

  function renderQuestions(questions) {
    questionsContainer.innerHTML = ''

    if (questions.length === 0) {
      questionsContainer.innerHTML = '<p class="text-gray-500">No questions</p>'
      return
    }

    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div')
      questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white'

      questionDiv.innerHTML = `
        <label class="block font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</label>
        <p class="font-medium">${q.contents[0]?.text || 'No content'}</p>
        <div id="mediaPreview${index}_0" class="mt-2">
          ${q.contents[0].attachment ? `<img src="${q.contents[0].attachment}" class="max-w-full h-auto">` : ''}
        </div>
        <div class="mt-2 space-y-2">
          ${q.contents
            .slice(1)
            .map((option, i) => {
              const optionLetter = ['A', 'B', 'C', 'D'][i]
              return `
              <label class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="radio" name="question${index}" class="form-radio" value="${optionLetter}"
                ${q.correct_answer === optionLetter ? 'checked' : ''} disabled />
                <span>${option.text || 'No content'}</span>
                ${q.correct_answer === optionLetter ? '<span class="text-green-500 font-bold">(Correct answer)</span>' : ''}
              </label>`
            })
            .join('')}
        </div>
      `

      questionsContainer.appendChild(questionDiv)
    })
  }

  function renderQuestions(questions) {
    questionsContainer.innerHTML = ''

    if (questions.length === 0) {
      questionsContainer.innerHTML =
        '<p class="text-gray-500">No questions .</p>'
      return
    }

    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div')
      questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white'

      questionDiv.innerHTML = `
        <label class="block font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</label>
        <p class="font-medium">${q.contents[0]?.text || 'No content'}</p>
        <div id="mediaPreview${index}_0" class="mt-2">
          ${q.contents[0].attachment ? `<img src="${q.contents[0].attachment}" class="max-w-full h-auto">` : ''}
        </div>
        <div class="mt-2 space-y-2">
          ${q.contents
            .slice(1)
            .map((option, i) => {
              const optionLetter = ['A', 'B', 'C', 'D'][i]
              return `
              <label class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="radio" name="question${index}" class="form-radio" value="${optionLetter}"
                ${q.correct_answer === optionLetter ? 'checked' : ''} disabled />
                <span>${option.text || 'No content'}</span>
                ${q.correct_answer === optionLetter ? '<span class="text-green-500 font-bold">(Correct answer)</span>' : ''}
              </label>`
            })
            .join('')}
        </div>
      `

      questionsContainer.appendChild(questionDiv)
    })
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

  editButton.addEventListener('click', () => {
    window.location.href = `edit.html?documentId=${documentId}`
  })

  deleteButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`${API_DOCUMENTS}/delete-document`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ document: Number(documentId) }),
        })
        if (!response.ok) throw new Error('Error deleting document!')
        alert('Document deleted successfully!')
        window.location.href = 'manage.html'
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  })
  await loadDocument(documentId)
  await getCurrentUserId()

  if (backButton)
    backButton.addEventListener(
      'click',
      () => (window.location.href = 'manage.html')
    )
  
})

