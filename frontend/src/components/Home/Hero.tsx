import { useNavigate } from 'react-router-dom';

const WHY_FINDMYAI = [
    { icon: '🎯', text: 'Handpicked & Verified — No spam, no dead links' },
    { icon: '⚡', text: 'Smart Matching — Find tools tailored to your needs' },
    { icon: '💰', text: 'Transparent Pricing — Know costs upfront' },
    { icon: '🔄', text: 'Always Fresh — Updated daily with new AI tools' },
];

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative bg-white text-center pt-16 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    Over 3,000+ AI Tools Indexed
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                    Where the World&apos;s Best <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">
                        AI Tools Are Handpicked for You
                    </span>
                </h1>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={() => navigate('/tools')}
                        className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-full font-bold text-lg hover:from-pink-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find a Tool
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => navigate('/quiz')}
                        className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-lg hover:border-pink-300 hover:bg-pink-50 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Help Me Find
                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Quiz</span>
                    </button>
                </div>

                {/* Why FindMyAI Section */}
                <div className="mt-8 mb-4">
                    <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-semibold">
                        Why FindMyAI vs other directories?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {WHY_FINDMYAI.map((item, index) => (
                            <div
                                key={index}
                                className="group bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 hover:bg-white hover:border-pink-200 hover:shadow-md transition-all cursor-default"
                            >
                                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                <p className="text-sm text-gray-600 leading-snug">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
