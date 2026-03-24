import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AA66CC"];

const Charts = ({ data, selectedColumn }) => {

  if (!data || !data.statistics) return null;

  /* ===============================
     PREPARE STATISTICS DATA
  =============================== */
  const statsData = Object.entries(data.statistics).map(([key, value]) => ({
    name: key,
    mean: Number(value.mean),
    min: Number(value.min),
    max: Number(value.max)
  }));

  /* ===============================
     FILTER BY COLUMN
  =============================== */
  const filteredData =
    selectedColumn && selectedColumn !== ""
      ? statsData.filter((item) => item.name === selectedColumn)
      : statsData;

  /* ===============================
     PIE CHART DATA
  =============================== */
  let pieData = [];

  if (data.top_values) {
    pieData = Object.entries(data.top_values).flatMap(([col, values]) =>
      values.map((v, i) => ({
        name: `${col} ${i + 1}`,
        value: Number(v)
      }))
    );
  }

  /* ===============================
     EMPTY STATE
  =============================== */
  if (filteredData.length === 0) {
    return (
      <div className="charts-container">
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No numeric columns available for visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="charts-container">

      {/* ================= BAR CHART ================= */}
      <div className="chart-card">
        <h2>Average Values (Bar Chart)</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="mean" fill="#8884d8" name="Mean Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= LINE CHART ================= */}
      <div className="chart-card">
        <h2>Min vs Max Comparison</h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#00C49F"
              name="Minimum"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#FF8042"
              name="Maximum"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= PIE CHART ================= */}
      {pieData.length > 0 && (
        <div className="chart-card">
          <h2>Top Value Distribution</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default Charts;