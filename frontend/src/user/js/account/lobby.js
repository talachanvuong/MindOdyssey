import '../../../style.css'
document.addEventListener('DOMContentLoaded', () =>{

    //send request to refresh token every 1 hour
    setInterval(async()=>{
        try{
            const response =await fetch('http://localhost:3000/api/user/refreshtoken', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const data = await response.json()
            if(response.ok){
                //check message
                console.log(data)
            }else{
                if(data.message === "Refresh token expired!"){
                    console.log(data.message)
                    alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!')
                    window.location.href = '../../page/account/login.html'
                }
                if(data.message === "Refresh token missing!"){
                    console.log(data.message)
                    alert('Có lỗi xảy ra. Vui lòng đăng nhập lại!')
                    window.location.href = '../../page/account/login.html'
                }
                if(data.message === "Invalid refresh token!"){
                    console.log(data.message)
                    alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!')
                    window.location.href = '../../page/account/login.html'
                }
                if(data.message === "Refresh token not found!"){
                    console.log(data.message)
                    alert('Phiên đăng nhập của ban đã hết hạn. Vui lòng đăng nhập lại!')
                    window.location.href = '../../page/account/login.html'}
        }
        }catch(err){
            //check error
            console.error(err)
        }

    },3600000)

    //logout button
    const logout = document.getElementById('logout')
    logout.addEventListener('click', async()=>{
        try{
            const response = await fetch('http://localhost:3000/api/user/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const data = await response.json()
            if(response.ok){
                //logout success
                console.log(data.message)
                window.location.href = '../../page/account/login.html'
            }else{
                //check error message
                alert('error occured !!') 
                console.log(data.message)
            }
        }catch(err){
            //check error
            console.error(err)
        }
    })
})