import '../../../style.css'
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

    let filled= true //check all fields are filled

    if (!newPass) {
      errorNewPass.textContent = 'Please enter your new password'
     filled = false
    
    } else {
      errorNewPass.textContent = ''
    }
    if (!reNewPass) {
      errorReNewPass.textContent = 'Please re-enter your new password'
      filled = false
    } else {
      errorReNewPass.textContent = ''
    }

    if(!filled) return

    try{
      const response = await fetch('http://localhost:3000/api/user/resetpassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: newPass, confirmNewPassword: reNewPass })
      })

      const data = await response.json()

      if(response.ok){
        const success = document.getElementById('success')
        success.classList.remove('invisible')
      }
      else{
        if(data.message === "Access token missing!"){
          window.location.href = '../../page/account/tokenExpired.html'
        }
        if(data.message === "Password must be between 8 and 32 characters long!"){
          alert('mật khẩu phải chứa từ 8 đến 32 ký tự')
        }
        if(data.message === "Password does not match!"){
          alert('mật khẩu không khớp')
        }
        
      }
    }catch(error){
      console.error(error)
    }
  })
})
