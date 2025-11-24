import React from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useToolDetail } from '../hooks/useToolData';
import HeroSection from '../components/ToolDetail/HeroSection';
import DescriptionSection from '../components/ToolDetail/DescriptionSection';
import ProsConsSection from '../components/ToolDetail/ProsConsSection';
import UseCasesSection from '../components/ToolDetail/UseCasesSection';
import PricingTable from '../components/ToolDetail/PricingTable';
import GalleryCarousel from '../components/ToolDetail/GalleryCarousel';
import AlternativesSection from '../components/ToolDetail/AlternativesSection';
import CompareButton from '../components/ToolDetail/CompareButton';
import FAQSection from '../components/ToolDetail/FAQSection';
import SEOHelmet from '../components/ToolDetail/SEOHelmet';

const ToolDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { tool, loading, error } = useToolDetail(slug);

    if (loading) return <Loader />;
    if (error || !tool) return <div className="text-center py-12 text-red-600">Error: {error || 'Tool not found'}</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <SEOHelmet
                title={`${tool.name} - FindMyAI`}
                description={tool.shortDescription}
                url={`https://findmyai.com/tools/${tool.slug}`}
                image={tool.logo}
            />

            <HeroSection
                name={tool.name}
                logo={tool.logo}
                badges={tool.badges}
                shortDescription={tool.shortDescription}
                website={tool.website}
            />

            <GalleryCarousel images={tool.gallery} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="lg:col-span-2 space-y-8">
                    <DescriptionSection description={tool.longDescription} />

                    {(tool.pros.length > 0 || tool.cons.length > 0) && (
                        <ProsConsSection pros={tool.pros} cons={tool.cons} />
                    )}

                    {tool.useCases.length > 0 && (
                        <UseCasesSection useCases={tool.useCases} />
                    )}
                </div>
                <div className="lg:col-span-1">
                    {/* Sidebar or additional info could go here */}
                    {/* For now, we can put Pricing here or keep it full width below */}
                </div>
            </div>

            <PricingTable pricing={tool.pricing} pricingString={tool.pricingString} />

            {tool.alternatives.length > 0 && (
                <AlternativesSection alternatives={tool.alternatives} />
            )}

            {tool.faq.length > 0 && (
                <FAQSection faq={tool.faq} />
            )}

            <CompareButton toolId={tool.id.toString()} />
        </div>
    );
};

export default ToolDetail;
