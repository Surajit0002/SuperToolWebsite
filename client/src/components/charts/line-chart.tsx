import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface LineChartData {
  name: string | number;
  [key: string]: any;
}

interface LineChartProps {
  data: LineChartData[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  type?: 'line' | 'area';
  valueFormatter?: (value: number) => string;
  className?: string;
}

export default function LineChart({
  data,
  lines,
  title = "",
  xLabel = "",
  yLabel = "",
  height = 300,
  type = 'line',
  valueFormatter = (value) => value.toLocaleString(),
  className = ""
}: LineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${xLabel}: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {valueFormatter(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'area' ? AreaChart : RechartsLineChart;

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
            tickFormatter={valueFormatter}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.map((line, index) => (
            type === 'area' ? (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stackId="1"
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.6}
              />
            ) : (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}