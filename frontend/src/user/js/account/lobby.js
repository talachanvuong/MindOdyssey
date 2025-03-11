import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'

document.addEventListener('DOMContentLoaded', () => {
  //logout button
  function logout() {
    const logout = document.getElementById('logout')
    logout.addEventListener('click', async () => {
      const result = await callApi.callApi(api.apiLogout, {}, 'POST')
      if (!result.status === 'success') {
        alert(result.message)
      } else {
        window.location.href = '../home.html'
      }
    })
  }

  //searching directory
  /*DESCRIPTION:
  - Its just display the search input and button
  - Get search value from input
  - If search value is not empty, redirect to doc_lib.html with search value
  - If search value is empty, redirect to doc_lib.html
  - The main feature is in the doc_lib.html file 
   */
  function searching(){
    const searchInput =  document.getElementById('searchInput')
    const searchButton = document.getElementById('searchButton')
    searchButton.addEventListener('click',  (e) => {
      e.preventDefault()
      searchInput.value
      ?window.location.href =  `../practice/searchDoc.html?searchValue=${searchInput.value}`
      :window.location.href =  `../practice/searchDoc.html`
  })

}

  searching()
  logout()
})
