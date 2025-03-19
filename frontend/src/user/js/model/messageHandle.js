import { Popup_Modal } from '../model/popup.js'

const redText = (id, message) => {
  if (!id) return
  id.innerHTML = `<p class=" ml-2 text-red-500">${message}</p>`
}
const popup = (id, message) => {
  if (!id) return
  const popup = new Popup_Modal(id.id, message)
  popup.open()
}

const notification = (id) => {
  if (!id) {
    console.log('You need a did ID to display notification')
    return
  } else {
    const display = document.getElementById(id)
    display.innerHTML = ``
    display.innerHTML = `<div class="  mx-auto w-full bg-white p-2 rounded-xl shadow-gray-300 shadow-md">
          <img src="../img/notfound.png" class="h-20 mx-auto">
          <p class="text-2xl text-center font-bold">Không tìm thấy tài liệu </p>
         </div>`
  }
}
const redMessage = [
  'Invalid email format',
  'Password must be at least 8 characters long',
  'Confirm new password must match new password',
  'Password cannot be empty',
  'Confirm password cannot be empty',
  'Email cannot be empty',
  'Display name must be at least 8 characters long',
  'Display name cannot be empty',
  'Confirm password must match password',
  'Confirm password is required',
  'Email cannot be empty',
  'Display name must be at most 64 characters long',
  'Password must be at most 32 characters long'
]
const popupMessage = [
  'User not found!',
  'Wrong password!',
  'Send email successfully!',
  'User already exists!',
  'Update user successfully!',
  'Request is already being processed!',
  'New password must be different from old password',
  
]

const alertMessage = ['Access token is required']
function classify(message) {
  if (!message) {
    console.error('Message null')
    return
  }
  if (redMessage.includes(message)) {
    return 'redText'
  }
  if (popupMessage.includes(message)) {
    return 'popup'
  }
  if (alertMessage.includes(message)) {
    return 'alert'
  }
  console.warn(`⚠️ Chưa có quy tắc xử lý cho message: "${message}"`)
  return 'redText' // Mặc định hiển thị lỗi chữ đỏ nếu chưa được định nghĩa

}

const showMessage = (id, message) => {
  const type = classify(message)
  if (type === 'redText') redText(id, message)
  else if (type === 'popup') popup(id, message)
  else if (type === 'alert') alert(message)
}

export default { classify, redText, popup, notification }
