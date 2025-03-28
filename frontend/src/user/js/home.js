import '../../style.css'
import callApi from './model/callApi'
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.opacity-0')
  elements.forEach((el) => {
    setTimeout(() => {
      el.classList.add('opacity-100')
      el.classList.add('duration-1000')
    }, 0)
  })

  /*DESCRIPTION:
  IF user has already login, a refresh token is going to be allocate. 
  Base on it, I can check a user has login or not =D
  */
  async function checkLogin() {
    const res = await callApi.refreshToken()
    if (res) {
      window.location.href = `account/lobby.html`
      console.log('User has already login ~(^v^)~')
    } else console.log("User hasn't login yet (>_<)")
  }
  checkLogin()
})
