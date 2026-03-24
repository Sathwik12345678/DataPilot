import React, { useMemo } from "react";
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
  ResponsiveContainer,
  Scatter,
  ScatterChart
} from "recharts";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AA66CC", "#FF1744", "#00BCD4"];

const Charts = React.memo(({ data, selectedColumn, showPieChart = false }) => {

  if (!data || !data.statistics) return null;

  /* ===============================
     MEMOIZED: PREPARE STATISTICS DATA
     Only recalculate if data.statistics changes
  =============================== */
  const statsData = useMemo(() => {
    return Object.entries(data.statistics || {}).map(([key, value]) => ({
      name: key,
      mean: Number(value.mean || 0),
      min: Number(value.min || 0),
      max: Number(value.max || 0)
    }));
  }, [data.statistics]);

  /* ===============================
     MEMOIZED: FILTER BY COLUMN
  =============================== */
  const filteredData = useMemo(() => {
    if (selectedColumn && selectedColumn !== "") {
      return statsData.filter((item) => item.name === selectedColumn);
    }
    return statsData;
  }, [statsData, selectedColumn]);

  /* ===============================
     MEMOIZED: PIE CHART DATA
  =============================== */
  const pieData = useMemo(() => {
    if (!showPieChart || !data.pie_chart_data) return [];
    return data.pie_chart_data.slice(0, 15);  // Limit to 15 items for clarity
  }, [data.pie_chart_data, showPieChart]);

  /* ===============================
     EMPTY STATE
  =============================== */
  if (!showPieChart && filteredData.length === 0) {
    return (
      <div className="charts-container">
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No numeric columns available for visualization.
        </p>
      </div>
    );
  }

  // When showing pie chart, display only pie
  if (showPieChart) {
    return (
      <div className="charts-container">
        {pieData.length > 0 ? (
          <div className="chart-card" style={{ width: "100%" }}>
            <h2>🥧 Top Values Distribution</h2>
            <p style={{ color: "#888", fontSize: "14px" }}>Showing highest values across numeric columns</p>

            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "8px" }}
                  formatter={(value) => value.toFixed(2)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#999" }}>No data available for pie chart</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="charts-container">

      {/* ================= BAR CHART ================= */}
      <div className="chart-card">
        <h2>📊 Average Values (Bar Chart)</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Mean values across numeric columns</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={filteredData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#ccc" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "8px" }}
              cursor={{ fill: "rgba(100, 150, 255, 0.1)" }}
            />
            <Legend />
            <Bar 
              dataKey="mean" 
              fill="#8884d8" 
              name="Mean Value"
              isAnimationActive={false}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= LINE CHART ================= */}
      <div className="chart-card">
        <h2>📈 Min vs Max Comparison</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Range of values in dataset</p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={filteredData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#ccc" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "8px" }}
              cursor={{ stroke: "#666", strokeWidth: 2 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#00C49F"
              name="Minimum"
              strokeWidth={3}
              isAnimationActive={false}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#FF8042"
              name="Maximum"
              strokeWidth={3}
              isAnimationActive={false}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  // Return true if props are equal (skip re-render)
  return (
    prevProps.data === nextProps.data &&
    prevProps.selectedColumn === nextProps.selectedColumn &&
    prevProps.showPieChart === nextProps.showPieChart
  );
});

Charts.displayName = "Charts";

export default Charts;