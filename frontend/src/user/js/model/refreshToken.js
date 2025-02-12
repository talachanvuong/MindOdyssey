const refreshToken = async () => {
  try {
    const response = await fetch(
      'http://localhost:3000/api/user/refreshtoken',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json()
    if(response.ok){
        console.log('Token Refreshed')
    }
    else{
      console.log(`API error:`,data.message)
    }
  } catch (error) {
    console.error(error)
  }
}

export default refreshToken //refreshToken function