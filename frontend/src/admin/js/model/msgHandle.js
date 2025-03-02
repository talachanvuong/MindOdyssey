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
const redMessage = [
  '"display_name" length must be at least 8 characters long',
  '"display_name" is not allowed to be empty',
  '"password" is not allowed to be empty',
   '"display_name" length must be less than or equal to 64 characters long',
   '"password" length must be less than or equal to 32 characters long',
   '"password" length must be at least 8 characters long'
]
const popupMessage = [
 'Admin not found!',
 'Wrong password!',
 'Admin login successfully!'
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
  console.error('this message is need to updated!')
}

export default { classify, redText, popup }
