import '../../../style.css'
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    //gain data
    const name = nameInput.value.trim()
    const password = passwordInput.value.trim()
    const repass = repassInput.value.trim()

    //check if data had been fill all
    let filledData = true

    if (!name) {
      errorName.textContent = 'Vui lòng nhập tên'
      filledData = false
    } else errorName.textContent = ''

    if (!password) {
      errorPass.textContent = 'Vui lòng nhập mật khẩu'
      filledData = false
    } else errorPass.textContent = ''

    if (!repass) {
      errorRePass.textContent = 'Vui lòng nhập lại mật khẩu'
      filledData = false
    } else errorRePass.textContent = ''

    if (!filledData) return

    try {
      const response = await fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: name,
          password: password,
          confirmPassword: repass,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        //pop up alert
        const successfulAlert = document.getElementById('successful')
        successfulAlert.classList.remove('invisible')
      } else {
        if (data.message === 'Access token missing!') {
          alert('Đã hết thời gian đăng kí =(')
          window.location.href = '../home.html'
        }
        if (
          data.message ===
          'Display name must be between 8 and 64 characters long!'
        ) {
          errorName.textContent = 'Tên hiển thị phải có từ 8 đến 64 kí tự!  '
        }

        if (
          data.message === 'Password must be between 8 and 32 characters long!'
        ) {
          errorPass.textContent = 'Mật khẩu phải có từ 8 đến 32 kí tự'
        }

        if (data.message === 'Password does not match!') {
          errorRePass.textContent = 'Mật khẩu không khớp'
        }
      }
    } catch (error) {
      console.error('internet error')
    }
  })
})
