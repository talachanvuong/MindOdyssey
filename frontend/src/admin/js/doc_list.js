import '../../style.css'
import callApi from './model/callApi'
import api from '../config/envConfig'
import msgHandle from './model/msgHandle'
document.addEventListener('DOMContentLoaded', () => {
  function filterPopup() {
    const modal = document.getElementById('popup')
    const Btn = document.getElementById('filter')
    //const closeBtn = document.getElementById('CloseBtn')

    Btn.addEventListener('click', () => {
      modal.classList.remove('invisible')
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('invisible')
    })

    // closeBtn.addEventListener('click', () => {
    //   modal.classList.add('invisible')
    // })
  }

  function filterForm(callBack) {
    const filterInput = document.getElementById('filterInput')
    const form = document.getElementById('filterForm')
    form.addEventListener(`submit`, (e) => {
      e.preventDefault()
      const filter = filterInput.value
      if(!filter){
        console.log('Date input is null')
        callBack(0)
        return
      }
      const date = new Date(filter)
      console.log(date)
      if(isNaN(date.getTime())){
        console.log('this date is invalid')
        callBack(0)
      }
      else callBack(date)
    })
  }

  function searchDocument() {
    let page = 3
    let perPage =10
    const form = document.getElementById('form')
    const fieldInput = document.getElementById('input')
    let filterDate = 0
    filterForm((date) => {
      filterDate = date.getTime()
    })
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const input = fieldInput.value.trim()

      const result = await callApi.callApi(
        api.apiApprovedDocument,
        {pagination:{
          page:page,
          perPage:perPage
        },
        keyword:input,
        filter:filterDate
        },
        "POST"
      )

      console.log(result)
    })
  }

  searchDocument()

  filterPopup()
})
