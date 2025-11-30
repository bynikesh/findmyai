// ---------------------------------------------------------------
// BarChart.tsx – reusable Bar chart component using Chart.js
// ---------------------------------------------------------------
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    /** Labels for the X‑axis (e.g. tool names) */
    labels: string[];
    /** Data values for each label */
    values: number[];
    /** Optional chart title */
    title?: string;
}

export default function BarChart({ labels, values, title }: Props) {
    const data = {
        labels,
        datasets: [
            {
                label: title ?? 'Views',
                data: values,
                backgroundColor: 'rgba(236,72,153,0.6)', // pink‑500 with opacity
                borderColor: 'rgba(236,72,153,1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: !!title, text: title },
        },
        scales: {
            x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
        },
    };

    return <Bar data={data} options={options as any} />;
}
