import { MESSAGE } from "./constant.js"

export const requiredValidate = (fields) => {
  for (const field of fields) {
    if (!field) {
      return MESSAGE.VALIDATE.REQUIRED
    }
  }
}

export const displayNameValidate = (text) => {
  const minLength = 8
  const maxLength = 64
  if (text.length < minLength || text.length > maxLength) {
    return MESSAGE.VALIDATE.DISPLAY_NAME
  }
}

export const emailValidate = (text) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(text)) {
    return MESSAGE.VALIDATE.EMAIL
  }
}

export const passwordValidate = (text) => {
  const minLength = 8
  const maxLength = 32
  if (text.length < minLength || text.length > maxLength) {
    return MESSAGE.VALIDATE.PASSWORD
  }
}

export const titleCourseValidate = (text) => {
  const minLength = 8
  const maxLength = 256
  if (text.length < minLength || text.length > maxLength) {
    return MESSAGE.VALIDATE.TITLE_COURSE
  }
}
