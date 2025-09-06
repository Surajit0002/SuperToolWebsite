import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  showLegend?: boolean;
  className?: string;
}

export default function PieChart({
  data,
  title = "",
  showLegend = true,
  className = ""
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      title: {
        text: title,
        left: 'center',
        top: '5%',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#374151'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: showLegend ? {
        orient: 'horizontal',
        bottom: '10%',
        data: data.map(item => item.name)
      } : undefined,
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', showLegend ? '45%' : '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
            }
          }))
        }
      ]
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data, title, showLegend]);

  return (
    <div 
      ref={chartRef} 
      className={`w-full h-80 ${className}`}
      data-testid="pie-chart"
    />
  );
}