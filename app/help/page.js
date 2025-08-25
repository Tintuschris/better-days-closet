"use client";
import {
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Orders & Shopping",
      icon: ShoppingCartIcon,
      color: "bg-blue-50 text-blue-600",
      description: "Get help with placing orders, payment issues, and shopping questions",
      links: [
        { title: "How to Place an Order", href: "/faq#orders" },
        { title: "Payment Methods", href: "/faq#payment" },
        { title: "Order Modifications", href: "/faq#modifications" },
        { title: "Shopping Guide", href: "/faq#shopping" }
      ]
    },
    {
      title: "Shipping & Delivery",
      icon: TruckIcon,
      color: "bg-green-50 text-green-600",
      description: "Track your orders, delivery information, and shipping policies",
      links: [
        { title: "Delivery Areas & Pricing", href: "/shipping" },
        { title: "Delivery Times", href: "/shipping#times" },
        { title: "Track Your Order", href: "/track-order" },
        { title: "Delivery Issues", href: "/faq#delivery" }
      ]
    },
    {
      title: "Returns & Exchanges",
      icon: ArrowPathIcon,
      color: "bg-purple-50 text-purple-600",
      description: "Return policy, exchange process, and refund information",
      links: [
        { title: "Return Policy", href: "/returns" },
        { title: "How to Return Items", href: "/returns#process" },
        { title: "Exchange Guidelines", href: "/returns#exchange" },
        { title: "Refund Information", href: "/returns#refunds" }
      ]
    },
    {
      title: "Size & Fit",
      icon: UserIcon,
      color: "bg-pink-50 text-pink-600",
      description: "Size guides, fitting help, and product information",
      links: [
        { title: "Size Guide", href: "/size-guide" },
        { title: "Fit Recommendations", href: "/size-guide#tips" },
        { title: "Size Exchange", href: "/returns#size-exchange" },
        { title: "Product Care", href: "/care" }
      ]
    },
    {
      title: "Account & Profile",
      icon: CreditCardIcon,
      color: "bg-orange-50 text-orange-600",
      description: "Account management, profile settings, and order history",
      links: [
        { title: "Create Account", href: "/auth/register" },
        { title: "Login Issues", href: "/faq#login" },
        { title: "Update Profile", href: "/profile" },
        { title: "Order History", href: "/orders" }
      ]
    },
    {
      title: "Product Information",
      icon: QuestionMarkCircleIcon,
      color: "bg-indigo-50 text-indigo-600",
      description: "Product details, availability, and care instructions",
      links: [
        { title: "Product Authenticity", href: "/faq#authenticity" },
        { title: "Stock Availability", href: "/faq#stock" },
        { title: "Care Instructions", href: "/care" },
        { title: "Product Reviews", href: "/faq#reviews" }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Call Us",
      description: "Speak directly with our customer service team",
      action: "0720 474 319",
      href: "tel:0720474319",
      icon: PhoneIcon,
      color: "bg-primarycolor text-white"
    },
    {
      title: "Visit Store",
      description: "Get personal assistance at our physical location",
      action: "RNG Towers, Shop F61",
      href: "/contact",
      icon: UserIcon,
      color: "bg-secondarycolor text-primarycolor"
    },
    {
      title: "Send Message",
      description: "Contact us through our online form",
      action: "Contact Form",
      href: "/contact",
      icon: MessageCircle,
      color: "bg-primarycolor/10 text-primarycolor"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <QuestionMarkCircleIcon className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Help Center</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find answers to your questions and get the support you need. 
              We're here to help make your shopping experience smooth and enjoyable.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primarycolor text-center mb-12">Get Help Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`${action.color} rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-200 shadow-lg`}
              >
                <action.icon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90 mb-4">{action.description}</p>
                <div className="font-semibold">{action.action}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primarycolor text-center mb-12">Browse Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color} mr-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-primarycolor">{category.title}</h3>
                </div>
                <p className="text-primarycolor/70 mb-6">{category.description}</p>
                <ul className="space-y-3">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-primarycolor hover:text-secondarycolor transition-colors text-sm font-medium"
                      >
                        {link.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">Popular Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Link href="/faq" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">How long does delivery take?</h4>
                <p className="text-sm text-primarycolor/70">Learn about our delivery times and shipping options</p>
              </Link>
              <Link href="/returns" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">What is your return policy?</h4>
                <p className="text-sm text-primarycolor/70">Understand our 7-day return policy and process</p>
              </Link>
              <Link href="/size-guide" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">How do I find my size?</h4>
                <p className="text-sm text-primarycolor/70">Use our comprehensive size guide for perfect fit</p>
              </Link>
            </div>
            <div className="space-y-4">
              <Link href="/faq" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-primarycolor/70">See all available payment options including M-Pesa</p>
              </Link>
              <Link href="/shipping" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">Do you deliver nationwide?</h4>
                <p className="text-sm text-primarycolor/70">Check our delivery coverage and pricing</p>
              </Link>
              <Link href="/care" className="block p-4 border border-primarycolor/20 rounded-lg hover:bg-primarycolor/5 transition-colors">
                <h4 className="font-semibold text-primarycolor mb-2">How do I care for my clothes?</h4>
                <p className="text-sm text-primarycolor/70">Get expert tips on garment care and maintenance</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Our customer service team is ready to assist you with any questions or concerns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <PhoneIcon className="w-8 h-8 mx-auto mb-2 text-secondarycolor" />
                <h4 className="font-semibold mb-1">Phone Support</h4>
                <p className="text-sm text-white/80">0720 474 319</p>
                <p className="text-xs text-white/70">Mon-Sat: 9AM-8PM</p>
              </div>
              <div className="text-center">
                <UserIcon className="w-8 h-8 mx-auto mb-2 text-secondarycolor" />
                <h4 className="font-semibold mb-1">Visit Our Store</h4>
                <p className="text-sm text-white/80">RNG Towers, Shop F61</p>
                <p className="text-xs text-white/70">Ronald Ngala Street</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-secondarycolor" />
                <h4 className="font-semibold mb-1">Online Support</h4>
                <p className="text-sm text-white/80">Contact Form</p>
                <p className="text-xs text-white/70">24/7 Response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
