import { motion } from "framer-motion"

function Hero() {
  return (
    <section className="relative text-center py-32 bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-72 h-72 bg-white opacity-10 rounded-full top-10 left-10"
      />

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-96 h-96 bg-white opacity-10 rounded-full bottom-10 right-10"
      />

      <h1 className="text-6xl font-bold mb-6 relative z-10">
        Understand Your Data Instantly
      </h1>

      <p className="text-xl mb-10 max-w-2xl mx-auto relative z-10">
        Upload datasets and generate insights, charts and reports automatically.
      </p>

      <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 relative z-10">
        Upload Dataset
      </button>

    </section>
  )
}

export default Hero