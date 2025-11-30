import {
    SparklesIcon,
    CheckCircleIcon,
    LightBulbIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface FeaturesGridProps {
    key_features: string[];
}

const featureIcons = [
    SparklesIcon,
    CheckCircleIcon,
    LightBulbIcon,
    RocketLaunchIcon,
];

export default function FeaturesGrid({ key_features }: FeaturesGridProps) {
    if (!key_features || key_features.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {key_features.map((feature, index) => {
                    const Icon = featureIcons[index % featureIcons.length];
                    return (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <Icon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <p className="text-gray-700 font-medium">{feature}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
