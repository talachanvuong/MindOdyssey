
const appear = {
  fade_in(id, duration, time) {
    const element = document.getElementById(id)
    setTimeout(() => {
      element.classList.add('duration-' + duration)
      element.classList.remove('invisible', 'scale-90')
    }, time)
  },
  move_down(id, duration, time){
    const element = document.getElementById(id)
    setTimeout(()=>{
      element.classList.add(`duration-${duration}`,'translate-y-4')
      element.classList.remove('invisible','-translate-y-4','opacity-0')
    },time)
  }
}
const assignAfterLoading = {
  duration_assign(id, duration) {
    const element = document.getElementById(id)
    setTimeout(() => {
      element.classList.add('duration-'+duration)
    }, 0)
  },
}



export default { appear, assignAfterLoading }
