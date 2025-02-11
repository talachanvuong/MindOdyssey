import client from '../db/db.js'
import envConfig from '../config/envConfig.js'
import nm from 'nodemailer'
// Send email to verify
const sendEmail = async (email, subject, text, html) => {
  const transporter = nm.createTransport({
    service: 'gmail',
    auth: {
      user: envConfig.mailerEmail,
      pass: envConfig.mailerPass,
    },
  })

  // Config email
  const mailOptions = {
    from: envConfig.mailerEmail,
    to: email,
    subject: subject,
    text: text,
    html: html,
  }

  // Send email
  await transporter.sendMail(mailOptions)
}
const isUserExist = async (email) => {
  const query = `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
    `
  const result = await client.query(query, [email])
  return result.rowCount > 0
}

const selectPasswordUserIDbyEmail = async (email) => {
  const query = `
        SELECT user_id,password
        FROM users
        WHERE email=$1;`
  const result = await client.query(query, [email])
  return result.rows[0]
}

const insertRefreshToken = async (user_id, token) => {
  const query = `
        INSERT INTO refresh_tokens (user_id, token)
        VALUES ($1, $2)
    `
  await client.query(query, [user_id, token])
}

const insertUser = async (email, display_name, hashedPassword) => {
  const query = `
        INSERT INTO users (email,display_name,password)
        VALUES ($1,$2,$3)
    `
  await client.query(query, [email, display_name, hashedPassword])
}

const selectInfoUser = async (user_id) => {
  const query = `
        SELECT email,display_name
        FROM users
        WHERE user_id=$1
  `
  const result = await client.query(query, [user_id])
  return result.rows[0]
}

const selectDisplayname = async (user_id) => {
  const query = `
        SELECT display_name
        FROM users
        WHERE user_id=$1
  `
  const result = await client.query(query, [user_id])
  return result.rows[0].display_name
}

const updateDisplayname = async (display_name, user_id) => {
  const query = `
        UPDATE users
        SET display_name=$1
        WHERE user_id=$2
  `
  await client.query(query, [display_name, user_id])
}
const updateResetPassword = async (hashedPassword, email) => {
  const query = `
        UPDATE users
        SET password=$1
        WHERE email=$2
  `
  await client.query(query, [hashedPassword, email])
}

const selectPassword = async (user_id) => {
  const query = `
        SELECT password
        FROM users
        WHERE user_id=$1
  `
  const result = await client.query(query, [user_id])
  return result.rows[0].password
}
const updateChangePassword = async (hashedPassword, user_id) => {
  const query = `
        UPDATE users
        SET password=$1
        WHERE user_id=$2
  `
  await client.query(query, [hashedPassword, user_id])
}

const isRefreshTokenExist = async (refreshToken) => {
  const query = `
      SELECT 1
      FROM refresh_tokens
      WHERE token = $1
      LIMIT 1
  `
  const result = await client.query(query, [refreshToken])
  return result.rowCount > 0
}
const deleteRefreshToken = async (refreshToken) => {
  const query = `
      DELETE FROM refresh_tokens
      WHERE token = $1;
    `
  await client.query(query,[refreshToken])
}
export default {
  isUserExist,
  selectPasswordUserIDbyEmail,
  sendEmail,
  insertRefreshToken,
  insertUser,
  selectInfoUser,
  selectDisplayname,
  updateDisplayname,
  updateResetPassword,
  selectPassword,
  updateChangePassword,
  isRefreshTokenExist,
  deleteRefreshToken
}
