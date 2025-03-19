import '../../../style.css'
import callApi  from '../model/callApi.js'

document.addEventListener('DOMContentLoaded', async function () {
  const API_DOCUMENTS = 'http://localhost:3000/api/document'

  const documentTitle = document.getElementById('titleDoc')
  const documentDate = document.getElementById('dateDoc')
  const questionsContainer = document.getElementById('questionsContainer')
  const statusContainer = document.getElementById('statusDoc')
  const rejectReason = document.getElementById('rejectReason');
  const editButton = document.getElementById('editButton')
  const deleteButton = document.getElementById('deleteButton')
  const documentDescription = document.getElementById('describeDoc')
  const documentCourse = document.getElementById('courseDoc')
  const totalQuestions = document.getElementById('totalquestion')
  const backButton = document.getElementById('btn_back')

  const urlParams = new URLSearchParams(window.location.search)
  const documentId = urlParams.get('documentId')
  if (!documentId || isNaN(Number(documentId))) {
    console.error('Invalid documentId:', documentId)
    alert('No valid document ID found!')
    return
  }

  async function loadDocument(documentId) {
    try {
   
      const response = await callApi.callApi(`${API_DOCUMENTS}/get-document-detail`, { document: Number(documentId) }, 'POST');
      
   
      if (!response || response.status !== 'success') {
        console.error('📌 API Error:', response);
        alert('Error loading document. Please try again later!');
      
      }
      const data = response.data;
      const doc = data;
      documentTitle.textContent = doc.title || 'No title';
      documentDate.textContent = doc.created_at || 'There is no creation date';
      documentDescription.textContent = `Describe: ${doc.description || 'No description available'}`;
      documentCourse.textContent = `Course: ${doc.course?.title || 'No courses'}`;
      totalQuestions.textContent = `${doc.questions?.length || 0} questions`;
  
      statusContainer.textContent = `Status: ${doc.status || 'No status'}`;
      statusContainer.className = 'text-gray-500';
  
      if (doc.status === 'Từ chối') {
        statusContainer.className = 'text-red-500';
        if (doc.reject_reason) {
          rejectReason.textContent = `Reason: ${doc.reject_reason}`;
          rejectReason.style.display = 'block';
        } else {
          rejectReason.style.display = 'none';
        }
      } else {
        rejectReason.style.display = 'none';
        if (doc.status === 'Chưa duyệt') {
          statusContainer.className = 'text-yellow-500';
        } else if (doc.status === 'Đã duyệt') {
          statusContainer.className = 'text-green-500';
        }
      }
  

      renderQuestions(doc.questions || []);
      return data;
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Error loading document. Please try again later!');
    }
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
        <p class="font-medium">${q.contents[0]?.text || ''}</p>
        <div id="mediaPreview${index}_0" class="mt-4 flex justify-center">
  ${q.contents[0]?.attachment ? `<img src="${q.contents[0].attachment}" class="max-w-xs h-auto rounded-lg shadow-md">` : ''}
</div>

        <div class="mt-2 space-y-2">
  ${q.contents
    .slice(1)
    .map((option, i) => {
      const optionLetter = ['A', 'B', 'C', 'D'][i]
      return `
      <div class="border rounded-lg p-2"> 
        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100">
          <input type="radio" name="question${index}" class="form-radio" value="${optionLetter}"
          ${q.correct_answer === optionLetter ? 'checked' : ''} disabled />
          <span>${option.text || ''}</span>
          ${q.correct_answer === optionLetter ? '<span class="text-green-500 font-bold">✅</span>' : ''}
        </label>

        
        <div id="mediaPreview${index}_${i + 1}" class="mt-4 flex justify-center">
          ${option.attachment ? `<img src="${option.attachment}" class="max-w-xs h-auto rounded-lg shadow-md">` : ''}
        </div>
      </div>
      `
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
    if (!documentId || isNaN(Number(documentId))) {
      alert("Error: Document ID is invalid!");
      return;
    }
    window.location.href = `edit.html?documentId=${documentId}`;
  });
  

  deleteButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await callApi.callApi(`${API_DOCUMENTS}/delete-document`, 
          { document: Number(documentId) }, 
          'DELETE'
        );
  
        if (!response || response.status !== 'success') {
          throw new Error(response?.message || 'Error deleting document!');
        }
  
        alert('Document deleted successfully!');
        window.location.href = 'manage.html';
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Unable to delete the document. Please try again later!');
      }
    }
  });
  
  await loadDocument(documentId)

  if (backButton)
    backButton.addEventListener(
      'click',
      () => (window.location.href = 'manage.html')
    )
  
})

