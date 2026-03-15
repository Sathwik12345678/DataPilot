function Stats() {
  return (
    <section className="py-20 bg-gray-50 text-center">

      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

        <div>
          <h2 className="text-4xl font-bold text-indigo-600">10K+</h2>
          <p className="text-gray-600">Datasets Analyzed</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-indigo-600">5K+</h2>
          <p className="text-gray-600">Users</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-indigo-600">100+</h2>
          <p className="text-gray-600">Reports Generated</p>
        </div>

      </div>

    </section>
  )
}

export default Stats