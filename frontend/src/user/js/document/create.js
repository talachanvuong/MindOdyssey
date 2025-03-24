import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
// ======================== DOM Elements ========================
const courseSelect = document.getElementById('course');
const createCourseBtn = document.getElementById('createcourse'); 
const fileInput = document.getElementById('fileInput');
const addQuestionBtn = document.getElementById('addquesbtn'); 
const createDocumentBtn = document.getElementById('createbtn'); 
const questionsContainer = document.getElementById('questionsContainer');

// ======================== API URLs ========================
const API_COURSE = 'http://localhost:3000/api/course'
const API_DOCUMENT = 'http://localhost:3000/api/document'

// ========================get user info ========================
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
// ======================== Popup Functions ========================
const showPopup = (message) => {
  document.getElementById('popupText').innerText = message;
  document.getElementById('popupMessage').classList.remove('hidden');
};

const closePopup = () => {
  document.getElementById('popupMessage').classList.add('hidden');
};
window.closePopup = closePopup;

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
// ======================== Load Course List ========================

const loadCourses = async () => {
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
      courseSelect.appendChild(option);
    });

    console.log("Courses loaded successfully!");
  } catch (error) {
    console.error('Course loading error:', error);
  }
};



// Load courses when the page opens
document.addEventListener('DOMContentLoaded', loadCourses);

// ======================== Create New Course ========================
const createCourse = async () => {
  const courseName = prompt('Enter course name:');
  if (!courseName || courseName.length < 8) {
    showPopup('Course name must be at least 8 characters!');
    return;
  }

  try {
    const response = await callApi.callApi(`${API_COURSE}/get-courses`, null, 'POST');
    const createResponse = await fetch(`${API_COURSE}/create-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: courseName }),
    });

    if (!createResponse.ok) {
      throw new Error('Unable to create course');
    }

    showPopup('Course created successfully!');
    loadCourses();
  } catch (error) {
    showPopup(error.message);
  }
};

// ======================== File Upload Handling ========================
let questions = [];
window.handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
    showPopup('Please upload a valid Excel file!');
    return;
  }

  const reader = new FileReader();
  reader.readAsBinaryString(file);
  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: 'binary' });
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

    if (jsonData.length < 2) {
      showPopup('Excel file contains no data!');
      return;
    }

    questions = jsonData.slice(1).map((row, index) => {
      if (!row[0] || !row[1] || !row[2] || !row[3] || !row[4]) {
        console.warn(`⚠️ Skipping row ${index + 1} due to missing data`);
        return null;
      }
      return {
        contents: [
          { text: String(row[0] ?? '').trim(), type: 'Q' },
          { text: String(row[1] ?? '').trim(), type: 'A' },
          { text: String(row[2] ?? '').trim(), type: 'B' },
          { text: String(row[3] ?? '').trim(), type: 'C' },
          { text: String(row[4] ?? '').trim(), type: 'D' },
        ],
        correct: String(row[5] ?? 'A').trim(),
      };
    }).filter(Boolean);
    
    console.log("Processed question list from Excel:", JSON.stringify(questions, null, 2));
    renderQuestions();
  };
};

// ======================== Display Questions ========================
const renderQuestions = () => {
  questionsContainer.innerHTML = "";
  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "rounded-lg border p-4 my-3 shadow bg-white flex flex-col";

    const questionContent = document.createElement("div");
    questionContent.className = "w-full";

    questionContent.innerHTML = `
      <label class="block font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</label>
      <textarea class="w-full border p-2 rounded mb-2 resize overflow-hidden"
                placeholder="Enter question..."
                rows="1"
                oninput="updateQuestion(${index}, this.value, 0); autoResize(this)">${q.contents[0].text}</textarea>
      
      <input type="file" accept="image/*,audio/*" class="mb-2 mt-2" onchange="handleMediaUpload(event, ${index}, 0)" />

      <div id="mediaPreview${index}_0" class="mt-2">
        ${q.contents[0].attachment ? `<img src="${q.contents[0].attachment}" class="max-w-full h-auto">` : ""}
      </div>

      <div class="space-y-2">
        ${q.contents
          .slice(1)
          .map(
            (option, i) => `
          <label class="space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100 flex flex-col">
            <div class="flex items-center space-x-2">
              <input type="radio" name="question${index}" class="mb-2" value="${["A", "B", "C", "D"][i]}"
                ${q.correct === ["A", "B", "C", "D"][i] ? "checked" : ""}
                onchange="setCorrectAnswer(${index}, '${["A", "B", "C", "D"][i]}')">
              <textarea class="border p-1 w-full rounded resize-none overflow-hidden"
                        placeholder="Enter the answer..."
                        rows="1"
                        oninput="updateAnswer(${index}, ${i + 1}, this); autoResize(this)">${option.text}</textarea>
            </div>

            <input type="file" accept="image/*,audio/*" class="ml-6 mt-2" onchange="handleMediaUpload(event, ${index}, ${i + 1})" />

            <div id="mediaPreview${index}_${i + 1}" class="mt-2">
              ${option.attachment ? `<img src="${option.attachment}" class="max-w-full h-auto">` : ""}
            </div>
          </label>
        `
          )
          .join("")}
      </div>
    `;

    // Chỉ hiển thị nút xóa nếu có hơn 1 câu hỏi
    if (questions.length > 1) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.className = "text-red-500 hover:text-red-700 self-start px-2 py-1 rounded-lg";
      deleteButton.onclick = () => deleteQuestion(index);

      // Đặt layout chính
      const questionWrapper = document.createElement("div");
      questionWrapper.className = "flex justify-between items-start";
      questionWrapper.appendChild(questionContent);
      questionWrapper.appendChild(deleteButton);

      questionDiv.appendChild(questionWrapper);
    } else {
      questionDiv.appendChild(questionContent);
    }

    questionsContainer.appendChild(questionDiv);
  });

  document.querySelectorAll("textarea").forEach(autoResize);
};




// Apply auto-expand to all textareas when rendering
window.handleMediaUpload = async (event, index, position) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64String = reader.result;

    questions[index].contents[position].attachment = base64String;

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
  element.style.height = 'auto' 
  element.style.height = element.scrollHeight + 'px' 
}

// Update question content
window.updateQuestion = (index, value, position) => {
  questions[index].contents[position].text = value
}

// Update answer content
window.updateAnswer = (index, optionIndex, element) => {
  questions[index].contents[optionIndex].text = element.value
}

// Update correct answer
window.setCorrectAnswer = (index, answer) => {
  questions[index].correct = answer
}

// Add new question with image and audio support
addQuestionBtn.addEventListener('click', () => {
  questions.push({
    contents: [
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
window.deleteQuestion = async (index) => {
  if (!questions[index]) {
    console.error(`Question not found in index ${index}`)
    return
  }
  questions.splice(index, 1)

  renderQuestions() 
}

document.addEventListener('DOMContentLoaded', () => {
  if (questions.length === 0) {
    questions.push({
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

// Send data to API when pressing "Create"

const createDocument = async (event) => {
  event.preventDefault();
  createDocumentBtn.innerText = 'Loading...';
  createDocumentBtn.disabled = true;

  const title = document.getElementById('documentName').value.trim();
  const inputElement = document.getElementById('description');
  const description = inputElement && inputElement.value.trim() ? inputElement.value.trim() : undefined;
  
  const courseId = courseSelect.value;

  if (!title || title.length < 8 || !courseId) {
    showPopup('Title and course must not be less than 8 characters!');
    createDocumentBtn.innerText = 'Create';
    createDocumentBtn.disabled = false;
    return;
  }

// Check each question
  for (let i = 0; i < questions.length; i++) {
    for (let j = 0; j < questions[i].contents.length; j++) {
      const { text, attachment } = questions[i].contents[j];

      // If both text and image are empty, return an error
      if ((String(text || '').trim() === '' && (!attachment || String(attachment).trim() === ''))) 
        {
        showPopup(`Question ${i + 1} or answer ${['Q', 'A', 'B', 'C', 'D'][j]} No content or attachment!`);
        createDocumentBtn.innerText = 'Create';
        createDocumentBtn.disabled = false;
        return;
      }
    }
  }

  const formattedQuestions = questions.map((q) => ({
    contents: q.contents.map((item) => {
      const text = item.text && typeof item.text === "string" && item.text.trim() !== "" ? item.text.trim() : undefined;
      const attachment = item.attachment ? String(item.attachment) : undefined;
    
      if (!text && !attachment) {
        console.error(`Error: Element ${item.type} has no content or attachments!`);
        showPopup(`Error: Question or answer ${item.type} has no content or file!`);
      }
    
      return { text, attachment, type: item.type };
    }),
    
    
    correct: q.correct || '',
  }));

  const requestData = {
    title,
    description,
    course: Number(courseId),
    questions: formattedQuestions,
  };
console.log("List of questions:", questions);
console.log("Data sent:", JSON.stringify(requestData, null, 2));

  try {
    const response = await fetch(`${API_DOCUMENT}/create-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestData),
    });
    
    const responseText = await response.text(); 
    console.log("Error API:", responseText);

    if (!response.ok) {  
      let errorMessage = `Error ${response.status}: ${response.statusText}`;


      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message; 
        }
      } catch (e) {
        console.warn("Error while parse JSON from API, error type text.");
        errorMessage = `Error ${response.status}: ${responseText}`;
      }

      showPopup(errorMessage); 
      throw new Error(errorMessage); 
    }
    if (!Array.isArray(requestData.questions) || requestData.questions.length === 0) {
      console.error("Error: No questions submitted.");
      return;
    }
    
    showPopup('Document created successfully!');
    setTimeout(() => window.location.href = 'manage.html', 3000);

  
  } catch (error) {
    console.error("Catch error:", error); 
    showPopup(error.message); 
  } finally {
    createDocumentBtn.innerText = 'Create';
    createDocumentBtn.disabled = false;
  }
};
popupMenu()
userInfo()
// Load course when page opens
createCourseBtn.addEventListener('click', createCourse)
fileInput.addEventListener('change', handleFileUpload)
createDocumentBtn.addEventListener('click', createDocument)
