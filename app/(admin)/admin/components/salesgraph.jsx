"use client";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SalesGraph({ data, type = 'line', className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const primaryColor = '#8B5CF6'; // primarycolor
  const secondaryColor = '#A78BFA'; // lighter variant

  const chartData = {
    labels: data?.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Daily Sales',
        data: data?.map(item => item.amount) || [],
        borderColor: primaryColor,
        backgroundColor: type === 'line' ? `${primaryColor}20` : primaryColor,
        fill: type === 'line',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: primaryColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: primaryColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(data[context[0].dataIndex].date);
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: (context) => `Sales: Ksh. ${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500',
          },
          maxTicksLimit: 8,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500',
          },
          callback: (value) => `Ksh. ${value.toLocaleString()}`,
          maxTicksLimit: 6,
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500',
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: primaryColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.label}: Ksh. ${context.parsed.toLocaleString()}`
        }
      }
    },
    cutout: '60%',
  };

  const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;
  const chartOptions = type === 'doughnut' ? doughnutOptions : options;

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <ChartComponent data={chartData} options={chartOptions} />
    </div>
  );
}
