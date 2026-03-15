import { useState, useEffect } from "react"

function ThemeToggle() {

  const [theme, setTheme] = useState("light")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      🌙
    </button>
  )
}

export default ThemeToggle