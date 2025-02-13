
import {Popup_Modal} from '../model/popup.js'

const redText = (idText,message)=>{
    if(!idText) return
    idText.innerHTML=`<p class=" ml-2 text-red-500">${message}</p>`
}


const messageHandle = (id,message) =>{
    if(!id){
        console.log('error occurs when gaining ID')
        return
    } 
    const popup = new Popup_Modal(id.id,message)
    switch(message){
        case "Invalid email format":{
            redText(id,message)
            break
        }
        case "Password must be at least 8 characters long":{
            redText(id,message)
            break
        }
        case "User not found!":{
            popup.open()
            break
        }
        case "Wrong password!":{
            popup.open()
            break
        }
        case "Send email successfully!":{
            popup.open()
            break
        }
        default:{
            console.log('this message is need to updated!')
            break
        }
    }
}

export default messageHandle