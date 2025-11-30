// ---------------------------------------------------------------
// PieChart.tsx – reusable pie chart component using Chart.js
// ---------------------------------------------------------------
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    /** Labels for each slice (e.g. category names) */
    labels: string[];
    /** Corresponding values */
    values: number[];
    /** Optional title */
    title?: string;
}

export default function PieChart({ labels, values, title }: Props) {
    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    'rgba(236,72,153,0.6)', // pink
                    'rgba(59,130,246,0.6)', // blue
                    'rgba(34,197,94,0.6)', // green
                    'rgba(255,165,0,0.6)', // orange
                    'rgba(147,197,253,0.6)', // light blue
                    'rgba(244,114,182,0.6)', // purple
                ],
                borderColor: 'rgba(255,255,255,1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' as const },
            title: { display: !!title, text: title },
        },
    };

    return <Pie data={data} options={options as any} />;
}
