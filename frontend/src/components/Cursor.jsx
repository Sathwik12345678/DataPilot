import { useEffect } from "react"

function Cursor(){

useEffect(()=>{

const dot = document.querySelector(".cursor-dot")
const outline = document.querySelector(".cursor-outline")

let mouseX = 0
let mouseY = 0

let outlineX = 0
let outlineY = 0

/* track mouse instantly */
document.addEventListener("mousemove",(e)=>{
mouseX = e.clientX
mouseY = e.clientY

dot.style.left = mouseX + "px"
dot.style.top = mouseY + "px"
})

/* smooth follow for outline */
function animate(){

outlineX += (mouseX - outlineX) * 0.15
outlineY += (mouseY - outlineY) * 0.15

outline.style.left = outlineX + "px"
outline.style.top = outlineY + "px"

requestAnimationFrame(animate)

}

animate()

/* hover effect */

const hoverElements = document.querySelectorAll(
"a, button, .zoom-text span"
)

hoverElements.forEach(el=>{

el.addEventListener("mouseenter",()=>{
outline.style.transform = "translate(-50%, -50%) scale(2)"
dot.style.transform = "translate(-50%, -50%) scale(2.5)"
})

el.addEventListener("mouseleave",()=>{
outline.style.transform = "translate(-50%, -50%) scale(1)"
dot.style.transform = "translate(-50%, -50%) scale(1)"
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