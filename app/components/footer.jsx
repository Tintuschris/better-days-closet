import { useSupabaseContext } from '../context/supabaseContext';
import {
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  ClockIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaTwitter
} from 'react-icons/fa';
import Link from "next/link";

export default function Footer() {
  const { categories } = useSupabaseContext();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Return Policy', href: '/returns' },
    { name: 'Privacy Policy', href: '/privacy' }
  ];

  const customerService = [
    { name: 'Help Center', href: '/help' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'FAQ', href: '/faq' }
  ];

  return (
    <footer className="bg-gradient-to-br from-primarycolor via-primarycolor to-primarycolor/90 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-secondarycolor/20 rounded-full flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-secondarycolor" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Stay in Style</h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-secondarycolor focus:border-transparent"
              />
              <button className="px-6 py-3 bg-secondarycolor text-primarycolor font-semibold rounded-lg hover:bg-secondarycolor/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand & Contact Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-white">Better Days</span>
                <span className="text-secondarycolor"> Closet</span>
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Your premier destination for quality fashion. Discover the latest trends and timeless classics.
              </p>
            </div>

            {/* Store Location */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-secondarycolor mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Shop F61, Left Wing</p>
                  <p className="text-sm text-white/80">First Floor, RNG Towers</p>
                  <p className="text-sm text-white/80">Ronald Ngala Street</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-secondarycolor flex-shrink-0" />
                <a href="tel:0720474319" className="text-sm hover:text-secondarycolor transition-colors">
                  0720 474 319
                </a>
              </div>

              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-secondarycolor flex-shrink-0" />
                <a href="mailto:info@betterdayscloset.com" className="text-sm hover:text-secondarycolor transition-colors">
                  info@betterdayscloset.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-secondarycolor flex-shrink-0" />
                <div className="text-sm">
                  <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-white/80">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondarycolor">Shop Categories</h3>
            <ul className="space-y-3">
              {categories?.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.name?.toLowerCase() || ''}`}
                    className="text-sm text-white/80 hover:text-secondarycolor transition-colors capitalize"
                  >
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase()}
                  </Link>
                </li>
              ))}
              {categories?.length > 6 && (
                <li>
                  <Link
                    href="/categories"
                    className="text-sm text-secondarycolor hover:text-white transition-colors font-medium"
                  >
                    View All Categories →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondarycolor">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-secondarycolor transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-secondarycolor">Customer Service</h3>
            <ul className="space-y-3">
              {customerService.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-sm text-white/80 hover:text-secondarycolor transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Social Media & Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">Follow us:</span>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-secondarycolor rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-secondarycolor rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-secondarycolor rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-secondarycolor rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-secondarycolor rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-white/80">
                © 2024 <span className="text-secondarycolor font-semibold">Better Days Closet</span>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}