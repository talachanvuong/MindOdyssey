import '../../../../style.css'
import callApi from '../../model/callApi.js'
import api from '../../config/envConfig.js'
document.addEventListener('DOMContentLoaded', () => {
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
  function popupMenu(){
    const button = document.getElementById('popupMenuBtn')
    const modal = document.getElementById('popupMenu')

    //open
    button.addEventListener('click',()=>{
      modal.classList.remove('invisible')
      document.body.classList.add('overflow-hidden')
    })

    //close
    modal.addEventListener('click',(e)=>{
      if(e.target === modal){
        modal.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }

  popupMenu()
  userInfo()
})
