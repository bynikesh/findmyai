import { ReactNode } from 'react';

interface WizardStepProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    onBack?: () => void;
    onNext?: () => void;
    nextLabel?: string;
    backLabel?: string;
    canProceed?: boolean;
    isFirstStep?: boolean;
    isLastStep?: boolean;
}

export default function WizardStep({
    children,
    title,
    subtitle,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    canProceed = true,
    isFirstStep = false,
    isLastStep = false,
}: WizardStepProps) {
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                        {Math.round(progress)}% complete
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-violet-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Title */}
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-gray-600 text-lg">{subtitle}</p>
                )}
            </div>

            {/* Step Content */}
            <div className="mb-8">
                {children}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                {!isFirstStep ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {backLabel}
                    </button>
                ) : (
                    <div />
                )}

                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-all transform ${canProceed
                            ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700 hover:scale-105 shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isLastStep ? 'See My Recommendations' : nextLabel}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
