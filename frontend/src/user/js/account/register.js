import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import msg from '../model/messageHandle.js'
//===================  EFFECT =======================//
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.opacity-0')
  elements.forEach((el) => {
    setTimeout(() => {
      el.classList.remove('opacity-0', 'translate-y-12')
      el.classList.add('opacity-100', 'duration-1000')
    }, 200)
  })

  //================ LOGIC =============================//
  const nameInput = document.getElementById('nameInput')
  const passwordInput = document.getElementById('passwordInput')
  const repassInput = document.getElementById('repassInput')
  const form = document.getElementById('form')
  const errorName = document.getElementById('errorName')
  const errorPass = document.getElementById('errorPass')
  const errorRePass = document.getElementById('errorRePass')
  const success = document.getElementById('successful')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    //gain data
    const name = nameInput.value.trim()
    const password = passwordInput.value.trim()
    const repass = repassInput.value.trim()

    msg.redText(errorName, '')
    msg.redText(errorPass, '')
    msg.redText(errorRePass, '')

    //API calling
    const result = await callApi.callApi(
      api.apiRegister,
      { display_name: name, password: password, confirmPassword: repass },
      'POST'
    )
    console.log(result.message)
    console.log(result.log)
    if (result.status === `created`) {
      success.classList.remove('invisible')
    } else {
      const type = msg.classify(result.message)
      if (type === 'redText') {
        if (result.message.includes('name'))
          msg.redText(errorName, result.message)
        if (result.message.includes('Password'))
          msg.redText(errorPass, result.message)
        if (result.message.includes('Confirm'))
          msg.redText(errorRePass, result.message)
      }
      if (type === 'alert') {
        alert('Time out for register :(  Please send email again')
        window.location.href = '../home.html'
      }
    }
  })
})
