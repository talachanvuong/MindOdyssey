import '../../style.css'
import callApi from './model/callApi'
import api from '../config/envConfig'
import showDocs from './model/show_doc.js'
import msgHandle from './model/msgHandle.js'

const state = {
  filterDate: 0,
  keyword: ``,
  page: 1,
  perPage: 3,
  totalPages: 0,
  curPage: 1,
  res: null,
}

document.addEventListener('DOMContentLoaded', () => {
  const curPage = document.getElementById('page')
  const right = document.getElementById('right')
  const left = document.getElementById('left')

  function filterPopup() {
    const modal = document.getElementById('popup')
    const Btn = document.getElementById('filter')
    const closeBtn = document.getElementById('closeBtn')

    Btn.addEventListener('click', () => {
      modal.classList.remove('invisible')
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('invisible')
    })

    closeBtn.addEventListener('click', () => {
      modal.classList.add('invisible')
    })
  }

  async function apiCalling(keyword = ``, filter = 0) {
    if (keyword === '') {
      const result = await callApi.callApi(
        api.apiApprovedDocument,
        {
          pagination: {
            page: state.page,
            perPage: state.perPage,
          },
          filter: filter,
        },
        'POST'
      )

      if (result.status === 'success') {
        showDocs.show('list', result.result.documents)
        state.totalPages = result.result.total_pages
        state.res = result
        pagination(result)
      } else {
        console.error('error in calling api')
        pagination(result)
      }
    } else {
      const result = await callApi.callApi(
        api.apiApprovedDocument,
        {
          pagination: {
            page: state.page,
            perPage: state.perPage,
          },
          keyword,
          filter,
        },
        'POST'
      )

      if (result.status === 'success') {
        showDocs.show('list', result.result.documents)
        state.totalPages = result.result.total_pages
        state.res = result
        pagination(result)
      } else {
        const type = msgHandle.classify(result.message)
        if (type === 'notification') {
          pagination(result)
        }
      }
    }
  }

  async function showAll() {
    await apiCalling()
  }

  function pagination(res) {
    const pagination = document.getElementById('pagination')
    pagination.classList.remove('invisible')
    if (res.message === 'Page not valid!') {
      pagination.classList.add('invisible')
      msgHandle.notification('list')
      return
    }
    curPage.textContent = state.page
    if (state.page == 1) left.classList.add('invisible')
    else left.classList.remove('invisible')

    if (state.page == state.totalPages) right.classList.add('invisible')
    else right.classList.remove('invisible')
  }

  function filterForm(callBack) {
    const filterInput = document.getElementById('filterInput')
    const form = document.getElementById('filterForm')
    form.addEventListener(`submit`, (e) => {
      e.preventDefault()
      const filter = filterInput.value
      if (!filter) {
        console.log('Date input is null')
        callBack(0)
        return
      }
      const date = new Date(filter)
      if (isNaN(date.getTime())) {
        console.log('this date is invalid')
        callBack(0)
      } else callBack(date)
    })
  }

  function searchDocument() {
    const form = document.getElementById('form')
    const fieldInput = document.getElementById('input')
    filterForm((date) => {
      if (date != 0) state.filterDate = date.getTime()
    })
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      state.keyword = fieldInput.value.trim()
      await apiCalling(state.keyword, state.filterDate)
    })
  }

  function PageController() {
    right.addEventListener('click', async () => {
      if (state.page < state.totalPages) {
        state.page++
        await apiCalling(state.keyword)
        curPage.textContent = state.page
      }
    })
    left.addEventListener('click', async () => {
      if (state.page > 1) {
        state.page--
        await apiCalling(state.keyword)
        curPage.textContent = state.page
      }
    })
  }

  PageController()
  searchDocument()
  showAll()
  filterPopup()
})
