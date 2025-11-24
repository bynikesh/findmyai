import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline, FolderIcon } from '@heroicons/react/24/outline';

export interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    image_url?: string; // Optional large cover image
    categories: string[];
    likes: number;
    views: string;
    author?: {
        name: string;
        avatar: string;
        pro?: boolean;
    };
}

interface ToolCardProps {
    tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Fallback image if no specific cover image
    const coverImage = tool.image_url || `https://source.unsplash.com/random/800x600/?${tool.categories[0] || 'technology'},ai`;

    return (
        <div
            className="group flex flex-col gap-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img
                    src={coverImage}
                    alt={tool.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                        <div className="text-white">
                            <h3 className="font-bold text-lg truncate">{tool.name}</h3>
                        </div>

                        <div className="flex gap-2">
                            <button className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                                <FolderIcon className="w-5 h-5" />
                            </button>
                            <button
                                className={`p-2 rounded-lg transition-colors shadow-lg ${isLiked ? 'bg-pink-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsLiked(!isLiked);
                                }}
                            >
                                <HeartIconOutline className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Link to details */}
                <Link to={`/tools/${tool.slug}`} className="absolute inset-0 z-0" aria-label={`View ${tool.name}`} />
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                    <img
                        src={tool.author?.avatar || tool.logo_url}
                        alt={tool.author?.name || tool.name}
                        className="w-6 h-6 rounded-full object-cover border border-gray-100"
                    />
                    <span className="text-sm font-medium text-gray-900 hover:underline cursor-pointer">
                        {tool.author?.name || tool.name}
                    </span>
                    {tool.author?.pro && (
                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1 rounded">PRO</span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1 hover:text-pink-500 transition-colors cursor-pointer">
                        <HeartIcon className={`w-4 h-4 ${isLiked ? 'text-pink-500' : 'text-gray-300'}`} />
                        <span>{tool.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4 text-gray-300" />
                        <span>{tool.views}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
