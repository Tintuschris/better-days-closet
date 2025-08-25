"use client";
import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Ruler } from 'lucide-react';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState('women');

  const womenSizes = [
    { size: 'XS', chest: '32-34', waist: '24-26', hips: '34-36', uk: '6', us: '2' },
    { size: 'S', chest: '34-36', waist: '26-28', hips: '36-38', uk: '8', us: '4' },
    { size: 'M', chest: '36-38', waist: '28-30', hips: '38-40', uk: '10', us: '6' },
    { size: 'L', chest: '38-40', waist: '30-32', hips: '40-42', uk: '12', us: '8' },
    { size: 'XL', chest: '40-42', waist: '32-34', hips: '42-44', uk: '14', us: '10' },
    { size: 'XXL', chest: '42-44', waist: '34-36', hips: '44-46', uk: '16', us: '12' }
  ];

  const menSizes = [
    { size: 'XS', chest: '34-36', waist: '28-30', uk: '34', us: 'XS' },
    { size: 'S', chest: '36-38', waist: '30-32', uk: '36', us: 'S' },
    { size: 'M', chest: '38-40', waist: '32-34', uk: '38', us: 'M' },
    { size: 'L', chest: '40-42', waist: '34-36', uk: '40', us: 'L' },
    { size: 'XL', chest: '42-44', waist: '36-38', uk: '42', us: 'XL' },
    { size: 'XXL', chest: '44-46', waist: '38-40', uk: '44', us: 'XXL' }
  ];

  const kidsSizes = [
    { size: '2-3Y', height: '92-98', chest: '52-54', age: '2-3 years' },
    { size: '3-4Y', height: '98-104', chest: '54-56', age: '3-4 years' },
    { size: '4-5Y', height: '104-110', chest: '56-58', age: '4-5 years' },
    { size: '5-6Y', height: '110-116', chest: '58-60', age: '5-6 years' },
    { size: '6-7Y', height: '116-122', chest: '60-62', age: '6-7 years' },
    { size: '7-8Y', height: '122-128', chest: '62-64', age: '7-8 years' },
    { size: '8-9Y', height: '128-134', chest: '64-66', age: '8-9 years' },
    { size: '9-10Y', height: '134-140', chest: '66-68', age: '9-10 years' }
  ];

  const measurementTips = [
    {
      title: "Chest/Bust",
      description: "Measure around the fullest part of your chest, keeping the tape horizontal."
    },
    {
      title: "Waist",
      description: "Measure around your natural waistline, which is the narrowest part of your torso."
    },
    {
      title: "Hips",
      description: "Measure around the fullest part of your hips, about 7-9 inches below your waist."
    },
    {
      title: "Height (Kids)",
      description: "Measure from the top of the head to the floor without shoes."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Ruler className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Size Guide</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find your perfect fit with our comprehensive size guide. 
              All measurements are in inches unless otherwise specified.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* How to Measure */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <InformationCircleIcon className="w-8 h-8 text-primarycolor" />
            <h2 className="text-2xl font-bold text-primarycolor">How to Measure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {measurementTips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primarycolor font-bold">{index + 1}</span>
                </div>
                <h3 className="font-semibold text-primarycolor mb-2">{tip.title}</h3>
                <p className="text-sm text-primarycolor/70">{tip.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primarycolor/5 rounded-lg">
            <p className="text-sm text-primarycolor/80">
              <strong>Pro Tip:</strong> For the most accurate measurements, have someone help you measure, 
              and wear well-fitting undergarments. Keep the measuring tape snug but not tight.
            </p>
          </div>
        </div>

        {/* Size Charts */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'women', label: 'Women', icon: '👩' },
                { id: 'men', label: 'Men', icon: '👨' },
                { id: 'kids', label: 'Kids', icon: '👶' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primarycolor border-b-2 border-primarycolor bg-primarycolor/5'
                      : 'text-primarycolor/60 hover:text-primarycolor'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Tables */}
          <div className="p-8">
            {activeTab === 'women' && (
              <div>
                <h3 className="text-xl font-bold text-primarycolor mb-6">Women's Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primarycolor/10">
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Size</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Chest (inches)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Waist (inches)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Hips (inches)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">UK Size</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">US Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {womenSizes.map((size, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-semibold text-primarycolor">{size.size}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.chest}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.waist}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.hips}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.uk}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.us}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'men' && (
              <div>
                <h3 className="text-xl font-bold text-primarycolor mb-6">Men's Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primarycolor/10">
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Size</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Chest (inches)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Waist (inches)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">UK Size</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">US Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menSizes.map((size, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-semibold text-primarycolor">{size.size}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.chest}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.waist}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.uk}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.us}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'kids' && (
              <div>
                <h3 className="text-xl font-bold text-primarycolor mb-6">Kids' Size Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primarycolor/10">
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Size</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Height (cm)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Chest (cm)</th>
                        <th className="px-4 py-3 text-left text-primarycolor font-semibold">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kidsSizes.map((size, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-semibold text-primarycolor">{size.size}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.height}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.chest}</td>
                          <td className="px-4 py-3 text-primarycolor/70">{size.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-white/90 mb-6">
            If you're unsure about sizing or need personalized assistance, our team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="bg-secondarycolor text-primarycolor px-6 py-3 rounded-lg font-semibold hover:bg-secondarycolor/90 transition-colors text-center"
            >
              Contact Us
            </a>
            <a
              href="tel:0720474319"
              className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors text-center"
            >
              Call: 0720 474 319
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
