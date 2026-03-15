import { motion } from "framer-motion"

function DashboardPreview() {
  return (
    <section className="py-24 flex justify-center bg-gray-50">

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="shadow-2xl rounded-xl p-8 bg-white w-3/4"
      >

        <h2 className="text-2xl font-bold mb-4">
          Analytics Dashboard
        </h2>

        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>

      </motion.div>

    </section>
  )
}

export default DashboardPreview