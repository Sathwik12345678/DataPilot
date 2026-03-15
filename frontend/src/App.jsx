import { useState } from "react"
import Intro from "./pages/Intro"
import Landing from "./pages/Landing"

function App() {
  const [started, setStarted] = useState(false)

  return started ? (
    <Landing />
  ) : (
    <Intro onStart={() => setStarted(true)} />
  )
}

export default App