export class Popup_Modal {
  constructor(id, message) {
    //console.log(document.getElementById(id))
    this.idModal = document.getElementById(id)
    this.message = message
    if (!this.idModal) {
      console.log('popup id can not be found!')
      return
    }
    if (!this.message) {
      console.log('error occurs in gain information')
      return
    }
  }
  open(locate = '') {
    this.idModal.innerHTML = `<div
          class=" fixed top-0 h-screen w-screen bg-gray-400 bg-opacity-55"
        >
          <div
            class="mx-auto mt-44 flex h-fit w-11/12 flex-col items-center rounded-xl border bg-white sm:mx-auto sm:w-2/5"
          >
            <p id="existError" class="mt-5 text-2xl text-center mx-3">${this.message}</p>
            <button
              id="close"
              class="mb-5 mt-5 h-11 w-2/5 rounded-xl bg-orange-300 text-xl font-bold shadow-xl hover:bg-orange-400"
            >
              OK
            </button>
          </div>
        </div>`
    document
      .getElementById('close')
      .addEventListener('click', () => {
        if (locate) {
          window.location.href = locate
        }
        this.close()
      })
  }
  close() {
    this.idModal.innerHTML = ''
  }
}
