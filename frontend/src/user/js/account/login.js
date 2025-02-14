import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import msg from '../model/messageHandle.js'

document.addEventListener('DOMContentLoaded', () => {
  // =================   EFFECT ===============================//
  const ele = document.getElementById('main')
  setTimeout(() => {
    ele.classList.remove('opacity-0', '-translate-y-12')
    ele.classList.add('opacity-100', 'translate-y-0', 'duration-1000')
  }, 200)

  //get ID
  const openPopUp = document.getElementById('openPopUp')
  const popupModal = document.getElementById('popupModal')
  const closePopUp = document.getElementById('cancle')
  const closePopUp2 = document.getElementById('closeBtn')
  const content = document.getElementById('popup_content')

  //Open Popup
  function toggleModal() {
    popupModal.classList.remove('invisible')
    setTimeout(() => {
      popupModal.classList.remove('opacity-0')
      popupModal.classList.add('opacity-100', 'duration-700')
      content.classList.remove('-translate-y-3')
      content.classList.add('translate-y-3')
    }, 100)
  }

  //close Popup
  function closeModal() {
    popupModal.classList.remove('opacity-100')
    popupModal.classList.add('opacity-0', 'duration-700')
    content.classList.remove('translate-y-3')
    content.classList.add('-translate-y-3')
    setTimeout(() => {
      popupModal.classList.add('invisible')
    }, 700)
  }

  //close Popup when click out side
  function closeModalWhenClickOutSide(event) {
    if (event.target === popupModal) {
      popupModal.classList.remove('opacity-100')
      popupModal.classList.add('opacity-0', 'duration-700')
      content.classList.remove('translate-y-3')
      content.classList.add('-translate-y-3')
      setTimeout(() => {
        popupModal.classList.add('invisible')
      }, 700)
    }
  }

  // click on button
  openPopUp.addEventListener('click', toggleModal)
  closePopUp.addEventListener('click', closeModal)
  closePopUp2.addEventListener(`click`, closeModal)
  popupModal.addEventListener('click', closeModalWhenClickOutSide)

  // =========================    LOGIC  LOGIN  =====================================//

  const form = document.getElementById('form')
  const emailInput = document.getElementById('emailInput')
  const passwordInput = document.getElementById('passwordInput')
  const popupAlert = document.getElementById('popupAlert')

  //form login
  form.addEventListener('submit', async (event) => {
    event.preventDefault() //chống reload page
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    //check all field are filled
    const emailInputAlert = document.getElementById('emailInputAlert')
    const passwordInputAlert = document.getElementById('passwordInputAlert')
    
    msg.redText(emailInputAlert,'')
    msg.redText(passwordInputAlert,'')


    //api login calling
    const apiResult = await callApi.callApi(
      api.apiLogin, //link
      { email: email, password: password }, //session
      'POST' //method
    )
    console.log(apiResult.message)
    if (apiResult.status === 'success') {
      window.location.href = 'lobby.html'
    } else {
      const type = msg.classify(apiResult.message)

      if (type === 'redText') {
        if (apiResult.message.toLowerCase().includes('email')) {
          msg.redText(emailInputAlert, apiResult.message)
        }
        if (apiResult.message.toLowerCase().includes('password')) {
          msg.redText(passwordInputAlert, apiResult.message)
        }
      }
      if (type === `popup`) {
        msg.popup(popupAlert, apiResult.message)
      }
    }
  })

  // ========================= Forget Password    =====================================//

  //send email
  const sendForm = document.getElementById('sendForm')
  const emailForgetInput = document.getElementById('emailForgetInput')

  //disable submit button in 30 seconds after sending email
  const button = document.getElementById('sendEmailBtn')
  const originalText = button.innerText

  sendForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = emailForgetInput.value.trim()
    const alert = document.getElementById('alert')

    msg.redText(alert,'')

    //loading screen
    const forgetPasswordLoading = document.getElementById(
      'forgetPasswordLoading'
    )
    forgetPasswordLoading.classList.remove('invisible')

    //call API
    const apiResult = await callApi.callApi(
      api.apiForgetPassword,
      { email: email },
      'POST'
    )
    if (apiResult.status === 'success') {
      msg.popup(popupAlert, apiResult.message)
      forgetPasswordLoading.classList.add('invisible')

      //disable button in 30s
      button.disabled = true
      let timeLeft = 30
      button.innerText = `${timeLeft} s`
      button.classList.add('opacity-50', 'cursor-not-allowed')

      const countdown = setInterval(() => {
        timeLeft--
        button.innerText = `${timeLeft} s`

        if (timeLeft <= 0) {
          clearInterval(countdown)
          button.innerText = originalText
          button.disabled = false
          button.classList.remove('opacity-50', 'cursor-not-allowed')
        }
      }, 1000)
    } else {
      const type = msg.classify(apiResult.message)
      forgetPasswordLoading.classList.add('invisible')
      if (type === `redText`) {

        msg.redText(alert, apiResult.message)
      }
      if (type === `popup`) {
        msg.popup(popupAlert, apiResult.message)
      }
    }
  })
})
