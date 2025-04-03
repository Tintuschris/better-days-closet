import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './productcard';
import Link from 'next/link';
import { useSupabaseContext } from '../context/supabaseContext';
import { ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductCarousel({ title, products = [], category, isSpecialCategory }) {
  const { user } = useSupabaseContext();
  const limitedProducts = products.slice(0, 10);

  const getViewMoreLink = () => {
    if (isSpecialCategory) {
      return `/${category.toLowerCase().replace(' ', '-')}`;
    }
    return `/categories/${category}`;
  };

  return (
    <div className="py-3 relative product-carousel">
      {/* Enhanced header with background and better spacing */}
      <div className="bg-gray-50 rounded-t-lg border-b border-gray-100 mb-4">
        <div className="flex justify-between items-center px-4 py-3">
          <h2 className="text-sm md:text-base font-semibold text-primarycolor">{title}</h2>
          <Link 
            href={getViewMoreLink()} 
            className="flex items-center text-xs md:text-sm text-primarycolor hover:text-secondarycolor transition-colors group"
          >
            <span>View More</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={8}
        slidesPerView={2.4}
        breakpoints={{
          480: { slidesPerView: 3.4, spaceBetween: 10 },
          640: { slidesPerView: 4.4, spaceBetween: 12 },
          768: { slidesPerView: 4.4, spaceBetween: 12 },
          1024: { slidesPerView: 5.4, spaceBetween: 16 }
        }}
        navigation={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="px-3"
      >
        {limitedProducts.map(product => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .product-carousel .swiper-button-next,
        .product-carousel .swiper-button-prev {
          background-color: white;
          color: var(--primarycolor);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .product-carousel .swiper-button-next:hover,
        .product-carousel .swiper-button-prev:hover {
          background-color: var(--secondarycolor);
        }

        .product-carousel .swiper-button-next::after,
        .product-carousel .swiper-button-prev::after {
          font-size: 12px;
          font-weight: bold;
        }

        .product-carousel .swiper-button-disabled {
          display: none;
        }
      `}</style>
    </div>
  );
}
