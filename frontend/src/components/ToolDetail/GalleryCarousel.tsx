import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface GalleryCarouselProps {
    images: string[];
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Gallery</h2>
            <div className="relative group w-full max-w-4xl mx-auto">
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-xl bg-gray-200 shadow-lg">
                    <img
                        src={images[currentIndex]}
                        alt={`Screenshot ${currentIndex + 1}`}
                        className="h-full w-full object-cover transition-opacity duration-500"
                    />
                </div>

                {/* Left Arrow */}
                <div className="absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition hidden group-hover:block">
                    <ChevronLeftIcon onClick={prevSlide} className="h-6 w-6" />
                </div>

                {/* Right Arrow */}
                <div className="absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition hidden group-hover:block">
                    <ChevronRightIcon onClick={nextSlide} className="h-6 w-6" />
                </div>

                {/* Dots */}
                <div className="flex justify-center py-2 top-4">
                    {images.map((_, slideIndex) => (
                        <div
                            key={slideIndex}
                            onClick={() => setCurrentIndex(slideIndex)}
                            className={`text-2xl cursor-pointer mx-1 h-2 w-2 rounded-full transition-all ${currentIndex === slideIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GalleryCarousel;
