import { useEffect } from "react"

function Cursor(){

useEffect(()=>{

const cursor=document.querySelector(".cursor")
const dot=document.querySelector(".cursor-dot")
const outline=document.querySelector(".cursor-outline")

window.addEventListener("mousemove",e=>{

const x=e.clientX
const y=e.clientY

dot.style.left=x+"px"
dot.style.top=y+"px"

outline.style.left=x+"px"
outline.style.top=y+"px"

})

document.querySelectorAll("h1,h2,p,a,button").forEach(el=>{

el.addEventListener("mouseenter",()=>{
cursor.classList.add("hovering")
})

el.addEventListener("mouseleave",()=>{
cursor.classList.remove("hovering")
})

})

},[])

return(

<div className="cursor">

<div className="cursor-dot"></div>

<div className="cursor-outline"></div>

</div>

)

}

export default Cursor