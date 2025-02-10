import '../../../style.css'
import { Popup_Modal } from '../model/popup.js'

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
  function toggleModal(event) {
    popupModal.classList.remove('invisible')
    setTimeout(() => {
      popupModal.classList.remove('opacity-0')
      popupModal.classList.add('opacity-100', 'duration-700')
      content.classList.remove('-translate-y-3')
      content.classList.add('translate-y-3')
    }, 100)
  }

  //close Popup
  function closeModal(event) {
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

  //form login
  form.addEventListener('submit', async (event) => {
    event.preventDefault() //chống reload page
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    //check all field are filled
    const emailInputAlert = document.getElementById('emailInputAlert')
    const passwordInputAlert =  document.getElementById('passwordInputAlert')
    let filled = true

    if (!email) {
      emailInputAlert.textContent =
        'Vui lòng nhập email'
      filled = false
    }else{
      emailInputAlert.textContent=''
    }
    if (!password) {
      passwordInputAlert.textContent =
        'Vui lòng nhập mật khẩu'
      filled = false
    }else{
      passwordInputAlert.textContent=''
    }
    if (!filled) return

    //api calling
    try {
      const response = await fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      const popup = new Popup_Modal('popupAlert', data.message)

      //achor to lobby if login success
      if (response.ok) {
        if (data.message === 'User login successfully!') {
          popup.open()
          loading.classList.remove('invisible')
          window.location.href = '../../page/account/lobby.html'
        }
      } else {
        //popup user not founded
        if (data.message === 'User not found!') {
          popup.open()
        }

        //popup if wrong password
        if (data.message === 'Wrong password!') {
          popup.open()
        }

        //wrong format
        if (
          data.message === 'Password must be between 8 and 32 characters long!'
        ) {
          passwordInputAlert.textContent = data.message
        }

        //wrong format email
        if (data.message === 'Invalid email address!') {
          emailInputAlert.textContent = data.message
        }
      }
    } catch (error) {
      console.error(error)
      alert(error)
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

    if (!email) {
     alert.textContent = "Vui lòng nhập email"
      return
    }else{
      alert.textContent =``
    }

    //loading screen
    const forgetPasswordLoading = document.getElementById(
      'forgetPasswordLoading'
    )
    forgetPasswordLoading.classList.remove('invisible')

    //api calling
    try {
      const response = await fetch(
        'http://localhost:3000/api/user/forgetpassword',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
          }),
        }
      )

      const data = await response.json()
      const popup = new Popup_Modal('popupAlert', data.message)

      //popup alert if send email success
      if (response.ok) {
        popup.open()
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
        //if user not found
        if (data.message === 'User not found!') {
          popup.open()
          forgetPasswordLoading.classList.add('invisible')
        }
        //if invalid email
        if (data.message === 'Invalid email address!') {
          alert.textContent = data.message
          forgetPasswordLoading.classList.add('invisible')
        }
      }
    } catch (error) {
      console.error('🚨 Lỗi kết nối:', error)
      alert('❌ Không thể kết nối đến server. Vui lòng thử lại sau.')
    }
  })
})
