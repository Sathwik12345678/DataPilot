import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"

function Signup(){

return(

<>
<Starfield/>
<Navbar/>

<div className="auth-container">

<div className="auth-card">

<h2>Create Account</h2>

<input placeholder="Full Name"/>

<input placeholder="Email"/>

<input type="password" placeholder="Password"/>

<button className="btn-primary">
Create Account
</button>

</div>

</div>

</>

)

}

export default Signup