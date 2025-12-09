import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardStep from '../components/Quiz/WizardStep';
import SelectableCard from '../components/Quiz/SelectableCard';
import WizardResults from '../components/Quiz/WizardResults';
import {
    WizardAnswer,
    ToolMatch,
    ROLES,
    TASK_CATEGORIES,
    BUDGET_OPTIONS,
    SKILL_LEVELS,
    scoreTools,
} from '../lib/wizardConfig';
import { apiUrl } from '../lib/constants';

const TOTAL_STEPS = 5;

export default function Quiz() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<WizardAnswer>({
        roles: [],
        tasks: [],
        budget: '',
        skillLevel: '',
    });
    const [allTools, setAllTools] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<ToolMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Fetch all tools on mount
    useEffect(() => {
        const fetchTools = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/tools?perPage=500`);
                if (response.ok) {
                    const data = await response.json();
                    setAllTools(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch tools:', error);
            }
        };
        fetchTools();
    }, []);

    const handleRoleToggle = (roleId: string) => {
        setAnswers(prev => ({
            ...prev,
            roles: prev.roles.includes(roleId)
                ? prev.roles.filter(r => r !== roleId)
                : [...prev.roles, roleId],
        }));
    };

    const handleTaskToggle = (taskId: string) => {
        setAnswers(prev => ({
            ...prev,
            tasks: prev.tasks.includes(taskId)
                ? prev.tasks.filter(t => t !== taskId)
                : [...prev.tasks, taskId],
        }));
    };

    const handleBudgetSelect = (budgetId: string) => {
        setAnswers(prev => ({ ...prev, budget: budgetId }));
    };

    const handleSkillSelect = (skillId: string) => {
        setAnswers(prev => ({ ...prev, skillLevel: skillId }));
    };

    const handleNext = () => {
        if (currentStep === TOTAL_STEPS - 1) {
            // Calculate recommendations
            setLoading(true);
            setTimeout(() => {
                const scored = scoreTools(allTools, answers);
                setRecommendations(scored);
                setShowResults(true);
                setLoading(false);
            }, 1000); // Simulate processing
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleStartOver = () => {
        setAnswers({ roles: [], tasks: [], budget: '', skillLevel: '' });
        setCurrentStep(0);
        setShowResults(false);
        setRecommendations([]);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true; // Welcome step
            case 1: return answers.roles.length > 0;
            case 2: return answers.tasks.length > 0;
            case 3: return answers.budget !== '';
            case 4: return answers.skillLevel !== '';
            default: return true;
        }
    };

    // Welcome Screen
    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-2xl">
                    {/* Animated Icon */}
                    <div className="mb-8 relative">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-pink-500/30 animate-pulse">
                            <span className="text-5xl">🎯</span>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Let&apos;s Find the Perfect
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">
                            AI Tool for You
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Answer a few quick questions and we&apos;ll recommend the best AI tools
                        tailored to your needs, budget, and experience level.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <div className="flex items-center gap-2 text-gray-500">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Takes ~1 minute</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Personalized results</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>100% free</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-lg rounded-full hover:from-pink-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-xl shadow-pink-500/30"
                    >
                        Get Started
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>

                    <button
                        onClick={() => navigate('/tools')}
                        className="block mx-auto mt-4 text-gray-500 hover:text-gray-700 text-sm"
                    >
                        or browse all tools →
                    </button>
                </div>
            </div>
        );
    }

    // Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Preferences</h2>
                    <p className="text-gray-600">Finding the perfect tools for you...</p>
                </div>
            </div>
        );
    }

    // Results Screen
    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
                <WizardResults
                    tools={recommendations}
                    answers={answers}
                    onStartOver={handleStartOver}
                />
            </div>
        );
    }

    // Wizard Steps
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
                <WizardStep
                    title="What best describes you?"
                    subtitle="Select all that apply"
                    currentStep={1}
                    totalSteps={TOTAL_STEPS - 1}
                    onBack={handleBack}
                    onNext={handleNext}
                    canProceed={canProceed()}
                    isFirstStep
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {ROLES.map((role) => (
                            <SelectableCard
                                key={role.id}
                                id={role.id}
                                label={role.label}
                                icon={role.icon}
                                selected={answers.roles.includes(role.id)}
                                onToggle={handleRoleToggle}
                            />
                        ))}
                    </div>
                </WizardStep>
            )}

            {/* Step 2: Task Selection */}
            {currentStep === 2 && (
                <WizardStep
                    title="What do you want to accomplish?"
                    subtitle="Select the tasks you need help with"
                    currentStep={2}
                    totalSteps={TOTAL_STEPS - 1}
                    onBack={handleBack}
                    onNext={handleNext}
                    canProceed={canProceed()}
                >
                    <div className="space-y-6">
                        {TASK_CATEGORIES.map((category) => (
                            <div key={category.id}>
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                    <span>{category.icon}</span>
                                    {category.label}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {category.tasks.map((task) => (
                                        <SelectableCard
                                            key={task.id}
                                            id={task.id}
                                            label={task.label}
                                            selected={answers.tasks.includes(task.id)}
                                            onToggle={handleTaskToggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </WizardStep>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
                <WizardStep
                    title="What's your budget?"
                    subtitle="Select your monthly spending limit"
                    currentStep={3}
                    totalSteps={TOTAL_STEPS - 1}
                    onBack={handleBack}
                    onNext={handleNext}
                    canProceed={canProceed()}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {BUDGET_OPTIONS.map((option) => (
                            <SelectableCard
                                key={option.id}
                                id={option.id}
                                label={option.label}
                                icon={option.icon}
                                description={option.description}
                                selected={answers.budget === option.id}
                                onToggle={handleBudgetSelect}
                                multiSelect={false}
                            />
                        ))}
                    </div>
                </WizardStep>
            )}

            {/* Step 4: Skill Level */}
            {currentStep === 4 && (
                <WizardStep
                    title="How tech-savvy are you?"
                    subtitle="This helps us recommend tools that match your comfort level"
                    currentStep={4}
                    totalSteps={TOTAL_STEPS - 1}
                    onBack={handleBack}
                    onNext={handleNext}
                    canProceed={canProceed()}
                    isLastStep
                >
                    <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
                        {SKILL_LEVELS.map((level) => (
                            <SelectableCard
                                key={level.id}
                                id={level.id}
                                label={level.label}
                                icon={level.icon}
                                description={level.description}
                                selected={answers.skillLevel === level.id}
                                onToggle={handleSkillSelect}
                                multiSelect={false}
                            />
                        ))}
                    </div>
                </WizardStep>
            )}
        </div>
    );
}
