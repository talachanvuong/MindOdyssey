import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import effect from '../model/effect.js'
import { timeConvert } from '../../../utils/convertUtils.js'
let res = null
const detail = {
}
document.addEventListener('DOMContentLoaded', () => {

  effect.appear.move_down('main',700,0)
  effect.assignAfterLoading.duration_assign('startBtn',500)
  effect.assignAfterLoading.duration_assign('authorDocument',500)
  effect.assignAfterLoading.duration_assign('userInfoBlackText',500)
  effect.assignAfterLoading.duration_assign('seeAuthorBlackText',500)
  effect.assignAfterLoading.duration_assign('backBtn',500)
  effect.assignAfterLoading.duration_assign('homeBtn',500)


  const urlParams = new URLSearchParams(window.location.search)
    detail.id = Number(urlParams.get('id')) 

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

  async function getDocInfo() {
    
    res = await callApi.callApi(
      api.apiGetDocument,           
      {document: detail.id},
      'POST'
    )
    console.log(res)
    Object.assign(detail, res.data)                           

    const docName = document.getElementById('docName')
    const authorName = document.getElementById('authorName')
    const courseName = document.getElementById('subject')
    const createAte =document.getElementById('time')
    const quantity = document.getElementById('quantity')
    const description = document.getElementById('description')

    docName.textContent = detail.title
    authorName.textContent = detail.author.display_name
    courseName.textContent = detail.course
    createAte.textContent = timeConvert(detail.last_updated)
    quantity.textContent = detail.total_questions 
    description.textContent = detail.description

    //get start if user click 
    document.getElementById('startBtn').href = `practiceUI.html?id=${detail.id}&total=${detail.total_questions}&author_id=${detail.author.id}`

    //direct to author's documents
    document.getElementById('authorDocument').href = `author_document.html?author_name=${detail.author.display_name}&author_id=${detail.author.id}&id_doc=${detail.id}`
  }  

 getDocInfo()
  userInfo()
})
