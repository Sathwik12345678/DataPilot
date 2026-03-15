import { useEffect } from "react"

function Starfield(){

useEffect(()=>{

const canvas = document.getElementById("starfield")
const ctx = canvas.getContext("2d")

let w = window.innerWidth
let h = window.innerHeight

canvas.width = w
canvas.height = h

const STAR_COUNT = 700
const stars = []

/* create stars */

for(let i=0;i<STAR_COUNT;i++){

stars.push({
x:(Math.random()*2-1)*w,
y:(Math.random()*2-1)*h,
z:Math.random()*w
})

}

const speed = 1.8

function animate(){

ctx.fillStyle="black"
ctx.fillRect(0,0,w,h)

for(let star of stars){

star.z -= speed

if(star.z <= 1){

star.x = (Math.random()*2-1)*w
star.y = (Math.random()*2-1)*h
star.z = w

}

let k = 140 / star.z

let px = star.x * k + w/2
let py = star.y * k + h/2

/* avoid messy center */

if(Math.abs(px-w/2)<20 && Math.abs(py-h/2)<20){
continue
}

let size = (1 - star.z/w) * 2

/* star colors */

const colors = [
"#6ea6ff",
"#a66bff",
"#ff6aa6"
]

ctx.strokeStyle = colors[Math.floor(Math.random()*3)]

ctx.lineWidth = size

ctx.beginPath()
ctx.moveTo(px,py)
ctx.lineTo(px + star.x*0.015, py + star.y*0.015)
ctx.stroke()

}

requestAnimationFrame(animate)

}

animate()

window.addEventListener("resize",()=>{

w = window.innerWidth
h = window.innerHeight

canvas.width = w
canvas.height = h

})

},[])

return(

<canvas
id="starfield"
style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
zIndex:-2
}}
/>

)

}

export default Starfield