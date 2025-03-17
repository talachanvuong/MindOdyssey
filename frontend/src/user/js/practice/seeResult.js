import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show_doc from '../model/show_doc.js'

//get information from url when user want to see specific history
const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get('id')
const detail = JSON.parse(decodeURIComponent(urlParams.get('detail')))

document.addEventListener('DOMContentLoaded', () => {
  const backToPracticeScreen = document.getElementById('backToPracticeScreen')

  async function userInfo() {
    const userName = document.getElementById('userName')

    const apiResult = await callApi.callApi(api.apiShowInfo, null, 'GET')
    if (apiResult.status === 'success') {
      userName.textContent = apiResult.data.display_name
    } else {
      console.log(apiResult)
      userName.textContent = 'display_error'
    }
  }

  async function gainHistory() {
    if (!detail) {
      const res = await callApi.callApi(
        api.apiPracticeHistory + '?page=1&limit=1',
        null,
        'GET'
      )
      show_doc.showHistoryPractice('list', res.data.PracticeHistory[0].detail)
      document.getElementById('score').textContent =
        res.data.PracticeHistory[0].score
      document.getElementById('total').textContent =
        res.data.PracticeHistory[0].detail.length
      document.getElementById('numberOfCorrect').textContent = Math.round(
        (res.data.PracticeHistory[0].score *
          res.data.PracticeHistory[0].detail.length) /
          100
      )
      const end = new Date(res.data.PracticeHistory[0].end_time)
      const start = new Date(res.data.PracticeHistory[0].start_time)

      const time = end - start
      const second = String(Math.floor(time / 1000)).padStart(2, '0')
      const minute = String(Math.floor(second / 60)).padStart(2, '0')
      const hours = String(Math.floor(minute / 60)).padStart(2, '0')

      document.getElementById('time').textContent =
        `${hours}:` + `${minute}:` + `${second}s`

      backToPracticeScreen.href = `practiceScreen.html?id=${id}`
    } else {
      show_doc.showHistoryPractice('list', detail.detail)
      document.getElementById('score').textContent = detail.score

      document.getElementById('total').textContent = detail.detail.length

      document.getElementById('numberOfCorrect').textContent = Math.round(
        (detail.score * detail.detail.length) / 100
      )
      const end = new Date(detail.end_time)
      const start = new Date(detail.start_time)

      const time = end - start
      const second = String(Math.floor(time / 1000)).padStart(2, '0')
      const minute = String(Math.floor(second / 60)).padStart(2, '0')
      const hours = String(Math.floor(minute / 60)).padStart(2, '0')

      document.getElementById('time').textContent =
        `${hours}:` + `${minute}:` + `${second}s`

      backToPracticeScreen.href = `practiceHistory.html`
    }
  }
  gainHistory()
  userInfo()
})
