"use client";
import { ArrowPathIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: "Contact Us",
      description: "Call us at 0720 474 319 or visit our store to initiate your return request."
    },
    {
      step: 2,
      title: "Prepare Items",
      description: "Ensure items are in original condition with tags attached and original packaging."
    },
    {
      step: 3,
      title: "Visit Store",
      description: "Bring your items and receipt to our store for inspection and processing."
    },
    {
      step: 4,
      title: "Get Refund",
      description: "Receive your refund or exchange once the return is approved."
    }
  ];

  const conditions = [
    { icon: CheckCircleIcon, text: "Items must be in original condition", valid: true },
    { icon: CheckCircleIcon, text: "Original tags must be attached", valid: true },
    { icon: CheckCircleIcon, text: "Return within 7 days of purchase", valid: true },
    { icon: CheckCircleIcon, text: "Original receipt required", valid: true },
    { icon: XCircleIcon, text: "Underwear and swimwear (hygiene reasons)", valid: false },
    { icon: XCircleIcon, text: "Items worn or damaged by customer", valid: false },
    { icon: XCircleIcon, text: "Items without original tags", valid: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ArrowPathIcon className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Returns & Exchanges</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We want you to love your purchase. If you're not completely satisfied, 
              we're here to help with returns and exchanges.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Return Policy Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primarycolor mb-6">Our Return Policy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-primarycolor" />
              </div>
              <h3 className="text-xl font-semibold text-primarycolor mb-2">7-Day Return</h3>
              <p className="text-primarycolor/70">
                You have 7 days from the date of purchase to return items for a full refund.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="w-8 h-8 text-primarycolor" />
              </div>
              <h3 className="text-xl font-semibold text-primarycolor mb-2">Easy Exchange</h3>
              <p className="text-primarycolor/70">
                Exchange for a different size or color, subject to availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-primarycolor" />
              </div>
              <h3 className="text-xl font-semibold text-primarycolor mb-2">Quality Guarantee</h3>
              <p className="text-primarycolor/70">
                We stand behind the quality of our products and will address any defects.
              </p>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">How to Return Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primarycolor rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-primarycolor mb-2">{step.title}</h3>
                <p className="text-primarycolor/70 text-sm">{step.description}</p>
                {index < returnSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-primarycolor/20 transform translate-x-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-primarycolor mb-6">What Can Be Returned</h3>
            <div className="space-y-4">
              {conditions.filter(c => c.valid).map((condition, index) => (
                <div key={index} className="flex items-center gap-3">
                  <condition.icon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-primarycolor/80">{condition.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-primarycolor mb-6">What Cannot Be Returned</h3>
            <div className="space-y-4">
              {conditions.filter(c => !c.valid).map((condition, index) => (
                <div key={index} className="flex items-center gap-3">
                  <condition.icon className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <span className="text-primarycolor/80">{condition.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primarycolor mb-6">Refund Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-primarycolor mb-4">Refund Methods</h4>
              <ul className="space-y-2 text-primarycolor/80">
                <li>• Cash refunds for cash purchases</li>
                <li>• Mobile money refunds for M-Pesa payments</li>
                <li>• Bank transfer for card payments</li>
                <li>• Store credit (if preferred)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-primarycolor mb-4">Processing Time</h4>
              <ul className="space-y-2 text-primarycolor/80">
                <li>• Cash refunds: Immediate</li>
                <li>• M-Pesa refunds: Within 24 hours</li>
                <li>• Bank transfers: 3-5 business days</li>
                <li>• Store credit: Immediate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact for Returns */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help with a Return?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Our customer service team is ready to assist you with any return or exchange questions.
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
              <div className="text-center">
                <p className="text-sm text-white/80">
                  <strong>Store Hours:</strong><br />
                  Mon-Sat: 9AM-8PM | Sun: 10AM-6PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
