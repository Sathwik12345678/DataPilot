import { Link } from "react-router-dom"

function Navbar(){

return(

<nav className="navbar">

<div className="nav-container">

<Link to="/" className="logo">
DataPilot
</Link>

<ul className="nav-menu">

<li>
<Link to="/" className="nav-link">Home</Link>
</li>

<li>
<Link to="/dashboard" className="nav-link">Dashboard</Link>
</li>

<li>
<Link to="/login" className="nav-link">Login</Link>
</li>

<li>
<Link to="/signup" className="nav-link nav-link-cta">
Get Started
</Link>
</li>

</ul>

</div>

</nav>

)

}

export default Navbar