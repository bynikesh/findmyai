import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
    title: string;
    description: string;
    url: string;
    image?: string;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({ title, description, url, image }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEOHelmet;
