import '../../../style.css'
import callApi from '../model/callApi'
import api from '../config/envConfig'
import show_doc from '../model/show_doc'
import effect from '../model/effect.js'

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

  effect.assignAfterLoading.duration_assign('blackTextInfo',500,10)
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
    if(state.curPage > 1){
      state.curPage = 1
      apiCalling()
    }
  })
  lastPage.addEventListener('click', () => {
    if(state.curPage <res.data.totalPages){
      state.curPage = res.data.totalPages
      apiCalling()
    }    
  })

  async function getUserName(){
    res = await callApi.callApi(
      api.apiShowInfo,
      null,
      'GET'
    )
    document.getElementById('userName').textContent = res.data.display_name
  }
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
  getUserName()
  popupMenu()
  apiCalling()
})
