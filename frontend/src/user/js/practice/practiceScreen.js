import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show_doc from '../model/show_doc.js'
let res = null
const detail = {
}
document.addEventListener('DOMContentLoaded', () => {

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
    Object.assign(detail, res.data)                           

    const docName = document.getElementById('docName')
    const authorName = document.getElementById('authorName')
    const courseName = document.getElementById('subject')
    const createAte =document.getElementById('time')
    const quantity = document.getElementById('quantity')

    docName.textContent = detail.title
    authorName.textContent = detail.author
    courseName.textContent = detail.course.title
    createAte.textContent = detail.created_at
    quantity.textContent = detail.total_questions 

    show_doc.showAnswerList('list', detail.questions)

    //get start if user click 
    getStart()
  }  

  function getStart(){
    const startBtn = document.getElementById('startBtn')
    startBtn.href = `practiceUI.html?id=${detail.id}&total=${detail.total_questions}`
  }
  
 getDocInfo()
  userInfo()
})
