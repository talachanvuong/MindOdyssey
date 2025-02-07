import '../../../style.css'
document.addEventListener('DOMContentLoaded', () => {
  // Lấy phần tử form và input
  const form = document.querySelector('form')
  const emailInput = document.querySelector('input')
  const loading = document.getElementById('loading')

  // Xử lý sự kiện submit
  form.addEventListener('submit', async (event) => {
    loading.classList.remove('invisible')
    event.preventDefault() // Ngăn chặn load lại trang

    const email = emailInput.value.trim() // Lấy email nhập vào

    if (!email) {
      alert('Vui lòng nhập email!')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/user/verifyemail', //nơi gửi
        {
          method: 'POST', //kiểu yêu cầu
          headers: {
            'Content-Type': 'application/json', //kiểu dữ liệu
          },
          body: JSON.stringify({ email }), // nội dung gửi
        }
      )

      const data = await response.json()

      if (response.ok) {
        //popup alert if success
        const successAlert = document.getElementById('success')
        const btn = document.getElementById('button1')
        successAlert.classList.remove('invisible')
        loading.classList.add('invisible')
        btn.addEventListener('click', () => {
          successAlert.classList.add('invisible')
        })
      } else {
        if(data.message === "User already exists!"){
          const failAlert = document.getElementById('fail')
          const btn = document.getElementById('button2')
          failAlert.classList.remove('invisible')
          loading.classList.add('invisible')
          btn.addEventListener('click', () => {
            failAlert.classList.add('invisible')
          })
        }

        if(data.message === "Invalid email address!"){
          const failAlert = document.getElementById('invalid')
          const btn = document.getElementById('button3')
          failAlert.classList.remove('invisible')
          loading.classList.add('invisible')
          btn.addEventListener('click', () => {
            failAlert.classList.add('invisible')
          })
        }
       
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error)
      const failAlert = document.getElementById('fail')
      const btn = document.getElementById('button2')
      failAlert.classList.remove('invisible')
      loading.classList.add('invisible')
      btn.addEventListener('click', () => {
        fail.classList.add('invisible')
      })
    }
  })
})
