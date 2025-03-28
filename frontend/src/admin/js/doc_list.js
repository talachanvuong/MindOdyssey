import '../../style.css'
import callApi from './model/callApi'
import api from '../config/envConfig'
import showDocs from './model/show_doc.js'
import msgHandle from './model/msgHandle.js'

const state = {
  filterDate: 0,
  keyword: ``,
  page: 1,
  perPage: 10,
  totalPages: 0,
  curPage: 1,
  res: null,
}

document.addEventListener('DOMContentLoaded', () => {
  const curPage = document.getElementById('page')
  const right = document.getElementById('right')
  const left = document.getElementById('left')

  //gain document list
  async function apiCalling() {
    try {
      const payload = {
        pagination: {
          page: state.page,
          perPage: state.perPage,
        },
        filter:state.filterDate,
      }
      if (state.keyword) payload.keyword = state.keyword
      const result = await callApi.callApi(api.apiApprovedDocument, payload, 'POST')
  
      if (result.status === 'success') {
        showDocs.showDocList('list', result.result.documents)
        state.totalPages = result.result.total_pages
        state.res = result
      } else {
        console.error('API Error:', result.message)
        const type = msgHandle.classify(result.message)
        if (type !== 'notification') return
      }
      pagination(result)
      console.log(result)
    } catch (error) {
      console.error('Unexpected Error:', error)
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

  function filter() {
    const modal = document.getElementById('filterMenu')
    const Btn = document.getElementById('filterBtn')
    const filterSubmit = document.getElementById('filterSubmit')
    const filterInput = document.getElementById('filterInput')
    
     /* DESCRIPTION
     when user clicking on submit button, it will gain the value
     in the input field. If it has value, gain it and assign it into state.dateFilter,
     if not, gain filterDate = 0 
     */
    filterSubmit.addEventListener('click',(e)=>{
      e.preventDefault()
      const valueOfFilter =filterInput.value ? filterInput.value  : 0
      if(valueOfFilter){
        const date = new Date(valueOfFilter)
        if(isNaN(date.getTime())){
          console.log('This date is invalid (>_<)!')
          return
        }
        else state.filterDate = date.getTime()
        console.log(state.filterDate)
        apiCalling()
      }
      modal.classList.add('invisible')
    })

    /*DESCRIPTION:
    close filter popup if clicking outside the modal popup
    */
    document.addEventListener('click',(event)=>{
      if(!Btn.contains(event.target) &&
          !modal.contains(event.target)){
            modal.classList.add('invisible')
          }
    })

    /*DESCRIPTION:
    close or open modal if button is clicked on
     */
    Btn.addEventListener('click',()=>{
      modal.classList.toggle('invisible')
    })
  }

  function searchDocument() {
    const form = document.getElementById('form')
    const fieldInput = document.getElementById('input')
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

  function logout() {
    const logoutBtn = document.getElementById('logoutBtn')
    const loading = document.getElementById('loading')
    logoutBtn.addEventListener('click',async  () => {
      loading.classList.remove('invisible')
      const res =await callApi.callApi(api.apiLogoutAdmin, {}, 'POST')
      if(res.status === 'success') window.location.href = 'login.html'
      else{
        loading.classList.add('invisible')
        console.log(res)
      }
    })
  }
  PageController()
  searchDocument()
  showAll()
  filter()
  logout()
})
