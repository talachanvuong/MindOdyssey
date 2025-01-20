import '../../../style.css'

document.addEventListener("DOMContentLoaded",()=>{
    const elements = document.querySelectorAll(".opacity-0");
    elements.forEach(el=>{
        setTimeout(()=>{
            el.classList.remove("opacity-0","translate-y-12");
            el.classList.add("opacity-100","duration-1000");
        },200
        )
        
    })
})