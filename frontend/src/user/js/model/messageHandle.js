import { Popup_Modal } from '../model/popup.js'

const redText = (id, message) => {
  if (!id) return
  id.innerHTML = `<p class=" ml-2 text-red-500">${message}</p>`
}
const popup = (id,message)=>{
    if(!id) return
    const popup = new Popup_Modal(id.id,message )
    popup.open()
}
const alertMessage = [
  'Invalid email format',
  'Password must be at least 8 characters long',
  'Confirm new password must match new password',
]
const popupMessage = [
  'User not found!',
  'Wrong password!',
  'Send email successfully!',
]

function classify(message) {
    if(!message) {
        console.error('Message null')
        return
    }
  if (alertMessage.includes(message)) {
    return 'alert'
  }
  if (popupMessage.includes(message)) {
    return 'popup'
  }
  console.error('this message is need to updated!')
}


export default {classify,redText,popup}
