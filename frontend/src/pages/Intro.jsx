import { motion } from "framer-motion"

function Intro({ onStart }) {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-600 to-purple-700 text-white">

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-6xl font-bold mb-8"
      >
        DataPilot
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-10 text-xl"
      >
        Smart Data Analytics Platform
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold"
      >
        Get Started
      </motion.button>

    </div>
  )
}

export default Intro