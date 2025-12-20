import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Loader from '../components/Loader';
import { useToolDetail } from '../hooks/useToolData';
import { trackToolView, trackExternalClick } from '../lib/analytics';
import HeroSection from '../components/ToolDetail/HeroSection';
import QuickStats from '../components/ToolDetail/QuickStats';
import DescriptionSection from '../components/ToolDetail/DescriptionSection';
import FeaturesGrid from '../components/ToolDetail/FeaturesGrid';
import ProsConsSection from '../components/ToolDetail/ProsConsSection';
import TechnicalDetails from '../components/ToolDetail/TechnicalDetails';
import QuickInfoSidebar from '../components/ToolDetail/QuickInfoSidebar';
import CategoriesTags from '../components/ToolDetail/CategoriesTags';
import JobsTasksSidebar from '../components/ToolDetail/JobsTasksSidebar';

export default function ToolDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { tool, loading, error } = useToolDetail(slug);

    useEffect(() => {
        if (tool) {
            trackToolView(tool.id);
        }
    }, [tool]);

    if (loading) return <Loader />;
    if (error || !tool) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Tool Not Found</h1>
                    <p className="text-gray-600 mb-8">{error || 'The tool you are looking for does not exist.'}</p>
                    <a
                        href="/tools"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                    >
                        Browse All Tools
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <HeroSection
                name={tool.name}
                slug={slug}
                tagline={tool.tagline}
                logo_url={tool.logo_url}
                short_description={tool.short_description}
                website={tool.website}
                verified={tool.verified}
                featured={tool.featured}
                trending={tool.trending}
                editors_choice={tool.editors_choice}
                brand_color_primary={tool.brand_color_primary}
            />

            {/* Quick Stats Bar */}
            <QuickStats
                average_rating={tool.average_rating}
                review_count={tool.review_count}
                pricing_type={tool.pricing_type}
                primary_model={tool.primary_model}
                view_count={tool.view_count}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <DescriptionSection
                            description={tool.description}
                            ideal_for={tool.ideal_for}
                        />

                        {/* Key Features */}
                        <FeaturesGrid key_features={tool.key_features} />

                        {/* Pros & Cons */}
                        <ProsConsSection pros={tool.pros} cons={tool.cons} />

                        {/* Use Cases */}
                        {tool.use_cases.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use Cases</h2>
                                <ul className="space-y-3">
                                    {tool.use_cases.map((useCase, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700">{useCase}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Technical Details */}
                        <TechnicalDetails
                            platforms={tool.platforms}
                            models_used={tool.models_used}
                            primary_model={tool.primary_model}
                            integrations={tool.integrations}
                            api_available={tool.api_available}
                            open_source={tool.open_source}
                        />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Info */}
                        <QuickInfoSidebar
                            pricing_type={tool.pricing_type}
                            pricing={tool.pricing}
                            price_range={tool.price_range}
                            free_trial={tool.free_trial}
                            open_source={tool.open_source}
                            company_name={tool.company_name}
                            company_size={tool.company_size}
                            release_year={tool.release_year}
                            website={tool.website}
                            api_docs_url={tool.api_docs_url}
                            repo_url={tool.repo_url}
                            onVisitWebsite={() => trackExternalClick(tool.id, 'tool-detail')}
                        />

                        {/* Categories & Tags */}
                        <CategoriesTags
                            categories={tool.categories}
                            tags={tool.tags}
                        />

                        {/* Browse by Jobs & Tasks */}
                        <JobsTasksSidebar
                            jobs={tool.jobs}
                            tasks={tool.tasks}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
