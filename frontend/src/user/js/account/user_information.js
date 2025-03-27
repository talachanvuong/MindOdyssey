import '../../../style.css'
import api from '../config/envConfig.js'
import callApi from '../model/callApi.js'
import msg from '../model/messageHandle.js'

document.addEventListener('DOMContentLoaded', () => {
  //================== EFFECT ===============================//
  const user_zone = document.getElementById('user_zone')
  setTimeout(() => {
    user_zone.classList.remove('opacity-0', '-translate-y-5', 'scale-90')
    user_zone.classList.add(
      'opacity-100',
      'scale-100',
      'translate-y-0',
      'duration-700'
    )
  }, 10)

  //effect for detail information div
  const detail_zone = document.getElementById('detail_zone')
  setTimeout(() => {
    detail_zone.classList.remove('opacity-0', 'scale-90')
    detail_zone.classList.add('duration-1000', 'scale-100')
  }, 300)

  // popup menu
  const openMenuBtn = document.getElementById('open_Menu_Btn')
  const menu = document.getElementById('menu')

  // popup setting
  const openSettingBtn = document.getElementById('open_Setting_Btn')
  const setting = document.getElementById('setting')
  const confirmButton = document.getElementById('button')

  // Close all popups
  function closeAllPopups() {
    // Hide menu popup
    if (!menu.classList.contains('invisible')) {
      menu.classList.add('opacity-0', 'scale-y-0')
      menu.classList.remove('scale-y-100')
      setTimeout(() => {
        menu.classList.add('invisible')
      }, 500)
    }

    // Hide setting popup
    if (!setting.classList.contains('invisible')) {
      setting.classList.add('opacity-0', 'scale-y-0')
      setting.classList.remove('scale-y-100')
      setTimeout(() => {
        setting.classList.add('invisible')
      }, 500)
    }
  }

  //open change name
  const changeNameBtn = document.getElementById('changeNameBtn')
  const change_name = document.getElementById('change_name')

  changeNameBtn.addEventListener('click', () => {
    change_name.classList.remove('invisible')
  })
  //change name
  const renameBtn = document.getElementById('renameBtn')
  renameBtn.addEventListener('submit', (e) => {
    e.stopPropagation()
    change_name.classList.add('invisible')
  })
  //close change name
  const closeReNameBtn = document.getElementById('closeReNameBtn')
  closeReNameBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    change_name.classList.add('invisible')
  })

  // Open menu
  function toggleMenu(event) {
    event.stopPropagation() // Ngăn chặn sự kiện click lan ra ngoài

    // Đóng popup khác (nếu có)
    if (!setting.classList.contains('invisible')) closeAllPopups()

    if (menu.classList.contains('invisible')) {
      menu.classList.remove('invisible')
      setTimeout(() => {
        menu.classList.remove('opacity-0', 'scale-y-0')
        menu.classList.add('scale-y-100', 'duration-500')
      }, 0)
    } else {
      menu.classList.add('opacity-0', 'scale-y-0')
      menu.classList.remove('scale-y-100')
      setTimeout(() => {
        menu.classList.add('invisible')
      }, 500)
    }
  }

  // Open setting
  function toggleSetting(event) {
    event.stopPropagation() // Ngăn chặn sự kiện click lan ra ngoài

    // Đóng popup khác (nếu có)
    if (!menu.classList.contains('invisible')) closeAllPopups()

    if (setting.classList.contains('invisible')) {
      setting.classList.remove('invisible')
      setTimeout(() => {
        setting.classList.remove('opacity-0', 'scale-y-0')
        setting.classList.add('scale-y-100', 'duration-500')
      }, 0)
    } else {
      setting.classList.add('opacity-0', 'scale-y-0')
      setting.classList.remove('scale-y-100')
      setTimeout(() => {
        setting.classList.add('invisible')
      }, 500)
    }
  }

  // Event listeners
  openMenuBtn.addEventListener('click', toggleMenu)
  openSettingBtn.addEventListener('click', toggleSetting)
  confirmButton.addEventListener('click', closeAllPopups)

  // Close popups when clicking outside
  document.addEventListener('click', (event) => {
    if (
      !menu.contains(event.target) &&
      event.target !== openMenuBtn &&
      !setting.contains(event.target) &&
      event.target !== openSettingBtn
    ) {
      closeAllPopups()
    }
  })

  //======================= LOGIC ===============================//
  //const name = document.getElementById('name')
  const email = document.getElementById('email')
  const display_name = document.getElementById('display_name')

  //get user information function
  async function getUserInfo() {
    const apiResult = await callApi.callApi(api.apiShowInfo, null, 'GET')
    if (apiResult.status === `success`) {
      email.textContent = apiResult.data.email
      display_name.textContent = apiResult.data.display_name
    } else {
      console.log(apiResult)
      name.textContent = 'error'
      email.textContent = 'error'
      display_name.textContent = 'error'
    }
  }
  getUserInfo()

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
  logout()

  //change name
  const renameForm = document.getElementById('reNameForm')
  const newNameInput = document.getElementById('new_name')
  const popupAlert = document.getElementById('popupAlert')
  const error = document.getElementById('error')
  renameForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newName = newNameInput.value.trim()
    const oldName = name.textContent.trim()

    //filter if newname is similar to oldname
    if (newName === oldName) {
      msg.popup(popupAlert, 'New name must be different from old name')
      return
    }

    msg.redText(error, ``)

    const apiResult = await callApi.callApi(
      api.apiUpdate,
      { new_display_name: newName },
      'PATCH'
    )
    if (apiResult.status === `success`) {
      msg.popup(popupAlert, apiResult.message)
      name.textContent = newName
      display_name.textContent = newName
    } else {
      const type = msg.classify(apiResult.message)
      if (type === 'redText') {
        msg.redText(error, apiResult.message)
      }
    }
  })
})
