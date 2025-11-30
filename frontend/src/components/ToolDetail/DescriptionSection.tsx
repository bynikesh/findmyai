interface DescriptionSectionProps {
    description: string;
    ideal_for?: string;
}

export default function DescriptionSection({ description, ideal_for }: DescriptionSectionProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <div className="prose prose-indigo max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {description}
                </p>
            </div>

            {ideal_for && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-semibold text-gray-900 mb-2">Ideal For</h3>
                    <p className="text-gray-700">{ideal_for}</p>
                </div>
            )}
        </div>
    );
}
