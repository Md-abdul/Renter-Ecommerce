import React from "react";
import Chart from "react-apexcharts";

const DashboardCharts = () => {
  const chartOptions = {
    options: {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      }
    },
    series: [
      {
        name: "Products",
        data: [30, 40, 45, 50, 49, 60]
      },
      {
        name: "Users",
        data: [15, 25, 30, 40, 35, 50]
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type="bar"
          width="100%"
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type="area"
          width="100%"
        />
      </div>
    </div>
  );
};

export default DashboardCharts;