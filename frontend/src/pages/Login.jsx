import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"
import API from "../api/api"
import { setStoredUser } from "../utils/auth"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter email and password.")
      return
    }

    try {
      setLoading(true)
      const response = await API.post("/login", { email, password })
      if (response?.data?.user) setStoredUser(response.data.user)
      navigate("/dashboard")
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Starfield />
      <Navbar />

      <div className="auth-container">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Login</h2>

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
            autoComplete="current-password"
          />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="auth-error">{error}</p>}

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default Login