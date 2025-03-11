import { Popup_Modal } from '../model/popup.js'

const redText = (id, message) => {
  if (!id) return
  id.innerHTML = `<p class=" ml-2 text-red-500">${message}</p>`
}
const popup = (id, message,locate='') => {
  if (!id) return
  const popup = new Popup_Modal(id.id, message)
  popup.open(locate)
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
  '"display_name" length must be at least 8 characters long',
  '"display_name" is not allowed to be empty',
  '"password" is not allowed to be empty',
  '"display_name" length must be less than or equal to 64 characters long',
  '"password" length must be less than or equal to 32 characters long',
  '"password" length must be at least 8 characters long',
]
const popupMessage = [
  'Admin not found!',
  'Wrong password!',
  'Admin login successfully!',
]

const commonAlert = ['Page not valid!']

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
  if (commonAlert.includes(message)) {
    return 'notification'
  }
  console.error('this message is need to updated!')
}

export default { classify, redText, popup, notification }
