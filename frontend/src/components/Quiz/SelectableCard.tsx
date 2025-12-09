interface SelectableCardProps {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    selected: boolean;
    onToggle: (id: string) => void;
    multiSelect?: boolean;
}

export default function SelectableCard({
    id,
    label,
    icon,
    description,
    selected,
    onToggle,
    multiSelect = true,
}: SelectableCardProps) {
    return (
        <button
            onClick={() => onToggle(id)}
            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selected
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
        >
            {/* Selection Indicator */}
            <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected
                    ? 'border-pink-500 bg-pink-500'
                    : 'border-gray-300 bg-white'
                }`}>
                {selected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>

            <div className="flex items-start gap-3 pr-8">
                {icon && (
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                )}
                <div>
                    <span className={`block font-semibold ${selected ? 'text-pink-700' : 'text-gray-900'}`}>
                        {label}
                    </span>
                    {description && (
                        <span className="block text-sm text-gray-500 mt-1">{description}</span>
                    )}
                </div>
            </div>

            {/* Multi-select hint */}
            {multiSelect && (
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {selected ? 'Click to remove' : 'Click to select'}
                </span>
            )}
        </button>
    );
}
