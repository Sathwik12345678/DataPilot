import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { clearStoredUser, getStoredUser } from "../utils/auth"

function Navbar(){
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    function onStorage() {
      setUser(getStoredUser())
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  function handleLogout() {
    clearStoredUser()
    setUser(null)
    navigate("/")
  }

return(

<nav className="navbar">

<div className="nav-container">

<span className="logo-text">DataPilot</span>

<ul className="nav-menu">

<li>
<Link to="/" className="nav-link">Home</Link>
</li>

<li>
<Link to="/dashboard" className="nav-link">Dashboard</Link>
</li>

{user ? (
  <>
    <li>
      <Link to="/profile" className="nav-link">
        👤 Profile
      </Link>
    </li>
    <li>
      <button
        type="button"
        className="nav-link nav-logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </li>
  </>
) : (
  <>
    <li>
      <Link to="/login" className="nav-link">
        Login
      </Link>
    </li>

    <li>
      <Link to="/signup" className="nav-link nav-link-cta">
        Get Started
      </Link>
    </li>
  </>
)}

</ul>

</div>

</nav>

)

}

export default Navbar