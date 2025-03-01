// Biến viết thường
// Hàm viết hoa từ thứ 2

import '../../../style.css'
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dht3ebax8/upload'
const CLOUDINARY_UPLOAD_PRESET = 'DO_AN_NHOM_1' //  API Endpoints

const API_COURSE = 'http://localhost:3000/api/course'
const API_DOCUMENT = 'http://localhost:3000/api/document'

//  DOM Elements
const courseSelect = document.getElementById('course')
const createCourseBtn = document.querySelector('span.cursor-pointer') //"Create new course" button
const fileInput = document.getElementById('fileInput')
const addQuestionBtn = document.querySelector('button[type="button"]') //"Add question" button
const createDocumentBtn = document.querySelector('button[type="submit"]') //"Create" button
const questionsContainer = document.getElementById('questionsContainer')

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

// Function to load course list
const loadCourses = async () => {
  try {
    const response = await fetch(API_COURSE, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Lỗi API: ${response.status}')

    const responseData = await response.json()

    if (!responseData.result || !Array.isArray(responseData.result)) {
      return
    }

    const courses = responseData.result

    courseSelect.innerHTML = '<option value="">Select course</option>'

    courses.forEach((course) => {
      const option = document.createElement('option')
      option.value = course.course_id
      option.textContent = course.title
      courseSelect.appendChild(option)
    })
  } catch (error) {
    console.error(' Course loading error:', error)
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
    const createResponse = await fetch(API_COURSE, {
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

// Variable to save questions from Excel file
let questions = []
window.handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
    showPopup('Please upload Excel file!')
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
    questions = jsonData.slice(1).map((row) => ({
      content: [
        { text: row[0] || '', type: 'Q' },
        { text: row[1] || '', type: 'A' },
        { text: row[2] || '', type: 'B' },
        { text: row[3] || '', type: 'C' },
        { text: row[4] || '', type: 'D' },
      ],
      correct: row[5] || 'A',
    }))
    renderQuestions()
  }
}

// Display list of questions

const renderQuestions = () => {
  questionsContainer.innerHTML = ''
  questions.forEach((q, index) => {
    const questionHTML = `
      <div class="rounded-lg border p-4 my-3 shadow bg-white">
        <label class="block font-semibold text-lg text-gray-800 mb-2">
          Câu hỏi ${index + 1}:
        </label>
        <textarea class="w-full border p-2 rounded mb-3 resize-none overflow-hidden"
                  placeholder="Enter question..." 
                  rows="1" 
                  oninput="updateQuestion(${index}, this.value, 0); autoResize(this)">${q.content[0].text}</textarea>
        
        <input type="file" accept="image/*,audio/*" class="mb-2" onchange="handleMediaUpload(event, ${index}, 0)" />
        <div id="mediaPreview${index}_0" class="mt-2">${q.content[0].attachment ? `<img src="${q.content[0].attachment}" class="max-w-full h-auto">` : ''}</div>
        
        <div class="space-y-2">
          ${q.content
            .slice(1)
            .map(
              (option, i) => `
            <label class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
              <input type="radio" name="question${index}" 
                     ${q.correct === ['A', 'B', 'C', 'D'][i] ? 'checked' : ''} 
                     onchange="setCorrectAnswer(${index}, '${['A', 'B', 'C', 'D'][i]}')" />
              <textarea class="border p-1 w-full rounded resize-none overflow-hidden"
                        placeholder="Enter answer..."
                        rows="1"
                        oninput="updateAnswer(${index}, ${i + 1}, this); autoResize(this)">${option.text}</textarea>
              <input type="file" accept="image/*,audio/*" class="ml-2" onchange="handleMediaUpload(event, ${index}, ${i + 1})" />
              <div id="mediaPreview${index}_${i + 1}" class="mt-2">${option.attachment ? `<img src="${option.attachment}" class="max-w-full h-auto">` : ''}</div>
            </label>
          `
            )
            .join('')}
        </div>
      </div>`

    questionsContainer.innerHTML += questionHTML
  })
  document.querySelectorAll('textarea').forEach(autoResize)
}

// Apply auto-expand to all textareas when rendering

window.handleMediaUpload = async (event, index, position) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64String = reader.result;
    console.log(`Ảnh đã tải lên cho câu hỏi ${index}, vị trí ${position}:`, base64String); // Kiểm tra ảnh

    if (!questions[index]) {
      console.error(`Lỗi: Không tìm thấy câu hỏi tại index ${index}`);
      return;
    }

    questions[index].content[position].attachment = base64String;

    document.getElementById(`mediaPreview${index}_${position}`).innerHTML =
      file.type.startsWith('audio')
        ? `<audio controls src="${base64String}"></audio>`
        : `<img src="${base64String}" class="max-w-full h-auto">`;
  };

  reader.onerror = (error) => {
    console.error('Error converting file to base64:', error);
  };
};


// Function to automatically expand textarea according to content
window.autoResize = (element) => {
  element.style.height = 'auto' // Reset chiều cao để đo chính xác
  element.style.height = element.scrollHeight + 'px' // Update height according to content
}

// Update question content
window.updateQuestion = (index, value, position) => {
  questions[index].content[position].text = value
}

// Update answer content
window.updateAnswer = (index, optionIndex, element) => {
  questions[index].content[optionIndex].text = element.value
}

// Update correct answer
window.setCorrectAnswer = (index, answer) => {
  questions[index].correct = answer
}

// Thêm câu hỏi mới với hỗ trợ ảnh và âm thanh
addQuestionBtn.addEventListener('click', () => {
  questions.push({
    content: [
      { text: '', attachment: '', type: 'Q' },
      { text: '', attachment: '', type: 'A' },
      { text: '', attachment: '', type: 'B' },
      { text: '', attachment: '', type: 'C' },
      { text: '', attachment: '', type: 'D' },
    ],
    correct: '',
  })
  renderQuestions()
})

document.addEventListener('DOMContentLoaded', () => {
  if (questions.length === 0) {
    questions.push({
      content: [
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

// Send data to API when pressing "Create"

const createDocument = async (event) => {
  event.preventDefault();
  createDocumentBtn.innerText = 'Loading...';
  createDocumentBtn.disabled = true;

  const title = document.getElementById('documentName').value.trim();
  const description = document.getElementById('description').value.trim();
  const courseId = courseSelect.value;

  if (!title || title.length < 8 || !courseId || questions.length === 0) {
    showPopup('Please enter complete information!');
    createDocumentBtn.innerText = 'Create';
    createDocumentBtn.disabled = false;
    return;
  }

  // Kiểm tra từng câu hỏi
  for (let i = 0; i < questions.length; i++) {
    for (let j = 0; j < questions[i].content.length; j++) {
      const { text, attachment } = questions[i].content[j];

      // Nếu cả chữ và ảnh đều trống, báo lỗi
      if ((text.trim() === '' || text.trim() == null) && (!attachment || attachment.trim() === '')) {
        showPopup(`Câu hỏi ${i + 1} hoặc đáp án ${['Q', 'A', 'B', 'C', 'D'][j]} không có nội dung hoặc hình ảnh!`);
        createDocumentBtn.innerText = 'Create';
        createDocumentBtn.disabled = false;
        return;
      }
    }
  }

  const formattedQuestions = questions.map((q) => ({
    content: q.content.map((item) => ({
      text: String(item.text || ''),
      attachment: item.attachment ? String(item.attachment) : undefined,
      type: item.type,
    })),
    correct: q.correct || '',
  }));

  const requestData = {
    title,
    description,
    course: Number(courseId),
    questions: formattedQuestions,
  };

  try {
    const response = await fetch(API_DOCUMENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Error creating document: ${response.status}`);
    }

    showPopup('Document created successfully!');
    setTimeout(() => {
      window.location.href = 'manage.html';
    }, 2000);
  } catch (error) {
    showPopup(`Error: ${error.message}`);
  } finally {
    createDocumentBtn.innerText = 'Create';
    createDocumentBtn.disabled = false;
  }
};


// Load course when page opens
createCourseBtn.addEventListener('click', createCourse)
fileInput.addEventListener('change', handleFileUpload)
createDocumentBtn.addEventListener('click', createDocument)
