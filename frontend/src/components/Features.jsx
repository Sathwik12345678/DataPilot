function Features() {
  return (
    <section className="py-24 px-10">

      <h2 className="text-4xl font-bold text-center mb-16">
        Powerful Data Analytics
      </h2>

      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">

        <div className="p-8 rounded-xl shadow hover:shadow-xl transition">
          <h3 className="font-bold text-lg mb-3">
            Automatic Analysis
          </h3>
          <p className="text-gray-600">
            Instantly analyze datasets and generate insights.
          </p>
        </div>

        <div className="p-8 rounded-xl shadow hover:shadow-xl transition">
          <h3 className="font-bold text-lg mb-3">
            Interactive Charts
          </h3>
          <p className="text-gray-600">
            Visualize trends using dynamic charts.
          </p>
        </div>

        <div className="p-8 rounded-xl shadow hover:shadow-xl transition">
          <h3 className="font-bold text-lg mb-3">
            Dataset Comparison
          </h3>
          <p className="text-gray-600">
            Compare multiple datasets easily.
          </p>
        </div>

        <div className="p-8 rounded-xl shadow hover:shadow-xl transition">
          <h3 className="font-bold text-lg mb-3">
            Download Reports
          </h3>
          <p className="text-gray-600">
            Export insights into professional reports.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Features