"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabase } from '../(admin)/admin/hooks/useSupabase';

export default function MarketingBanner() {
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

  return (
    <div className="relative h-40 md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden max-w-[1400px] mx-auto">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-6 md:p-12">
              <div className="text-white max-w-2xl">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">{banner.title}</h2>
                <p className="text-sm md:text-lg lg:text-xl md:leading-relaxed">{banner.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 md:p-3 rounded-full hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-primarycolor" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 md:p-3 rounded-full hover:bg-white transition-colors"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primarycolor" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.filter(banner => banner.is_active).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
