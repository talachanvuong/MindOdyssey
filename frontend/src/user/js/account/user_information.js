import '../../../style.css'
document.addEventListener('DOMContentLoaded', () => {
  //effect for user div
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

  //checkbox
  const checkboxToContentMap = {
    completed_doc_check: 'completed_doc',
    uploaded_doc_check: 'uploaded_doc',
    history_check: 'history',
  }

  const checkbox = document.querySelectorAll("#setting input[type='checkbox']")

  checkbox.forEach((checkbox) => {
    checkbox.checked = true
  })
  confirmButton.addEventListener('click', () => {
    checkbox.forEach((checkbox) => {
      const elementId = checkboxToContentMap[checkbox.id]
      const element = document.getElementById(elementId)
      if (element) {
        if (checkbox.checked) {
          element.classList.remove('invisible')
          setTimeout(() => {
            element.classList.remove('opacity-0', 'scale-0')
            element.classList.add('opacity-100', 'scale-100')
          }, 10)
        } else {
          element.classList.add('opacity-0', 'scale-0')
          element.classList.remove('opacity-100', 'scale-100')
          setTimeout(() => {
            element.classList.add('invisible')
          }, 300)
        }
      }
    })
  })
})
