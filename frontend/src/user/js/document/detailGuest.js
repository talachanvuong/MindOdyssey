import '../../../style.css'

document.addEventListener('DOMContentLoaded', async function () {
  const API_DOCUMENTS = 'http://localhost:3000/api/document'
  const documentTitle = document.querySelector('h1')
  const documentDate = document.querySelector('.text-gray-700')
  const questionsContainer = document.querySelector('section.mt-6')
  const statusContainer = document.createElement('p')
  const documentDescription = document.createElement('p')
  documentDescription.className = 'text-gray-600 mt-2'
  const documentCourse = document.createElement('p')
  documentCourse.className = 'text-gray-600 mt-2'
  const totalQuestions = document.getElementById('totalquestion')

  const urlParams = new URLSearchParams(window.location.search)
  const documentId = urlParams.get('documentId')
  if (!documentId || isNaN(Number(documentId))) {
    alert('Không tìm thấy ID tài liệu hợp lệ!')
    return
  }


  async function loadDocument() {
    try {
      const response = await fetch(`${API_DOCUMENTS}/get-document-detail-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ document: Number(documentId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Lỗi khi tải tài liệu - HTTP Status: ${response.status}`, errorData);

        if (errorData.message === 'Document not approved!') {
          alert('Tài liệu chưa được duyệt. Vui lòng quay lại sau.');
          window.location.href = `manage.html`
          return;
        }
        throw new Error('Lỗi khi tải tài liệu!');
      }

      const data = await response.json();
      if (!data.result) {
        alert('Không tìm thấy tài liệu!');
        return;
      }

      const doc = data.result;
      documentTitle.textContent = doc.title || 'Không có tiêu đề';
      documentDate.textContent = doc.created_at || 'Không có ngày tạo';
      documentDescription.textContent = `Mô tả: ${doc.description || 'Không có mô tả'}`;
      documentCourse.textContent = `Khóa học: ${doc.course?.title || 'Không có khóa học'}`;
      documentTitle.insertAdjacentElement('afterend', documentDescription);
      documentDescription.insertAdjacentElement('afterend', documentCourse);
      totalQuestions.textContent = `${doc.questions?.length || 0} câu hỏi`;

      statusContainer.textContent ='✅ Đã duyệt';
      statusContainer.className = doc.approved ? 'text-green-600' : 'text-red-600';
      documentTitle.insertAdjacentElement('afterend', statusContainer);

      renderQuestions(doc.questions || []);
    } catch (error) {
      console.error('❌ Lỗi tải tài liệu:', error);
      alert('Lỗi khi tải tài liệu. Vui lòng thử lại sau!');
    }
  }

  function renderQuestions(questions) {
    questionsContainer.innerHTML = '';

    if (questions.length === 0) {
      questionsContainer.innerHTML = '<p class="text-gray-500">Không có câu hỏi nào.</p>';
      return;
    }

    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white';

      questionDiv.innerHTML = `
        <label class="block font-semibold text-lg text-gray-800 mb-2">Câu hỏi ${index + 1}:</label>
        <p class="font-medium">${q.contents[0]?.text || 'Không có nội dung'}</p>
        <div id="mediaPreview${index}_0" class="mt-2">
          ${q.contents[0].attachment ? `<img src="${q.contents[0].attachment}" class="max-w-full h-auto">` : ''}
        </div>
        <div class="mt-2 space-y-2">
          ${q.contents
            .slice(1)
            .map((option, i) => {
              const optionLetter = ['A', 'B', 'C', 'D'][i];
              return `
              <label class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="radio" name="question${index}" class="form-radio" value="${optionLetter}"
                ${q.correct_answer === optionLetter ? 'checked' : ''} disabled />
                <span>${option.text || 'Không có nội dung'}</span>
                ${q.correct_answer === optionLetter ? '<span class="text-green-500 font-bold">(Đáp án đúng)</span>' : ''}
              </label>`;
            })
            .join('')}
        </div>
      `;

      questionsContainer.appendChild(questionDiv);
    });
  }


  // Gọi hàm loadDocument()
  await loadDocument()

  function renderQuestions(questions) {
    questionsContainer.innerHTML = ''

    if (questions.length === 0) {
      questionsContainer.innerHTML =
        '<p class="text-gray-500">Không có câu hỏi nào.</p>'
      return
    }

    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div')
      questionDiv.className = 'rounded-lg border p-4 my-3 shadow bg-white'

      questionDiv.innerHTML = `
        <label class="block font-semibold text-lg text-gray-800 mb-2">Câu hỏi ${index + 1}:</label>
        <p class="font-medium">${q.contents[0]?.text || 'Không có nội dung'}</p>
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
                <span>${option.text || 'Không có nội dung'}</span>
                ${q.correct_answer === optionLetter ? '<span class="text-green-500 font-bold">(Đáp án đúng)</span>' : ''}
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

  await loadDocument()
})
