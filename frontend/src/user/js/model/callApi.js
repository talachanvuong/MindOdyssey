const refreshToken = async () => {
  try {
    const response = await fetch(
      'http://localhost:3000/api/user/refreshtoken',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const data = await response.json()

    if (response.ok) {
      console.log('Token Refreshed')
      return true
    } else {
      console.log('Error in refreshing Token:', data.message)
      return false
    }
  } catch (error) {
    console.log('Error in refreshToken:', error)
    return false
  }
}

const fetchData = async (linkApi, body = null, method) => {
  //fetch API and response the data
  try {
    const response = await fetch(linkApi, {
      method,
      credentials: 'include',
      body: body ? JSON.stringify(body) : null,
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    return {
      statusCode: response.status,
      message: data.message,
    }
  } catch (error) {
    console.log('Error in fetchData:', error)
    return null // Trả về null nếu fetch thất bại
  }
}

const callApi = async (linkApi, body = null, method) => {
  try {
    //the result data of the fetch
    const data = await fetchData(linkApi, body, method)

    //check if the token is expired or not
    if (data.message === 'Access token expired!') {
      refreshToken()
      return await fetchData(linkApi, body, method)
    }

    //check  message/status
    else {
      //if success
      switch (data.statusCode) {
        case 200: {
          return {
            status: 'success',
            message: data.message,
          }
        }
        case 201: {
          return {
            status: 'created',
            message: data.message,
          }
        }
        case 400:
        case 401:
        case 404:
        case 500:
          return {
            status: 'error',
            message: data.message,
          }
        default:
          return { status: 'unknown', message: 'Unexpected response' }
      }
    }
  } catch (error) {
    console.log('Error in callApi:', error)
    return null
  }
}

//Api calling function
export default callApi
