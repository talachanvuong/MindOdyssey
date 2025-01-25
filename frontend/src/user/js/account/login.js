import '../../../style.css'
document.addEventListener('DOMContentLoaded', () => {
  const ele = document.getElementById('main')
  setTimeout(() => {
    ele.classList.remove('opacity-0', '-translate-y-12')
    ele.classList.add('opacity-100', 'translate-y-0', 'duration-1000')
  }, 200)

  //get ID
  const openPopUp = document.getElementById('openPopUp')
  const popupModal = document.getElementById('popupModal')
  const closePopUp = document.getElementById('cancle')
  const closePopUp2 = document.getElementById('closeBtn')
  const content = document.getElementById('popup_content')

  //Open Popup
  function toggleModal(event) {
    event.preventDefault()
    popupModal.classList.remove('hidden')
    setTimeout(() => {
      popupModal.classList.remove('opacity-0')
      popupModal.classList.add('opacity-100', 'duration-700')
      popup_content.classList.remove('-translate-y-3')
      popup_content.classList.add('translate-y-3')
    }, 100)
  }

  //close Popup
  function closeModal(event) {
    event.preventDefault()
    popupModal.classList.remove('opacity-100')
    popupModal.classList.add('opacity-0', 'duration-700')
    popup_content.classList.remove('translate-y-3')
    popup_content.classList.add('-translate-y-3')
    setTimeout(() => {
      popupModal.classList.add('hidden')
    }, 700)
  }

  //close Popup when click out side
  function closeModalWhenClickOutSide(event) {
    event.preventDefault()
    if (event.target === popupModal) {
      popupModal.classList.remove('opacity-100')
      popupModal.classList.add('opacity-0', 'duration-700')
      popup_content.classList.remove('translate-y-3')
      popup_content.classList.add('-translate-y-3')
      setTimeout(() => {
        popupModal.classList.add('hidden')
      }, 700)
    }
  }

  // click on button
  openPopUp.addEventListener('click', toggleModal)
  closePopUp.addEventListener('click', closeModal)
  closePopUp2.addEventListener(`click`, closeModal)
  popupModal.addEventListener('click', closeModalWhenClickOutSide)
})
