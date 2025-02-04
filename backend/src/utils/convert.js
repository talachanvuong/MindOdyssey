const timePrefix = (time) => {
  return time.toString().padStart(2, '0')
}

export const timeConvert = (time) => {
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
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
