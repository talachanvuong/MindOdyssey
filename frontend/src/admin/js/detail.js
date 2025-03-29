import '../../style.css'
import callApi from './model/callApi'
import api from '../config/envConfig'
import msgHandle from './model/msgHandle'
import showQues from './model/show_doc'
import { timeConvert } from '../../utils/convertUtils'

// Lấy document_id từ URL
const urlParams = new URLSearchParams(window.location.search)
let doc_id = urlParams.get(`id`)

let res = null
const detail = {
  author: '',
  course: '',
  created_at: '',
  description: '',
  last_updated: '',
  title: '',
  questions: [],
  total_questions: '',
}

document.addEventListener('DOMContentLoaded', () => {
  const popupModal = document.getElementById('popupModal')
  const nameOfDoc = document.getElementById('nameOfDoc')
  const author = document.getElementById('author')
  const course = document.getElementById('subject')
  const lastEdit = document.getElementById('lastEdit')
  const description = document.getElementById('description')
  const createTime = document.getElementById('createTime')
  const quantity = document.getElementById('quantity')
  const nameOfDocDisapprove = document.getElementById('nameDocDisapprove')

  function showInfo() {
    nameOfDoc.textContent =detail.title
    author.textContent = detail.author
    course.textContent = detail.course
    lastEdit.textContent = timeConvert(detail.last_updated)
    description.textContent = detail.description
    createTime.textContent = timeConvert(detail.created_at)
    quantity.textContent = detail.total_questions
    nameOfDocDisapprove.textContent = detail.title
  }

  async function apiCallingInfo() {
    res = await callApi.callApi(
      api.apiGetDocumentDetail,
      { document: Number(doc_id) },
      'POST'
    )

    if (res.status === 'success') {
      Object.assign(detail, res.result)
      showInfo()
      showQues.showAnswerList('list', detail.questions)
    } else {
      const type = msgHandle.popup(res.message)
      if (type === 'popup') {
        msgHandle.popup(popupModal, res.message)
      }
    }
  }

  async function approveDocApiCalling(status, reason) {
    res = await callApi.callApi(
      api.apiReviewDocument,
      reason
        ? { document: Number(doc_id), isApproved: status, reason }
        : { document: Number(doc_id), isApproved: status },
      'POST'
    )

    if (res.status === 'success') {
      if (!reason) msgHandle.popup(popupModal, 'Approving success', 'doc_list.html')
      else msgHandle.popup(popupModal, 'Disapproving success', 'doc_list.html')
    } else {
      alert('Error occur')
    }
  }

  function approveDocument() {
    /*DESCRIPTION OF  disapprove():
    after admin click on disapprove button,
     a popup will appear and admin can input the reason for disapproving
     ,if the reason is not empty, a verify popup will appear and admin can
     click on verify button to verify that admin actually want to disapprove
      the document,and then admin will be redirected to list_doc.html. If admin click on verify button, the document will be disapproved
      and the popup will disappear,if admin click on close button, the popup will disappear
    */
    function disapprove() {
      const disapprovePopup = document.getElementById('disapprovePopup')
      const closePopup = document.getElementById('closePopup')
      const reasonInput = document.getElementById('reason')
      const disapproveBtn = document.getElementById('disapproveBtn')
      const openDisapprovePopupBtn =
        document.getElementById('openDisapproveBtn')

      //verify
      const verifyDisapprovePopup = document.getElementById(
        'verifyDisapprovePopup'
      )
      const closePopupVerifyDisapprove = document.getElementById(
        'closePopupVerifyDisapprove'
      )
      const verifyBtn = document.getElementById('verifyDisapprove')

      //open popup
      openDisapprovePopupBtn.addEventListener('click', () => {
        disapprovePopup.classList.remove('invisible')
      })

      //close popup
      closePopup.addEventListener('click', () => {
        disapprovePopup.classList.add('invisible')
      })

      //disapprove button
      disapproveBtn.addEventListener('click', (e) => {
        if (reasonInput.value.trim() !== '') {
          e.preventDefault()
          verifyDisapprovePopup.classList.remove('invisible')
        }
      })

      //verify disapprove
      verifyBtn.addEventListener('click', (e) => {
        e.preventDefault()
        const reason = reasonInput.value.trim()
        approveDocApiCalling(false, reason)
        verifyDisapprovePopup.classList.add('invisible')
      })

      //close verify disapprove
      closePopupVerifyDisapprove.addEventListener('click', () => {
        verifyDisapprovePopup.classList.add('invisible')
      })
    }
    /*DESCRIPTION OF approve():
    after admin click on approve button, a popup will appear and admin can click on
    verify button to verify that admin actually want to approve the document, if admin
    click on verify button, the document will be approved and the popup will disappear,
    then redirect to doc_list.html, if admin click on close button, the popup will disappear
    */ 
    function approve() {
      const approveBtn = document.getElementById('approveBtn')
      const verifyApprovePopup = document.getElementById('verifyApprovePopup')
      const closePopupVerifyApprove = document.getElementById(
        'closePopupVerifyApprove'
      )
      const verifyApprove = document.getElementById('verifyApprove')
      approveBtn.addEventListener('click', () => {
        verifyApprovePopup.classList.remove('invisible')
      })
      closePopupVerifyApprove.addEventListener('click', () => {
        verifyApprovePopup.classList.add('invisible')
      })
      verifyApprove.addEventListener('click', () => {
        approveDocApiCalling(true)
        verifyApprovePopup.classList.add('invisible')
      })
    }

    disapprove()
    approve()
  }

  approveDocument()
  apiCallingInfo()
})
