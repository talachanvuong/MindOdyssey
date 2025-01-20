import '../../../style.css'

document.addEventListener("DOMContentLoaded",()=>{
    const elements = document.querySelectorAll('.opacity-0');
    elements.forEach(ele=>{
        setTimeout(()=>{
            ele.classList.remove('opacity-0','-translate-y-12');
            ele.classList.add('opacity-100','translate-y-0','duration-1000');
        },200)
    }

    )

})
