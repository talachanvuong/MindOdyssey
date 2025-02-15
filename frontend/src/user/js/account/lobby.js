import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'

document.addEventListener('DOMContentLoaded', () => {

  //logout button
  const logout = document.getElementById('logout')
  logout.addEventListener('click', async () => {
    const result = await callApi.callApi(
      api.apiLogout,
      {},
      'POST'
    )
    if(!result.status==='success'){
      alert(result.message)
    }
    else{
      window.location.href='../home.html'
    }
  })
})
