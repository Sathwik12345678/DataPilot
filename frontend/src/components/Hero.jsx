import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import FloatingDashboard from "./FloatingDashboard"

function Hero(){

const navigate=useNavigate()

function splitText(text){
return text.split("").map((c,i)=>(
<span key={i}>{c}</span>
))
}

useEffect(()=>{

const card=document.querySelector(".floating-dashboard")

window.addEventListener("mousemove",e=>{

let x=(window.innerWidth/2-e.clientX)/30
let y=(window.innerHeight/2-e.clientY)/30

card.style.transform=`rotateY(${x}deg) rotateX(${y}deg)`

})

},[])

return(

<section className="hero">

<h1 className="hero-name zoom-text">
{splitText("DataPilot")}
</h1>

<p className="hero-tagline" zoom-text> 
{splitText("Upload datasets and generate insights instantly")}
</p>

<div>

<button
className="btn btn-primary"
onClick={()=>navigate("/signup")}
>
Get Started
</button>

<button
className="btn btn-secondary"
onClick={()=>navigate("/dashboard")}
>
Dashboard
</button>

</div>

<FloatingDashboard/>

</section>

)

}

export default Hero