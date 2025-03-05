const fetchApi = async (linkApi, body = null, method) => {
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
      result: data.result,
    }
  } catch (error) {
    console.log('Error in fetch data:', error)
    return null
  }
}

const callApi = async (linkApi, body = null, method) => {
  try {
    let data = await fetchApi(linkApi, body, method)
    if (data.statusCode == 401) {
      alert("Login session has expired! Please login again")
      window.location.href="login.html"
    }
    if (!data) {
        return {
          status: 'error',
          message: 'fetch api failed, Null response',
        }
    } else {
      if (data.statusCode == 200 || data.statusCode == 200) {
        return {
          status: 'success',
          message: data.message,
          result: data.result,
        }
      } else {
        return {
          status: 'error',
          message: data.message,
          result: data.result,
        }
      }
    }
  } catch (error) {
    console.log('Error in callApi:', error)
    return { status: 'error', message: 'Internal error' }
  }
}

export default { callApi }
