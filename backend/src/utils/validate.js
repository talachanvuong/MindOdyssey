import { MESSAGE } from './constant.js'

export const requiredValidate = (fields) => {
  for (const field of fields) {
    if (!field || Object.keys(field).length <= 0) {
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

export const titleValidate = (text) => {
  const minLength = 8
  const maxLength = 256
  if (text.length < minLength || text.length > maxLength) {
    return MESSAGE.VALIDATE.TITLE
  }
}

export const contentValidate = (text) => {
  const maxLength = 4096
  if (text.length > maxLength) {
    return MESSAGE.VALIDATE.QUESTION
  }
}

export const attachmentValidate = (size) => {
  // 5 MB
  const maxSize = 5 * 1024 * 1024
  if (size > maxSize) {
    return MESSAGE.VALIDATE.IMAGE
  }
}

export const descriptionValidate = (text) => {
  const maxLength = 2048
  if (text.length > maxLength) {
    return MESSAGE.VALIDATE.DESCRIPTION_DOCUMENT
  }
}

export const timePerQuestionValidate = (time) => {
  // 30s
  const minTime = 30 * 1000
  // 3m
  const maxTime = 3 * 60 * 1000
  if (time < minTime || time > maxTime) {
    return MESSAGE.VALIDATE.TIME_PER_QUESTION
  }
}

export const reasonValidate = (text) => {
  const maxLength = 2048
  if (text.length > maxLength) {
    return MESSAGE.VALIDATE.REASON
  }
}
