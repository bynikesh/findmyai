import { Link } from 'react-router-dom';
import { ToolMatch, WizardAnswer, ROLES, TASK_CATEGORIES, BUDGET_OPTIONS, SKILL_LEVELS } from '../../lib/wizardConfig';

interface ResultsCardProps {
    tool: ToolMatch;
    rank: number;
}

function ResultsCard({ tool, rank }: ResultsCardProps) {
    const badgeColors: Record<string, string> = {
        'Best Value': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Easiest to Use': 'bg-blue-100 text-blue-700 border-blue-200',
        'Best Free Option': 'bg-green-100 text-green-700 border-green-200',
        'Most Powerful': 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                    {rank}
                </div>

                {/* Logo */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
                    {tool.logo_url ? (
                        <img
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&size=56`;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {tool.name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                        {tool.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                ✓ Verified
                            </span>
                        )}
                    </div>

                    {/* Badges */}
                    {tool.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tool.badges.map((badge) => (
                                <span
                                    key={badge}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[badge] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {tool.short_description || tool.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tool.categories.slice(0, 2).map((cat) => (
                            <span
                                key={cat.slug}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                                {cat.name}
                            </span>
                        ))}
                        {tool.pricing && (
                            <span className="px-2 py-0.5 bg-pink-50 text-pink-600 text-xs rounded-full font-medium">
                                {tool.pricing}
                            </span>
                        )}
                    </div>

                    {/* Match Score & CTA */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-pink-500 to-violet-600 rounded-full"
                                    style={{ width: `${tool.score}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{tool.score}% match</span>
                        </div>

                        <Link
                            to={`/tools/${tool.slug}`}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            View Tool
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface WizardResultsProps {
    tools: ToolMatch[];
    answers: WizardAnswer;
    onStartOver: () => void;
}

export default function WizardResults({ tools, answers, onStartOver }: WizardResultsProps) {
    // Get readable labels for answers
    const getRoleLabels = () => answers.roles.map(r => ROLES.find(role => role.id === r)?.label || r);
    const getTaskLabels = () => {
        return answers.tasks.map(t => {
            for (const cat of TASK_CATEGORIES) {
                const task = cat.tasks.find(task => task.id === t);
                if (task) return task.label;
            }
            return t;
        });
    };
    const getBudgetLabel = () => BUDGET_OPTIONS.find(b => b.id === answers.budget)?.label || answers.budget;
    const getSkillLabel = () => SKILL_LEVELS.find(s => s.id === answers.skillLevel)?.label || answers.skillLevel;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analysis Complete
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Your Top AI Tool Recommendations
                </h1>
                <p className="text-gray-600 text-lg">
                    Based on your preferences, here are the best matches
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-pink-50 to-violet-50 rounded-2xl border border-pink-100 p-6 mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Role:</span>
                        <span className="ml-2 text-gray-600">{getRoleLabels().join(', ') || 'Not specified'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Budget:</span>
                        <span className="ml-2 text-gray-600">{getBudgetLabel()}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Tasks:</span>
                        <span className="ml-2 text-gray-600">{getTaskLabels().slice(0, 3).join(', ')}{getTaskLabels().length > 3 ? ` +${getTaskLabels().length - 3} more` : ''}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Experience:</span>
                        <span className="ml-2 text-gray-600">{getSkillLabel()}</span>
                    </div>
                </div>
            </div>

            {/* Results */}
            {tools.length > 0 ? (
                <div className="space-y-4 mb-8">
                    {tools.map((tool, index) => (
                        <ResultsCard key={tool.id} tool={tool} rank={index + 1} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 mb-8">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Perfect Matches Found</h3>
                    <p className="text-gray-600 mb-4">
                        We couldn&apos;t find tools matching all your criteria. Try adjusting your preferences.
                    </p>
                    <button
                        onClick={onStartOver}
                        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onStartOver}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                    Start Over
                </button>
                <Link
                    to="/tools"
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-violet-700 transition-colors text-center"
                >
                    Explore All Tools
                </Link>
            </div>
        </div>
    );
}
