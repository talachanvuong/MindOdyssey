import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'

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
userInfo()
})