import '../../../style.css'
import callApi from '../model/callApi'
import api from '../config/envConfig'
import show_doc from '../model/show_doc'

const state = {
  perPage: 10,
  curPage: 1,
}
let res

document.addEventListener('DOMContentLoaded', () => {
  const curPage = document.getElementById('curPage')
  const nextPage = document.getElementById('theNext')
  const prevPage = document.getElementById('thePrev')
  const lastPage = document.getElementById('theLast')
  const firstPage = document.getElementById('theFirst')
  nextPage.addEventListener('click', () => {
    if (state.curPage < res.data.totalPages) {
      state.curPage++
      apiCalling()
    }
  })
  prevPage.addEventListener('click', () => {
    if (state.curPage > 1) {
      state.curPage--
      apiCalling()
    }
  })
  firstPage.addEventListener('click', () => {
    state.curPage = 1
    apiCalling()
  })
  lastPage.addEventListener('click', () => {
    state.curPage = res.data.totalPages
    apiCalling()
  })

  async function apiCalling() {
    console.log(state.curPage)
    const params = new URLSearchParams({
      page: state.curPage,
      limit: state.perPage,
    })
    res = await callApi.callApi(
      api.apiPracticeHistory + `?${params.toString()}`,
      null,
      'GET'
    )

    show_doc.showListOfHistoryPractice('list', res.data.PracticeHistory)
    console.log(res)
    pagination()
  }

  function pagination() {
    prevPage.classList.remove('invisible')
    firstPage.classList.remove('invisible')
    lastPage.classList.remove('invisible')
    nextPage.classList.remove('invisible')
    curPage.textContent = state.curPage
    if (state.curPage == 1) {
      prevPage.classList.add('invisible')
      firstPage.classList.add('invisible')
    }
    if (state.curPage == res.data.totalPages) {
      lastPage.classList.add('invisible')
      nextPage.classList.add('invisible')
    }
  }
  apiCalling()
})
