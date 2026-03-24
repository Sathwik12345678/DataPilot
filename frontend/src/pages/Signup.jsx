import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"
import API from "../api/api"

function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!name || !email || !password) {
      setError("Please fill all fields.")
      return
    }

    try {
      setLoading(true)
      await API.post("/signup", { name, email, password })
      navigate("/login")
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return(

<>
  <Starfield />
  <Navbar />

  <div className="auth-container">
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        inputMode="email"
        autoComplete="email"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      {error && <p className="auth-error">{error}</p>}

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login" className="auth-link">
          Login
        </Link>
      </p>
    </form>
  </div>
</>

)

}

export default Signup