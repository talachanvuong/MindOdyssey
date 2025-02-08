import '../../../style.css'

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
    //event.preventDefault()
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
    //event.preventDefault()
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
    //event.preventDefault()
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault() //chống reload page
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()
    if (!email) {
      alert('Vui lòng điền email!')
      return
    }
    if (!password) {
      alert('Bạn chưa điền mật khẩu!!')
      return
    }

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

      const data = await response.json() // Lấy dữ liệu JSON từ response

      if (response.ok) {
        if (data.message === 'User login successfully!') {
          const loading = document.getElementById('loading')
          loading.classList.remove('invisible')
          window.location.href = '../../page/account/lobby.html'
        }
      } else {
        // Lỗi nếu response không ok
        if (data.message === 'User not found!') {
          //tài khoản không tồn tại
          console.error('Lỗi API:', data)
          const noUser = document.getElementById('noUser')
          noUser.classList.remove('invisible')
          const okBtn1 = document.getElementById('okBtn1')
          okBtn1.addEventListener('click', () => {
            noUser.classList.add('invisible')
          })
        }

        if (data.message === 'Wrong password!') {
          //sai mật khẩu
          console.error('Lỗi API:', data)
          const wrongPass = document.getElementById('wrongPass')
          wrongPass.classList.remove('invisible')
          const okBtn2 = document.getElementById('okBtn2')
          okBtn2.addEventListener('click', () => {
            wrongPass.classList.add('invisible')
          })
        }

        if (
          data.message === 'Password must be between 8 and 32 characters long!' //sai format mật khẩu
        ) {
          alert('mật khẩu phải chứa ít nhất 8 kí tự và nhiều nhất 32 kí tự')
        }

        if (
          data.message === 'Invalid email address!' //sai format email
        ) {
          alert('Email không hợp lệ')
        }
      }
    } catch (error) {
      console.error('🚨 Lỗi kết nối:', error)
      alert('❌ Không thể kết nối đến server. Vui lòng thử lại sau.')
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

    if (!email) {
      const alert = document.getElementById('alert')
      alert.classList.remove('invisible')
      return
    }

    //loading
    const forgetPasswordLoading = document.getElementById(
      'forgetPasswordLoading'
    )
    forgetPasswordLoading.classList.remove('invisible')

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
      if (response.ok) {
        const sendEmailSuccess = document.getElementById('sendEmailSuccess')
        forgetPasswordLoading.classList.add('invisible')
        sendEmailSuccess.classList.remove('invisible')

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
        if (data.message === 'User not found!') {
          const noUserFound = document.getElementById('noUserFound')
          noUserFound.classList.remove('invisible')
          forgetPasswordLoading.classList.add('invisible')
        }
        if (data.message === 'Invalid email address!') {
          const invalidEmail = document.getElementById('invalidEmail')
          invalidEmail.classList.remove('invisible')
          forgetPasswordLoading.classList.add('invisible')
        }
      }
    } catch (error) {
      console.error('🚨 Lỗi kết nối:', error)
      alert('❌ Không thể kết nối đến server. Vui lòng thử lại sau.')
    }
  })

  //close alert popup when send email success
  const closeSendEmailSuccess = document.getElementById('closeSendEmailSuccess')
  closeSendEmailSuccess.addEventListener('click', () => {
    const sendEmailSuccess = document.getElementById('sendEmailSuccess')
    sendEmailSuccess.classList.add('invisible')
  })

  //close alert popup when email invalid
  const closeInvalidEmail = document.getElementById('closeInvalidEmail')
  closeInvalidEmail.addEventListener('click', () => {
    const invalidEmail = document.getElementById('invalidEmail')
    invalidEmail.classList.add('invisible')
  })

  //close alert popup when user not found
  const closeNoUserFound = document.getElementById('closeNoUserFound')
  closeNoUserFound.addEventListener('click', () => {
    const noUserFound = document.getElementById('noUserFound')
    noUserFound.classList.add('invisible')
  })
})
