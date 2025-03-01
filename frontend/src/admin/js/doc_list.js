import '../../style.css'
document.addEventListener('DOMContentLoaded', () => {
  function filterPopup() {
    const modal = document.getElementById('popup')
    const Btn = document.getElementById('filter')
    const closeBtn = document.getElementById('CloseBtn')

    Btn.addEventListener('click', () => {
      modal.classList.remove('invisible')
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('invisible')
    })

    closeBtn.addEventListener('click', () => {
      modal.classList.add('invisible')
    })
  }

  filterPopup()
})
