import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import effect from '../model/effect.js'

document.addEventListener('DOMContentLoaded', () => {

  effect.assignAfterLoading.duration_assign('storage',500)
  effect.assignAfterLoading.duration_assign('completed_doc',500)
  effect.assignAfterLoading.duration_assign('create_doc',500)
  effect.assignAfterLoading.duration_assign('manage',500)
  effect.assignAfterLoading.duration_assign('searchButton',500)
  effect.assignAfterLoading.duration_assign('user',500)
  effect.assignAfterLoading.duration_assign('infoText',500)
  effect.appear.move_down('main',1000,10)

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

async function getNameUser(){
  const res = await callApi.callApi(
    api.apiShowInfo,
    null,
    'GET'
  )
  document.getElementById('userName').textContent = res.data.display_name

}
  getNameUser()
  searching()
})
