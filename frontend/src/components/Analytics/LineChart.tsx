// ---------------------------------------------------------------
// LineChart.tsx – reusable line chart component using Chart.js
// ---------------------------------------------------------------
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

interface Dataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
}

interface Props {
    /** X‑axis labels – usually dates */
    labels: string[];
    /** One or more datasets */
    datasets: Dataset[];
    /** Optional chart title */
    title?: string;
}

export default function LineChart({ labels, datasets, title }: Props) {
    const data = {
        labels,
        datasets: datasets.map(ds => ({
            ...ds,
            fill: false,
            tension: 0.2,
        })),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: !!title, text: title },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return <Line data={data} options={options as any} />;
}
