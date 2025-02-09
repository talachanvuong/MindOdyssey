import '../../../style.css'

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
  const rePassInput= document.getElementById('re_passInput')

  form.addEventListener('submit', async(e) => {
    e.preventDefault()
    const oldPass = oldPassInput.value.trim()
    const newPass = newPassInput.value.trim() 
    const rePass = rePassInput.value.trim()

    //check all fields are filled
    let filled = true
    const oldPassError = document.getElementById('old_pass_error') 
    const newPassError = document.getElementById('new_pass_error')
    const rePassError = document.getElementById('re_pass_error')
    if(!oldPass) {
      filled = false
      oldPassError.textContent = 'Vui lòng nhập mật khẩu cũ'
    }
    if(!newPass) {
      filled = false
      newPassError.textContent = 'Vui lòng nhập mật khẩu mới'
    }
    if(!rePass) {
      filled = false
      rePassError.textContent = 'Vui lòng nhập lại mật khẩu mới'
    }
    if(!filled) return

    try{
      const response = await fetch(
        'http://localhost:3000/api/user/changepassword',
        {
          method: 'POST',
          credentials: 'include',
          
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPassword: oldPass,
            newPassword:newPass, 
            confirmNewPassword: rePass}),
        }
      )
      const data = await response.json()
      if(response.ok){
        const success = document.getElementById('success')
        success.classList.remove('invisible')
      }
      else{
        if(data.message === "Password must be between 8 and 32 characters long!"){
          alert('Mật khẩu phải chứa từ 8 đến 32 ký tự')
        }
        if(data.message === "Wrong password!"){
          alert('Mật khẩu cũ không đúng')
        }
        if(data.message === "Password does not match!"){
          alert('Mật khẩu mới không khớp')
        }
        console.log(data.message)
      }

    }catch(error){
      console.error(error)
    }

  })


})
