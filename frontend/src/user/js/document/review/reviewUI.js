import '../../../../style.css'
import callApi from '../../model/callApi.js'
import api from '../../config/envConfig.js'

document.addEventListener('DOMContentLoaded', () => {
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

  function popupAlert() {
    const modal = document.getElementById('alert')
    const openBtn = document.getElementById('submitBtn')
    const closeBtn = document.getElementById('continueBtn')

    openBtn.addEventListener('click', () => {
      modal.classList.remove('invisible')
      document.body.classList.add('overflow-hidden')
    })

    closeBtn.addEventListener('click', () => {
      modal.classList.add('invisible')
      document.body.classList.remove('overflow-hidden')
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('invisible')
        document.body.classList.remove('overflow-hidden')
      }
    })
  }

  popupAlert()
  userInfo()
})
