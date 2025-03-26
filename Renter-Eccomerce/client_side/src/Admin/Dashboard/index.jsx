import React from "react";
import DashboardWidgets from "./DashboardWidgets";
import DashboardCharts from "./DashboardCharts";

const DashboardContent = () => {
  return (
    <div>
      <DashboardWidgets />
      <DashboardCharts />
    </div>
  );
};

export default DashboardContent;
