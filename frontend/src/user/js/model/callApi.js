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
    console.log('Error in fetchData:', error)
    return null // Trả về null nếu fetch thất bại
  }
}

const callApi = async (linkApi, body = null, method) => {
  try {
    let data = await fetchData(linkApi, body, method)

    if (!data) {
      return { status: 'error', message: 'Fetch failed' }
    }
    // Nếu token hết hạn, thử refresh rồi gọi lại API
    if (
      data.message === 'Access token expired!' ||
      data.message === 'Access token is required'
    ) {
      const refreshed = await refreshToken()
      if (refreshed) {
        data = await fetchData(linkApi, body, method)
      } else {
        return { status: 'error', message: 'Token refresh failed' }
      }
    }

    // Kiểm tra response code và trả về thông tin tương ứng
    switch (data.statusCode) {
      case 200:
        return { status: 'success', message: data.message, data: data.result }
      case 201:
        return { status: 'created', message: data.message, data: data.result }
      case 400:
      case 401:
      case 404:
      case 500:
        return { status: 'error', message: data.message }
      default:
        return { status: 'unknown', message: 'Unexpected response' }
    }
  } catch (error) {
    console.log('Error in callApi:', error)
    return { status: 'error', message: 'Internal error' }
  }
}

const checkAttachmentType = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('Content-Type')
    if (contentType.startsWith('audio/')) {
      return "audio"
    } else if (contentType.startsWith('image/')) {
      return "image"
    } else {
      return "error"
    }
  } catch (error) {
    console.error('Error during checking:', error)
  }
}

export default { callApi, refreshToken, checkAttachmentType }
