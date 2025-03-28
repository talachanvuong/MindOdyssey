import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show_doc from '../model/show_doc.js'
import msgHandle from '../model/messageHandle.js'
import effect from '../model/effect.js'
let res = null
const state = {
  page: 1,
  perPage: 10,
  keyword: null,
  course_id: null,
  course_name: '',
  totalDocs: null,
  totalPages: null,
  docs: [],
}
document.addEventListener('DOMContentLoaded', () => {
  effect.assignAfterLoading.duration_assign('user',500)
  effect.appear.fade_in('listOfDoc',500,10)
  //gain input searching and put it into input box
  const urlParams = new URLSearchParams(window.location.search)
  state.keyword = urlParams.get('searchValue')
  const searchInput = document.getElementById('searchInput')
  searchInput.value = state.keyword

  const theFirst = document.getElementById('theFirst')
  const theLast = document.getElementById('theLast')
  const theNext = document.getElementById('theNext')
  const thePrev = document.getElementById('thePrev')
  const curPage = document.getElementById('curPage')

  //get user info
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
  //   popup menu
  function popupMenu() {
    const button = document.getElementById('popupMenuBtn')
    const modal = document.getElementById('popupMenu')

    //open
    button.addEventListener('click', () => {
      document.body.classList.add('overflow-hidden')
      modal.classList.remove("invisible")
    })

    //close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
         modal.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }

  //DESCRIPTION:
  /*
  this function will fetch api for each circumstance once it is called
  */
  async function getCourseId(keyword) {
    //get course id result
    const gcir = await callApi.callApi(
      api.apiGetCourse,
      keyword ? { keyword: keyword } : null,
      'POST'
    )
    gcir.status === 'success' && gcir.data.length != 0
      ? gcir.data.forEach((element) => {
          state.course_id = element.course_id
        })
      : (state.course_id = 0)
    console.log('RES fetch course ID:', gcir)
    await apiCalling()
  }

  async function apiCalling() {
    const params = new URLSearchParams({
      page: state.page,
      limit: state.perPage,
    })
    if (state.keyword) params.append('keyword', state.keyword)
    if (state.course_id == 0 || state.course_id)
      params.append('course_id', Number(state.course_id))

    res = await callApi.callApi(
      `http://localhost:3000/api/practice/getdocsforprac/?${params.toString()}`,
      null,
      'GET'
    )
    if (res.status === 'success') {
      Object.assign(state, res.data)
      show_doc.showDocList('list', res.data.docs)
      pagination()
    } else {
      msgHandle.notification('list')
      curPage.textContent = ``
      theFirst.classList.add('invisible')
      theLast.classList.add('invisible')
      theNext.classList.add('invisible')
      thePrev.classList.add('invisible')
    }
  }

  function filter() {
    const filterBtn = document.getElementById('filterBtn')
    const filterMenu = document.getElementById('filterMenu')
    const filterInput = document.getElementById('filterInput')
    const filterSubmit = document.getElementById('filterSubmit')

    filterSubmit.addEventListener('click', async (e) => {
      e.preventDefault()
      state.course_name = filterInput.value.trim()
      if (state.course_name) await getCourseId(state.course_name)
      else {
        state.course_id = null
        apiCalling()
      }
      filterMenu.classList.toggle('invisible')
    })

    filterBtn.addEventListener('click', () => {
      filterMenu.classList.toggle('invisible')
      effect.appear.drop_down('filterMenu', 500, 10)
    })

    // Ẩn dropdown khi click bên ngoài
    document.addEventListener('click',(event) => {
      state.course_name = filterInput.value.trim()

      if (
        !filterBtn.contains(event.target) &&
        !filterMenu.contains(event.target)
      ) {
        filterMenu.classList.add('invisible')
      }
    })
  }

  function search() {
    const searchBtn = document.getElementById('searchBtn')
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      state.keyword = searchInput.value.trim()
      apiCalling()
    })
  }

  function pagination() {
    theFirst.classList.remove('invisible')
    theLast.classList.remove('invisible')
    theNext.classList.remove('invisible')
    thePrev.classList.remove('invisible')
    curPage.textContent = state.page
    if (state.page === 1) {
      thePrev.classList.add('invisible')
      theFirst.classList.add('invisible')
    }
    if (state.page === state.totalPages) {
      theNext.classList.add('invisible')
      theLast.classList.add('invisible')
    }
  }
  function paginationController() {
    theFirst.addEventListener('click', async () => {
      state.page = 1
      await apiCalling()
    })
    theLast.addEventListener('click', async () => {
      state.page = state.totalPages
      await apiCalling()
    })
    theNext.addEventListener('click', async () => {
      state.page += 1
      await apiCalling()
    })
    thePrev.addEventListener('click', async () => {
      state.page -= 1
      await apiCalling()
    })
  }

  paginationController()
  filter()
  search()
  apiCalling()
  popupMenu()
  userInfo()
})
