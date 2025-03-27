import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show_doc from '../model/show_doc.js'
import effect from '../model/effect.js'

//get information from url when user want to see specific history
const urlParams = new URLSearchParams(window.location.search)
const history_id = Number(urlParams.get('history_id'))
const doc_id = urlParams.get('doc_id')

document.addEventListener('DOMContentLoaded', () => {
  effect.assignAfterLoading.duration_assign('userInfoBlackText', 500, 10)
  effect.assignAfterLoading.duration_assign('back', 500, 10)
  effect.assignAfterLoading.duration_assign('homeBtn', 500, 10)
  effect.assignAfterLoading.duration_assign('backToPracticeScreen', 500, 10)
  effect.assignAfterLoading.duration_assign('findMoreDoc', 500, 10)
  effect.assignAfterLoading.duration_assign('user', 500, 10)

  const backToPracticeScreen = document.getElementById('backToPracticeScreen')
  const backBtn = document.getElementById('back')

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
    const res = await callApi.callApi(
      history_id 
      ? `${api.apiPracticeHistoryId}?practice_history_id=${history_id}`
      : `${api.apiPracticeHistory}?page=1&limit=1`,
      null,
      'GET'
    )
    show_doc.showHistoryPractice('list', res.data[0].detail)
    document.getElementById('score').textContent =
      res.data[0].score
    document.getElementById('total').textContent =
      res.data[0].detail.length
    document.getElementById('numberOfCorrect').textContent = Math.round(
      (res.data[0].score *
        res.data[0].detail.length) /
        100
    )
    const end = new Date(res.data[0].end_time)
    const start = new Date(res.data[0].start_time)

    const time = end - start

    const totalSeconds = Math.floor(time / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      '0'
    )
    const seconds = String(totalSeconds % 60).padStart(2, '0')

    document.getElementById('time').textContent =
      `${hours}:${minutes}:${seconds}s`

    backToPracticeScreen.href = doc_id
      ? `practiceScreen.html?id=${doc_id}`
      : 'practiceHistory.html'
    backBtn.href = doc_id
      ? `practiceScreen.html?id=${doc_id}`
      : 'practiceHistory.html'
  }
  gainHistory()
  userInfo()
})
