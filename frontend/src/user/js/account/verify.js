import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import msg from '../model/messageHandle.js'
document.addEventListener('DOMContentLoaded', () => {
  // ===================LOGIC===================//

  const form = document.querySelector('form')
  const emailInput = document.querySelector('input')
  const loading = document.getElementById('loading')
  const redText = document.getElementById('alert')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = emailInput.value.trim()

    msg.redText(redText, '')

    loading.classList.remove('invisible')

    //api calling
    const apiResult = await callApi.callApi(
      api.apiVerifyEmail,
      {
        email: email,
      },
      'POST'
    )
    if (apiResult.status === `success`) {
      loading.classList.add('invisible')
      const popupAlert = document.getElementById('popupAlert')
      msg.popup(popupAlert, apiResult.message)
    } else {
      const type = msg.classify(apiResult.message)
      if (type === 'redText') {
        loading.classList.add('invisible')
        msg.redText(redText, apiResult.message)
      }
    }
  })
})
