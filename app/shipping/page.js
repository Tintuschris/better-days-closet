"use client";
import { TruckIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function ShippingPage() {
  const deliveryOptions = [
    {
      title: "Store Pickup",
      price: "Free",
      time: "Same Day",
      description: "Pick up your order from our store in RNG Towers",
      icon: MapPinIcon
    },
    {
      title: "Nairobi Delivery",
      price: "KES 200",
      time: "1-2 Days",
      description: "Delivery within Nairobi and surrounding areas",
      icon: TruckIcon
    },
    {
      title: "Nationwide Delivery",
      price: "KES 300-500",
      time: "3-5 Days",
      description: "Delivery to major towns across Kenya",
      icon: TruckIcon
    }
  ];

  const deliveryAreas = [
    {
      area: "Nairobi CBD",
      price: "KES 200",
      time: "Same day or next day"
    },
    {
      area: "Nairobi Suburbs",
      price: "KES 200",
      time: "1-2 business days"
    },
    {
      area: "Kiambu, Machakos, Kajiado",
      price: "KES 300",
      time: "2-3 business days"
    },
    {
      area: "Mombasa, Kisumu, Nakuru",
      price: "KES 400",
      time: "3-4 business days"
    },
    {
      area: "Other Major Towns",
      price: "KES 500",
      time: "4-5 business days"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <TruckIcon className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Shipping Information</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Fast, reliable delivery across Kenya. Choose the option that works best for you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Delivery Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primarycolor text-center mb-12">Delivery Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliveryOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <option.icon className="w-8 h-8 text-primarycolor" />
                </div>
                <h3 className="text-xl font-bold text-primarycolor mb-2">{option.title}</h3>
                <div className="text-2xl font-bold text-secondarycolor mb-2">{option.price}</div>
                <div className="text-sm text-primarycolor/70 mb-4">{option.time}</div>
                <p className="text-primarycolor/80">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Areas & Pricing */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">Delivery Areas & Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primarycolor/10">
                  <th className="px-6 py-4 text-left text-primarycolor font-semibold">Delivery Area</th>
                  <th className="px-6 py-4 text-left text-primarycolor font-semibold">Price</th>
                  <th className="px-6 py-4 text-left text-primarycolor font-semibold">Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                {deliveryAreas.map((area, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-6 py-4 text-primarycolor font-medium">{area.area}</td>
                    <td className="px-6 py-4 text-primarycolor/70">{area.price}</td>
                    <td className="px-6 py-4 text-primarycolor/70">{area.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Process */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">How Shipping Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Order Placed",
                description: "Complete your purchase online or in-store"
              },
              {
                step: 2,
                title: "Order Confirmed",
                description: "We'll confirm your order and prepare it for shipping"
              },
              {
                step: 3,
                title: "In Transit",
                description: "Your order is on its way to your delivery address"
              },
              {
                step: 4,
                title: "Delivered",
                description: "Receive your order and enjoy your new items!"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primarycolor rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-primarycolor mb-2">{step.title}</h3>
                <p className="text-sm text-primarycolor/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-primarycolor mb-6">Important Notes</h3>
            <ul className="space-y-3 text-primarycolor/80">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Orders placed before 2 PM are processed the same day</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Delivery times exclude weekends and public holidays</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>We'll contact you before delivery to confirm availability</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Signature required for all deliveries</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-primarycolor mb-6">Payment Options</h3>
            <ul className="space-y-3 text-primarycolor/80">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Cash on Delivery (COD) available</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>M-Pesa payments accepted</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Bank transfers for advance payment</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                <span>Card payments (Visa, Mastercard)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact for Shipping */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Shipping?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Need help with your delivery or have questions about shipping to your area? 
              Our team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0720474319"
                className="bg-secondarycolor text-primarycolor px-6 py-3 rounded-lg font-semibold hover:bg-secondarycolor/90 transition-colors"
              >
                Call: 0720 474 319
              </a>
              <a
                href="/contact"
                className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
