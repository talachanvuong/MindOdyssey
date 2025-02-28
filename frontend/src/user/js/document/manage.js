import '../../../style.css'

// DOM Elements
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
const displayElement = document.getElementById('display_name')
const docSumElement = document.getElementById('doc_sum')

// API URLs
const API_DOCUMENTS = 'http://localhost:3000/api/document'
const API_INF_USER = 'http://localhost:3000/api/user/showinfo'

// Pagination Variables
let curPage = 1
const itemsPerPage = 5
let allDocuments = []

// Load initial data
document.addEventListener('DOMContentLoaded', async function () {
  await loadInfname()
  await loadDocuments()
})

// Load user info
async function loadInfname() {
  try {
    const response = await fetch(API_INF_USER, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`)
    const responseData = await response.json()
    if (!responseData.result || typeof responseData.result !== 'object') return
    displayElement.textContent =
      responseData.result.display_name || 'Không có dữ liệu'
  } catch (error) {
    console.error('Lỗi tải thông tin người dùng:', error)
  }
}

// Load and render documents
async function loadDocuments() {
  try {
    const response = await fetch(API_DOCUMENTS, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

    const responseData = await response.json();
    console.log('Dữ liệu API trả về:', responseData);

    // Kiểm tra dữ liệu API có đúng định dạng không
    if (!responseData.result || !Array.isArray(responseData.result.documents)) {
      console.error('Dữ liệu không phải mảng:', responseData.result);
      return;
    }

    // Gán dữ liệu documents vào biến allDocuments
    allDocuments = responseData.result.documents;

    updateDocumentCount();
    renderDocuments(allDocuments);
  } catch (error) {
    console.error('Lỗi tải danh sách tài liệu:', error);
  }
}


// Cập nhật tổng số tài liệu
function updateDocumentCount() {
  if (docSumElement) {
    docSumElement.textContent = `Total documents: ${allDocuments.length}`
  }
}

// Render documents with pagination
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
      <div class="flex w-0 flex-1 items-center">
        <p class="truncate font-medium">${doc.title}</p>
      </div>
      <div class="ml-4 shrink-0 space-x-3">
        <button class="edit-btn" data-id="${doc.document_id}">  <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"
                  />
                </svg></button>
        <button class="delete-btn" data-id="${doc.document_id}"><svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  />
                </svg></button>
      </div>
    `
    docList.appendChild(listItem)
  })
  renderPagination(totalPages)

  // Gán sự kiện xóa tài liệu
  document.querySelectorAll('.delete-btn').forEach((button) => {
    const docId = button.getAttribute('data-id')
    if (!docId) return
    button.addEventListener('click', function () {
      deleteDocument(docId)
    })
  })
}

// Render pagination
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

// Delete document
window.deleteDocument = async function (id) {
  if (!id || isNaN(Number(id))) return
  if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return
  try {
    const response = await fetch(API_DOCUMENTS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ document: Number(id) }),
    })
    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`)
    await loadDocuments()
  } catch (error) {
    console.error('Lỗi xóa tài liệu:', error)
  }
}

// Search documents
function searchDocuments() {
  curPage = 1
  renderDocuments(allDocuments.filter(filterDocuments))
}

function filterDocuments(doc) {
  const query = searchInput.value.toLowerCase()
  return doc.title.toLowerCase().includes(query)
}

// Event Listeners
if (searchInput) searchInput.addEventListener('input', searchDocuments)
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
    () => (window.location.href = '../home.html')
  )
