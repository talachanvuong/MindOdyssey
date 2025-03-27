const timePrefix = (time) => {
  return time.toString().padStart(2, '0')
}

export const timeConvert = (time) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const date = new Date(time)

  return (
    timePrefix(date.getHours()) +
    ':' +
    timePrefix(date.getMinutes()) +
    ':' +
    timePrefix(date.getSeconds()) +
    ' ' +
    daysOfWeek[date.getDay()] +
    ' ' +
    timePrefix(date.getDate()) +
    '/' +
    timePrefix(date.getMonth() + 1) +
    '/' +
    date.getFullYear()
  )
}
