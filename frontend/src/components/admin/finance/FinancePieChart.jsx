import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";

const FinancePieChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        />

        <Tooltip />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FinancePieChart;
