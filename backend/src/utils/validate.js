export const requiredValidate = (fields) => {
  for (const field of fields) {
    if (!field) {
      return 'Missing required field!'
    }
  }
}

export const displayNameValidate = (text) => {
  const minLength = 8
  const maxLength = 64
  if (text.length < minLength || text.length > maxLength) {
    return 'Display name must be between 8 and 64 characters long!'
  }
}

export const emailValidate = (text) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(text)) {
    return 'Invalid email address!'
  }
}

export const passwordValidate = (text) => {
  const minLength = 8
  const maxLength = 32
  if (text.length < minLength || text.length > maxLength) {
    return 'Password must be between 8 and 32 characters long!'
  }
}

export const titleCourseValidate = (text) => {
  const minLength = 8
  const maxLength = 256
  if (text.length < minLength || text.length > maxLength) {
    return 'Title must be between 8 and 256 characters long!'
  }
}
