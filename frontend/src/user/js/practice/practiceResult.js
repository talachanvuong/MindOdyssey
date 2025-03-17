import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
document.addEventListener('DOMContentLoaded',()=>{

  const urlParams = new URLSearchParams(window.location.search)
  let time = urlParams.get('time')
  const score = Number(urlParams.get('score'))
  const numberOfCorrectAns =Number(urlParams.get('correct'))
  const numberOfIncorrectAns= Number(urlParams.get('incorrect'))
  const doc_id=Number(urlParams.get('id'))
  const total = Number(urlParams.get('total'))
  
  function formatTime() {
    let h = Math.floor(time / 3600).toString().padStart(2, '0');
    let m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    let s = Math.floor(time % 60).toString().padStart(2, '0'); // Fixed padding
  
    time = `${h}:${m}:${s}s`;
  }
  
  formatTime()

  function showResult(){
    document.getElementById('score').textContent =score
    document.getElementById('time').textContent =time
    document.getElementById('correctAns').textContent=numberOfCorrectAns
    document.getElementById('incorrectAns').textContent=numberOfIncorrectAns
    document.getElementById('total').textContent=total
    const rank = document.getElementById('rank')
    if(score == 100) rank.src="../../page/img/gradeS.png"
    if(score<100 && score>=80) rank.src ="../../page/img/gradeA.png"
    if(score<80 && score>=60) rank.src="../../page/img/gradeB.png"
    if(score<60 && score>=40) rank.src="../../page/img/gradeC.png"
    if(score<40 && score>=25) rank.src="../../page/img/gradeD.png"
    if(score<25 && score>=0)rank.src="../../page/img/gradeF.png"
  }

  function navigation(){
   document.getElementById('replay').href=`practiceUI.html?id=${doc_id}&total=${total}`
   document.getElementById('goBack').href=`practiceScreen.html?id=${doc_id}`
    document.getElementById('seeDetailResult').href=`seeResult.html?id=${doc_id}`
  }


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

  navigation()
  showResult()
  userInfo()
})