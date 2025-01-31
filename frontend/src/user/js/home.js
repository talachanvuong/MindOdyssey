import '../../style.css';
document.addEventListener("DOMContentLoaded", () =>{
    const elements = document.querySelectorAll(".opacity-0");
    elements.forEach((el,index) =>  {
        setTimeout(() => {
            el.classList.add("opacity-100");
            el.classList.add("duration-1000");
        },0);
    })
})