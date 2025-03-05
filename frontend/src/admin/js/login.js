import '../../style.css'
import callApi from './model/callApi.js'
import Api from '../config/envConfig.js'
import msgHandle from './model/msgHandle.js'
document.addEventListener('DOMContentLoaded', () => {
  //login
  function login() {
    const nameInput = document.getElementById('name')
    const passInput = document.getElementById('password')
    const form = document.getElementById('form')
    const popupModal = document.getElementById('popupModal')
    const redAlertName = document.getElementById('redAlertName')
    const redAlertPass = document.getElementById('redAlertPass')
    const loading = document.getElementById('loading')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const name = nameInput.value.trim()
      const pass = passInput.value.trim()
      msgHandle.redText(redAlertName, ``)
      msgHandle.redText(redAlertPass, ``)
      loading.classList.remove('invisible')
      const dataResult = await callApi.callApi(
        Api.apiLoginAdmin,
        {
          display_name: name,
          password: pass,
        },
        'POST'
      )
      if (dataResult.status === 'success') {
        msgHandle.popup(popupModal, dataResult.message)
        window.location.href = 'doc_list.html'
      } else {
        loading.classList.add('invisible')
        const typeMsg = msgHandle.classify(dataResult.message.trim())
        console.log(dataResult.message)
        if (typeMsg === 'redText') {
          if (dataResult.message.toLowerCase().includes('"password"')) {
            msgHandle.redText(redAlertPass, dataResult.message)
          }

          if (dataResult.message.toLowerCase().includes('"display_name"')) {
            msgHandle.redText(redAlertName, dataResult.message)
          }
        }
        if (typeMsg === 'popup') {
          msgHandle.popup(popupModal, dataResult.message)
        }
      }
    })
  }

  login()
})
