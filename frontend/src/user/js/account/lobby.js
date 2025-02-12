import '../../../style.css'
document.addEventListener('DOMContentLoaded', () => {

  //logout button
  const logout = document.getElementById('logout')
  logout.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        //logout success
        console.log(data.message)
        window.location.href = '../../page/account/login.html'
      } else {
        //check error message
        alert('error occured !!')
        console.log(data.message)
      }
    } catch (err) {
      //check error
      console.error(err)
    }
  })
})
