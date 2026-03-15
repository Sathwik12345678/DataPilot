import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"

function Login(){

return(

<>
<Starfield/>
<Navbar/>

<div className="auth-container">

<div className="auth-card">

<h2>Login</h2>

<input placeholder="Email"/>

<input type="password" placeholder="Password"/>

<button className="btn-primary">Login</button>

</div>

</div>

</>

)

}

export default Login