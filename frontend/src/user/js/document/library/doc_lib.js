import '../../../../style.css'
import callApi from '../../model/callApi.js'
import api from '../../config/envConfig.js'

document.addEventListener('DOMContentLoaded', () => {
  //popup detail info of document
  function popupDetailInfo() {
    const detailInfo = document.getElementById('detailInfo')
    const popupDetailInfo = document.getElementById('popupInformation')
    const closePopupInfo = document.getElementById('closePopupInfo')

    //open
    detailInfo.addEventListener('click', () => {
      popupDetailInfo.classList.remove('invisible')
      document.body.classList.add('overflow-hidden')
    })

    //close
    popupDetailInfo.addEventListener('click', (e) => {
      if (e.target === popupDetailInfo)
        popupDetailInfo.classList.add('invisible')
    })
    closePopupInfo.addEventListener('click', () => {
      popupDetailInfo.classList.add('invisible')
      document.body.classList.remove('overflow-hidden')
    })
  }

  //Popup filter
  function popupFilter() {
    const filterBtn = document.getElementById('filter')
    const popupFilter = document.getElementById('popupFilter')
    const submitBtn = document.getElementById('submitBtn')

    //open
    filterBtn.addEventListener('click',()=>{
        popupFilter.classList.remove('invisible')
        document.body.classList.add('overflow-hidden')
        
    })

    //close
    popupFilter.addEventListener('click',(e)=>{
      if(e.target === popupFilter){
        popupFilter.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
      if(e.target === submitBtn){
        popupFilter.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }

  // get user name
  async function userInfo(){
    const userName = document.getElementById('userName')

    const apiResult = await callApi.callApi(api.apiShowInfo,null,'GET')
    if(apiResult.status === "success"){
      userName.textContent = apiResult.data.display_name
    }else{
      console.log(apiResult)
      userName.textContent='display_error'
    }
  }

  //display popup menu
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
  popupDetailInfo()
  popupFilter()
})
