import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import msg from '../model/messageHandle.js'
// =================   EFFECT ===============================//
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.opacity-0')
  elements.forEach((el) => {
    setTimeout(() => {
      el.classList.remove('opacity-0', '-translate-y-12')
      el.classList.add('opacity-100', 'duration-1000')
    }, 200)
  })

  //====================LOGIC=======================//

  const newPassInput = document.getElementById('newPass')
  const reNewPassInput = document.getElementById('reNewPass')
  const errorNewPass = document.getElementById('errorNewPass')
  const errorReNewPass = document.getElementById('errorReNewPass')
  const form = document.getElementById('form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newPass = newPassInput.value.trim()
    const reNewPass = reNewPassInput.value.trim()
    msg.redText(errorNewPass,'')
    msg.redText(errorReNewPass,'')
    //API calling
    const apiResult = await callApi.callApi(
      api.apiResetPassword,
      { newPassword: newPass, confirmNewPassword: reNewPass },
      'POST'
    )
    if (apiResult.status === 'success') {
      const success = document.getElementById('success')
      success.classList.remove('invisible')
    } else {
      console.log(apiResult.message)
      const type = msg.classify(apiResult.message)
      if (type === `redText`) {
        if (apiResult.message.includes('Password'))
          msg.redText(errorNewPass, apiResult.message)
        if (apiResult.message.includes('Confirm'))
          msg.redText(errorReNewPass, apiResult.message)
      }
      if (type === `alert`) {
        alert('Đã hết phiên đổi mật khẩu, vui lòng gửi lại email')
        window.location.href = '../home.html'      
      }
    }
  })
})
