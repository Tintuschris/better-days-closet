import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductCarousel({ title, products, category, isSpecialCategory }) {
  const limitedProducts = products.slice(0, 10);

  const getViewMoreLink = () => {
    if (isSpecialCategory) {
      return `/${category.toLowerCase().replace(' ', '-')}`;
    }
    return `/categories/${category}`;
  };

  return (
    <div className="py-4 relative product-carousel ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-primarycolor">{title}</h2>
        <Link href={getViewMoreLink()} className="text-sm text-primarycolor hover:underline">
          View More
        </Link>
      </div>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={16}
        slidesPerView="auto"
        navigation={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="mySwiper"
      >
        {limitedProducts.map(product => (
          <SwiperSlide key={product.id} className="max-w-[50vw]">
            <ProductCard product={product} className="max-h-[260px]" />
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .product-carousel .swiper-container {
          z-index: 0;
        }
        .product-carousel .swiper-button-next,
        .product-carousel .swiper-button-prev {
          background-color: transparent;
          color: var(--secondarycolor);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .product-carousel .swiper-button-next::after,
        .product-carousel .swiper-button-prev::after {
          font-size: 18px;
        }

        .product-carousel .swiper-button-next::after:hover,
        .product-carousel .swiper-button-prev::after:hover {
          background-color: var(--primarycolor);
          color: var(--secondarycolor);
        }

        .product-carousel .swiper-button-disabled {
          opacity: 0.5;
        }
          .product-carousel .swiper-slide img {
          max-height: 210px !important;
          width: auto;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}