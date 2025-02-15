import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import msg from '../model/messageHandle.js'

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.opacity-0')
  elements.forEach((el) => {
    setTimeout(() => {
      el.classList.remove('opacity-0', 'translate-y-12')
      el.classList.add('opacity-100', 'duration-1000')
    }, 200)
  })
  const form = document.getElementById('form')
  const oldPassInput = document.getElementById('old_passInput')
  const newPassInput = document.getElementById('new_passInput')
  const rePassInput = document.getElementById('re_passInput')
  const popupAlert = document.getElementById('popupAlert')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const success = document.getElementById('success')
    const oldPass = oldPassInput.value.trim()
    const newPass = newPassInput.value.trim()
    const rePass = rePassInput.value.trim()
    const oldPassError = document.getElementById('old_pass_error')
    const newPassError = document.getElementById('new_pass_error')
    const rePassError = document.getElementById('re_pass_error')

    //empty field filter
    let filled = true
    if (!oldPass) {
      msg.redText(oldPassError, 'old password is required')
      filled = false
    } else msg.redText(oldPassError, '')
    if (!newPass) {
      msg.redText(newPassError, 'new password is required')
      filled = false
    } else msg.redText(newPassError, '')
    if (!rePass) {
      msg.redText(rePassError, 'confirm password is required')
      filled = false
    } else msg.redText(rePassError, '')
    if (!filled) return

    //check all fields are filled
    const apiResult = await callApi.callApi(
      api.apiChangePassword,
      {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmNewPassword: rePass,
      },
      'POST'
    )
    if (apiResult.status === 'success') {
      success.classList.remove('invisible')
    } else {
      console.log(apiResult.message)
      const type = msg.classify(apiResult.message)
      if (type === 'redText') {
        if (newPassInput.value.length < 8) {
          msg.redText(newPassError, apiResult.message)
        }
        if (oldPassInput.value.length < 8) {
          msg.redText(oldPassError, apiResult.message)
        }
        if (apiResult.message.toLowerCase().includes('confirm')) {
          msg.redText(rePassError, apiResult.message)
        }
        if (rePassInput.value.length < 8) {
          msg.redText(
            rePassError,
            'Password must be at least 8 characters long'
          )
        }
      }

      if (type === 'popup') {
        msg.popup(popupAlert, apiResult.message)
      }
      if (type === 'alert') {
        alert(apiResult.message)
      }
    }
  })
})
