import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show from '../model/show_doc.js'
import effect from '../model/effect.js'

let page = 1
let perPage = 10
let totalPage
let res

const urlParams = new URLSearchParams(window.location.search)
const author_name = String(urlParams.get('author_name'))
const author_id = Number(urlParams.get('author_id'))
const id = urlParams.get('id_doc')

document.addEventListener('DOMContentLoaded', () => {

  effect.assignAfterLoading.duration_assign('back',500)
  effect.assignAfterLoading.duration_assign('homeBtn',500)

  const theFirst = document.getElementById('theFirst')
  const thePrev = document.getElementById('thePrev')
  const curPage = document.getElementById('curPage')
  const theNext = document.getElementById('theNext')
  const theLast = document.getElementById('theLast')

  document.getElementById('back').href = `practiceScreen?id=${id}`

  theFirst.addEventListener('click', () => {
    if (page > 1) {
      page = 1
      getDocument()
    }
  })
  thePrev.addEventListener('click', () => {
    if (page > 1) {
      page--
      getDocument()
    }
  })
  theNext.addEventListener('click', () => {
    if (page < totalPage) {
      page++
      getDocument()
    }
  })
  theLast.addEventListener('click', () => {
    if (page < totalPage) {
      page = totalPage
      getDocument()
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
  function getAuthorInfo() {
    console.log('user info:',)
     document.getElementById('nameOfAuthor').textContent = author_name
    // document.getElementById('totalDoc').textContent =
  }
  async function getDocument() {
    const params = new URLSearchParams({
      user_id: author_id,
      page: page,
      limit: perPage,
    })
    res = await callApi.callApi(
      api.apiAuthorDocument + `?${params.toString()}`,
      null,
      'GET'
    )
    console.log(res)
    totalPage = res.data.totalPages
    document.getElementById('totalDoc').textContent = res.data.totalDocs
    show.showDocList('list', res.data.docs)
    pagination()
  }
  function pagination() {
    theFirst.classList.remove('invisible')
    theNext.classList.remove('invisible')
    thePrev.classList.remove('invisible')
    theLast.classList.remove('invisible')
    curPage.textContent = res.data.currentPage
    if (page == 1) {
      theFirst.classList.add('invisible')
      thePrev.classList.add('invisible')
    }
    if (page == res.data.totalPages) {
      theLast.classList.add('invisible')
      theNext.classList.add('invisible')
    }
  }

  getUserName()
  getDocument()
  getAuthorInfo()
})
