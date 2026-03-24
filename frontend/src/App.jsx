import { Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"

import Cursor from "./components/Cursor"

function App() {

  return (
    <>
      <Cursor />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>
    </>
  )
}

export default App