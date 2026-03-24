import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Starfield from "../components/Starfield"
import { useEffect } from "react"

function Landing() {

  useEffect(() => {
    document.body.classList.add("landing")
    return () => document.body.classList.remove("landing")
  }, [])

return(

<div className="landing-page">
<Starfield />
<Navbar />
<Hero />
</div>

)

}

export default Landing