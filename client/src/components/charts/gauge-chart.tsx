import React, { useEffect, useRef } from 'react';
import { init, type ECharts } from 'echarts';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  categories?: {
    name: string;
    range: [number, number];
    color: string;
  }[];
  className?: string;
}

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  title = "",
  unit = "",
  categories = [],
  className = ""
}: GaugeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = init(chartRef.current);

    const option = {
      series: [
        {
          name: title,
          type: 'gauge',
          min: min,
          max: max,
          splitNumber: 5,
          radius: '80%',
          axisLine: {
            lineStyle: {
              width: 15,
              color: categories.length > 0 
                ? categories.map(cat => [
                    (cat.range[1] - min) / (max - min),
                    cat.color
                  ])
                : [[1, '#3b82f6']]
            }
          },
          pointer: {
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            distance: -15,
            length: 8,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          splitLine: {
            distance: -15,
            length: 15,
            lineStyle: {
              color: '#fff',
              width: 4
            }
          },
          axisLabel: {
            color: 'auto',
            distance: 25,
            fontSize: 12
          },
          detail: {
            valueAnimation: true,
            formatter: `{value}${unit}`,
            color: 'auto',
            fontSize: 20,
            fontWeight: 'bold',
            offsetCenter: [0, '70%']
          },
          data: [
            {
              value: value,
              name: title
            }
          ],
          title: {
            offsetCenter: [0, '-20%'],
            fontSize: 14,
            color: '#64748b'
          }
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
  }, [value, min, max, title, unit, categories]);

  // Update chart when value changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{
          data: [{ value: value, name: title }]
        }]
      });
    }
  }, [value, title]);

  return (
    <div 
      ref={chartRef} 
      className={`w-full h-64 ${className}`}
      data-testid="gauge-chart"
    />
  );
}