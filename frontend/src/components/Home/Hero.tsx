import { useNavigate } from 'react-router-dom';

const POPULAR_TAGS = ['Writing', 'Image Generator', 'Video', 'Code Assistant', 'Marketing'];

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-gray-900 text-white min-h-[600px] flex items-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900 z-10" />

                {/* Animated Glowing Orbs/Grid - CSS only simulation of "AI Workflows" */}
                {/* We use a complex repeating gradient to simulate a grid and some absolute positioned elements for "nodes" */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse-slow" />
                    <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse-slow delay-1000" />
                    <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-600/20 blur-[100px] animate-pulse-slow delay-2000" />
                </div>

                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-20">
                {/* Badge/Pill */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up hover:bg-white/20 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-gray-100">Over 3,000+ AI Tools Indexed</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 font-display">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                        AI Workflows
                    </span>
                    <span className="block text-white mt-2">
                        supercharge your productivity
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed relative">
                    Discover, compare, and integrate the world's most powerful AI tools. <br className="hidden sm:block" />
                    From coding assistants to image generators, find exactly what you need.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <button
                        onClick={() => navigate('/tools')}
                        className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Explore Tools
                    </button>
                    <button
                        onClick={() => navigate('/submit')}
                        className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        Submit Tool
                    </button>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 text-sm text-gray-400">
                    <span className="uppercase tracking-wider text-xs font-semibold mr-2">Trending:</span>
                    {POPULAR_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => navigate(`/tools?search=${encodeURIComponent(tag)}`)}
                            className="bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-blue-600/10 text-gray-300 hover:text-blue-300 px-4 py-1.5 rounded-full transition-all backdrop-blur-md"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
