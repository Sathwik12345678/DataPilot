function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-sm">
      
      <h1 className="text-2xl font-bold text-indigo-600">
        DataPilot
      </h1>

      <div className="space-x-8 font-medium">
        <a className="hover:text-indigo-600">Features</a>
        <a className="hover:text-indigo-600">How it Works</a>
        <a className="hover:text-indigo-600">Login</a>
      </div>

      <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
        Get Started
      </button>

    </nav>
  )
}

export default Navbar