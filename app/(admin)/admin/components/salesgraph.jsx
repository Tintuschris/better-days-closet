import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesGraph({ salesData }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Revenue Over Time',
      },
    },
    scales: {
      x: {
        type: 'category',
      },
      y: {
        type: 'linear',
      },
    },
  };

  const data = {
    labels: salesData.map((entry) => entry.date),
    datasets: [
      {
        label: 'Sales Revenue',
        data: salesData.map((entry) => entry.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Line options={options} data={data} />;
}