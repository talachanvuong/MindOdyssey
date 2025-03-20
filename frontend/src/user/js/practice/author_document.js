import '../../../style.css'
import callApi from '../model/callApi.js'
import api from '../config/envConfig.js'
import show from '../model/show_doc.js'

let page = 1
let totalPage
let res
document.addEventListener("DOMContentLoaded",()=>{

    const theFirst= document.getElementById('theFirst')
    const thePrev=document.getElementById('thePrev')
    const curPage = document.getElementById('curPage')
    const theNext = document.getElementById('theNext')
    const theLast = document.getElementById('theLast')

    theFirst.addEventListener('click',()=>{
        if(page>1){
            page = 1
            apiCalling()
        }
    })
    thePrev.addEventListener('click',()=>{
        if(page > 1){
            page--
            apiCalling()
        }
    })
    theNext.addEventListener('click',()=>{
        if(page < totalPage){
            page++
            apiCalling()
        }
    })
    theLast.addEventListener('click',()=>{
        if(page <totalPage){
            page = totalPage
            apiCalling()
        }
    })

    
    async function apiCalling () {
        const params = new URLSearchParams({
            user_id : 1,
            page:page
            // limit: state.perPage,
          })
        res =await callApi.callApi(
            api.apiAuthorDocument + `?${params.toString()}`,
            null,
            "GET"
        )
        console.log(res)
        totalPage = res.data.totalPages
        show.showDocList("list",res.data.docs)
        pagination()
    }
    function pagination(){
        theFirst.classList.remove('invisible')
        theNext.classList.remove('invisible')
        thePrev.classList.remove('invisible')
        theLast.classList.remove('invisible')
        curPage.textContent = res.data.currentPage
        if(page == 1){
            theFirst.classList.add('invisible')
            thePrev.classList.add('invisible')
        }
        if(page == res.data.totalPages){
            theLast.classList.add('invisible')
            theNext.classList.add('invisible')
        }
    }

    apiCalling()
})