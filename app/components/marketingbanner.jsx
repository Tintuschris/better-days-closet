"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabase } from '../(admin)/admin/hooks/useSupabase';

export default function MarketingBanner({ isDesktop, isMobile, reducedHeight }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { useBanners } = useSupabase();
  const { data: banners, isLoading } = useBanners();

  useEffect(() => {
    if (!banners?.length) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  if (isLoading || !banners?.length) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Determine height class based on props
  const heightClass = reducedHeight 
    ? "h-[280px]" 
    : isMobile 
      ? "h-40" 
      : "h-[400px] lg:h-[500px]";

  return (
    <div className={`relative ${heightClass} rounded-2xl overflow-hidden max-w-[1400px] mx-auto shadow-sm`}>
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.filter(banner => banner.is_active).map((banner) => (
          <div
            key={banner.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center p-6 md:p-8">
              <div className="text-white max-w-lg z-10">
                <div className="text-xs md:text-sm font-medium mb-2 opacity-90 uppercase tracking-wide">
                  Featured Product
                </div>
                <h2 className={`${reducedHeight ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl lg:text-4xl'} font-bold mb-2 md:mb-3 leading-tight`}>
                  {banner.title}
                </h2>
                <p className={`${reducedHeight ? 'text-xs md:text-sm' : 'text-sm md:text-base'} mb-4 md:mb-6 opacity-90 leading-relaxed`}>
                  {banner.description}
                </p>
                <button className="bg-white text-primarycolor px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base hover:bg-gray-100 transition-colors shadow-sm">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Modern styling */}
      {banners.filter(banner => banner.is_active).length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white transition-all duration-200 shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white transition-all duration-200 shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Slide Indicators - Modern dots */}
      {banners.filter(banner => banner.is_active).length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.filter(banner => banner.is_active).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
