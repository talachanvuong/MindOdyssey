import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import {timeConvert} from '../../../utils/convertUtils.js'

// ======================== DOM Elements ========================
const searchInput = document.getElementById('search')
const filterButton = document.getElementById('filterButton')
const timeFilterModal = document.getElementById('timeFilterModal')
const applyFilter = document.getElementById('applyFilter')
const closeModal = document.getElementById('closeModal')
const startDateInput = document.getElementById('startDate')
const docList = document.getElementById('document-list')
const addButton = document.getElementById('addDocument')
const backButton = document.getElementById('btn_back')
const pagination = document.getElementById('pagination')
const docSumElement = document.getElementById('doc_sum')

// ======================== API URLs ========================
const API_DOCUMENTS = 'http://localhost:3000/api/document'

// ======================== Pagination Variables ========================
let curPage = 1
const itemsPerPage = 9
let allDocuments = []

// ======================== Popup ========================
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
// ======================== Load Initial Data ========================
document.addEventListener('DOMContentLoaded', async function () {
  await loadDocuments()
})
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
// ======================== Load and Render Documents ========================
async function loadDocuments() {
  try {
    const response = await fetch(`${API_DOCUMENTS}/get-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('API data returned:', responseData);

     // Check if the API data is in the correct format
    if (!responseData || !responseData.result || !Array.isArray(responseData.result.documents)) {
      throw new Error('Invalid API response structure');
    }

      // Assign documents data to the variable allDocuments
    allDocuments = responseData.result.documents;

    updateDocumentCount();
    renderDocuments(allDocuments);
  } catch (error) {
    console.error('Error loading document list:', error);
    alert('Failed to load document list. Please try again later.');
  }
}


// ======================== Update Document Count ========================
function updateDocumentCount(filteredCount = allDocuments.length) {
  if (docSumElement) {
    docSumElement.textContent = `Total documents: ${filteredCount}`;
  }
}

// ======================== Render Documents with Pagination ========================
function renderDocuments(documents) {
  if (!docList) return
  docList.innerHTML = ''
  const totalPages = Math.ceil(documents.length / itemsPerPage)
  curPage = Math.min(curPage, totalPages) || 1

  const start = (curPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedDocs = documents.slice(start, end)

  paginatedDocs.forEach((doc) => {
    if (!doc.document_id) return
    const listItem = document.createElement('li')
    listItem.id = `document-item-${doc.document_id}`
    listItem.dataset.id = doc.document_id
    listItem.classList.add(
      'flex',
      'items-center',
      'justify-between',
      'py-4',
      'pl-4',
      'pr-5',
      'text-sm/6'
    )
    listItem.innerHTML = `
      <div class="flex w-0 flex-1 items-center justify-between">
        <p class="truncate font-medium">${doc.title}</p>
        <br>
        <p class="  truncate font-thin">(${timeConvert (doc.created_at)})</p>
      </div>

    `
    // Assign event immediately after listItem is added to the DOM

    listItem.addEventListener('click', function () {
      const docId = this.dataset.id
      if (!docId) {
        alert('Document ID not found!')
        return
      }
      window.location.href = `detail.html?documentId=${docId}`
    })

    docList.appendChild(listItem)
  })
  renderPagination(totalPages)

  // Assign document deletion event
  document.querySelectorAll('.delete-btn').forEach((button) => {
    const docId = button.getAttribute('data-id')
    if (!docId) return
    button.addEventListener('click', function () {
      deleteDocument(docId)
    })
  })
}

// ======================== Render Pagination ========================
function renderPagination(totalPages) {
  pagination.innerHTML = ''
  if (totalPages <= 1) return

  const paginationHTML = `
    <div class="flex items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button id="prevPage" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
        <button id="nextPage" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <nav class="shadow-xs isolate inline-flex -space-x-px rounded-md" aria-label="Pagination">
          <button id="prevArrow" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">«</button>
          ${Array.from({ length: totalPages }, (_, i) => `<button class="page-btn relative inline-flex items-center px-4 py-2 text-sm font-semibold ${curPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}" data-page="${i + 1}">${i + 1}</button>`).join('')}
          <button id="nextArrow" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">»</button>
        </nav>
      </div>
    </div>
  `

  pagination.innerHTML = paginationHTML

  document
    .getElementById('prevPage')
    .addEventListener('click', () => changePage(curPage - 1))
  document
    .getElementById('nextPage')
    .addEventListener('click', () => changePage(curPage + 1))
  document
    .getElementById('prevArrow')
    .addEventListener('click', () => changePage(curPage - 1))
  document
    .getElementById('nextArrow')
    .addEventListener('click', () => changePage(curPage + 1))
  document.querySelectorAll('.page-btn').forEach((button) => {
    button.addEventListener('click', (event) =>
      changePage(Number(event.target.dataset.page))
    )
  })
}

function changePage(page) {
  const totalPages = Math.ceil(allDocuments.length / itemsPerPage)
  if (page < 1 || page > totalPages) return
  curPage = page
  renderDocuments(allDocuments)
  renderPagination(totalPages)
}

// ======================== Delete Document ========================
window.deleteDocument = async function (id) {
  if (!id || isNaN(Number(id))) return
  if (!confirm('Are you sure you want to delete this document?')) return
  try {
    const response = await fetch(`${API_DOCUMENTS}/delete-document`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ document: Number(id) }),
    })

    const responseText = await response.text() // Lấy phản hồi chi tiết từ API
    console.log('Phản hồi từ API:', responseText)

    if (!response.ok)
      throw new Error(`Error API: ${response.status} - ${responseText}`)
    alert('Document deletion successful!')
    await loadDocuments()
  } catch (error) {
    console.error('Error deleting document:', error)
    showPopup(`Error deleting document: ${error.message}`)
  }
}

// ======================== Search & Filter Documents ========================
function parseDate(dateString) {
  // Nếu là timestamp (số)
  if (typeof dateString === 'number' || (!isNaN(Number(dateString)) && dateString.match(/^\d+$/))) {
    return new Date(Number(dateString));
  }

  // Nếu là chuỗi dạng "HH:MM:SS Day DD/MM/YYYY"
  const parts = dateString.match(
    /(\d{2}):(\d{2}):(\d{2}) (\w{3}) (\d{2})\/(\d{2})\/(\d{4})/
  );
  if (parts) {
    const [, hh, mm, ss, , day, month, year] = parts;
    return new Date(`${year}-${month}-${day}T${hh}:${mm}:${ss}`);
  }

  // Nếu là định dạng khác (ISO, v.v.), thử parse trực tiếp
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  return null; // Trả về null nếu không parse được
}

function searchAndFilterDocuments() {
  if (!searchInput || !startDateInput) {
    console.error('Search input or start date input not found in DOM');
    return;
  }

  const query = searchInput.value.toLowerCase();
  const startDateInputValue = startDateInput.value;
  const startDate = startDateInputValue ? new Date(startDateInputValue) : null;

  if (startDate && isNaN(startDate.getTime())) {
    console.warn('Invalid start date:', startDateInputValue);
    return;
  }

  const filteredDocs = allDocuments.filter((doc) => {
    const docDate = parseDate(doc.created_at);
    if (!docDate) {
      console.warn('Invalid doc.created_at:', doc.created_at);
      return false;
    }

    const matchesQuery = doc.title.toLowerCase().includes(query);
    const matchesDate = !startDate || docDate >= startDate;

    return matchesQuery && matchesDate;
  });

  updateDocumentCount(filteredDocs.length);
  renderDocuments(filteredDocs);
}


// ======================== Event Listeners ========================
if (searchInput) searchInput.addEventListener('input', searchAndFilterDocuments)
if (startDateInput)
  startDateInput.addEventListener('change', searchAndFilterDocuments)

if (filterButton)
  filterButton.addEventListener('click', () =>
    timeFilterModal?.classList.toggle('invisible')
  )
if (applyFilter)
  applyFilter.addEventListener('click', () =>
    timeFilterModal?.classList.add('invisible')
  )
if (closeModal)
  closeModal.addEventListener('click', () =>
    timeFilterModal?.classList.add('invisible')
  )

if (addButton)
  addButton.addEventListener(
    'click',
    () => (window.location.href = 'create.html')
  )

if (backButton)
  backButton.addEventListener(
    'click',
    () => (window.location.href = '../account/lobby.html')
  )
  popupMenu()
  userInfo() 