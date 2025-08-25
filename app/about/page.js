"use client";
import { MapPinIcon, PhoneIcon, ClockIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function AboutPage() {
  const values = [
    {
      icon: HeartIcon,
      title: "Quality First",
      description: "We carefully curate every piece to ensure the highest quality and style for our customers."
    },
    {
      icon: StarIcon,
      title: "Customer Satisfaction",
      description: "Your happiness is our priority. We go above and beyond to exceed your expectations."
    },
    {
      icon: MapPinIcon,
      title: "Local Presence",
      description: "Proudly serving Nairobi with a physical store you can visit and trust."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              About <span className="text-secondarycolor">Better Days Closet</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Your premier destination for quality fashion in the heart of Nairobi. 
              We believe everyone deserves to look and feel their best.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primarycolor mb-6">Our Story</h2>
            <div className="space-y-4 text-primarycolor/80 leading-relaxed">
              <p>
                Founded with a passion for fashion and a commitment to quality, Better Days Closet 
                has been serving the Nairobi community with carefully curated clothing and accessories 
                that blend style, comfort, and affordability.
              </p>
              <p>
                Located in the bustling RNG Towers along Ronald Ngala Street, our store has become 
                a trusted destination for fashion enthusiasts who appreciate quality and value. 
                We believe that great style should be accessible to everyone.
              </p>
              <p>
                From trendy casual wear to elegant formal pieces, we offer a diverse collection 
                that caters to men, women, and children. Every item in our store is selected 
                with care to ensure it meets our high standards of quality and style.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-primarycolor rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primarycolor mb-4">Our Mission</h3>
              <p className="text-primarycolor/80">
                To provide high-quality, stylish clothing that makes our customers feel confident 
                and comfortable, while building lasting relationships within our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primarycolor mb-4">Our Values</h2>
            <p className="text-primarycolor/70 max-w-2xl mx-auto">
              These core values guide everything we do and shape the experience we provide to our customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primarycolor" />
                </div>
                <h3 className="text-xl font-semibold text-primarycolor mb-3">{value.title}</h3>
                <p className="text-primarycolor/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visit Our Store */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Visit Our Store</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-6 h-6 text-secondarycolor mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Shop F61, Left Wing</p>
                    <p>First Floor, RNG Towers</p>
                    <p>Ronald Ngala Street, Nairobi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-6 h-6 text-secondarycolor flex-shrink-0" />
                  <a href="tel:0720474319" className="hover:text-secondarycolor transition-colors">
                    0720 474 319
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-6 h-6 text-secondarycolor mt-1 flex-shrink-0" />
                  <div>
                    <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="inline-block bg-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Why Visit Us?</h3>
                <ul className="space-y-2 text-left">
                  <li>• Try before you buy</li>
                  <li>• Personal styling advice</li>
                  <li>• Exclusive in-store offers</li>
                  <li>• Immediate availability</li>
                  <li>• Friendly customer service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
