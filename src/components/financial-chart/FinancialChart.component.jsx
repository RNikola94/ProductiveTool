import { Bar } from "react-chartjs-2";
import { 
    Chart as ChartJS, 
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';

const data = {
    labels: ['Januray', 'Februray', 'March', 'April'],
    datasets: [
        {
            label: 'Revenue',
            data: [10000, 12000, 15000, 13000],
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Monthly Revenue'
        },
    },
};

const FinancialChart = () => {
    return <Bar data={data} options={options} />;
};

export default FinancialChart;