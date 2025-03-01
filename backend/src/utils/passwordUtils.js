import bcrypt from 'bcryptjs'

const isPasswordCorrect = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export default {
  isPasswordCorrect,
}
