const setCookie = (res, cookieName, value, maxAge) => {
  res.cookie(cookieName, value, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
    maxAge,
  })
}

const clearCookie = (res, cookieName) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: false,
    path: '/',
    sameSite: 'Strict',
  })
}

export default {
  setCookie,
  clearCookie,
}
