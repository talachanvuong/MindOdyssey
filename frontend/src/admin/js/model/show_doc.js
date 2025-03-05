function show(id, array) {
  const list = document.getElementById(id)

  list.innerHTML = ''
  array.forEach((doc) => {
    const li = document.createElement('li')
    li.className =
      'flex flex-row items-center rounded-xl bg-white p-2 shadow-md shadow-gray-300'

    const imgIcon = document.createElement('img')
    imgIcon.src = '../img/docIcon.png'
    imgIcon.className = 'h-10'

    const p = document.createElement('p')
    p.className = 'ml-2 w-full'
    p.textContent = doc.title

    const a = document.createElement('a')
    a.href = 'detail.html'

    const imgDot = document.createElement('img')
    imgDot.className = 'h-7'
    imgDot.src = '../img/threeDot.png'

    a.appendChild(imgDot)
    li.appendChild(imgIcon)
    li.appendChild(p)
    li.appendChild(a)

    list.appendChild(li)
  })
}

export default { show }
