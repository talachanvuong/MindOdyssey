import '../../../style.css'
import { Popup_Modal } from '../model/popup.js'

document.addEventListener('DOMContentLoaded', () => {
  // ===================LOGIC===================//

  const form = document.querySelector('form')
  const emailInput = document.querySelector('input')
  const loading = document.getElementById('loading')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = emailInput.value.trim()

    //alert if user doesn't enter email
    if (!email) {
      alert('Vui lòng nhập email!')
      return
    }

    //loading screen
    loading.classList.remove('invisible')

    try {
      const response = await fetch(
        'http://localhost:3000/api/user/verifyemail',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()
      const popup = new Popup_Modal('popupAlert', data.message)

      //popup alert if success
      if (response.ok) {
        popup.open()
        loading.classList.add('invisible')
      } else {
        //popup alert if user already exists
        if (data.message === 'User already exists!') {
          popup.open()
          loading.classList.add('invisible')
        }

        //popup alert if invalid email
        if (data.message === 'Invalid email address!') {
          popup.open()
          loading.classList.add('invisible')
        }
      }
    } catch (error) {
      //if error occurs
      console.error(error)
      console.log(error)
      alert('Đã xảy ra lỗi, vui lòng thử lại sau!')
    }
  })
})
