"use client";
import { ShieldCheckIcon, EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account or making a purchase",
        "Contact information including name, email address, and phone number",
        "Billing and shipping addresses",
        "Payment information (processed securely through our payment providers)",
        "Shopping preferences and purchase history",
        "Website usage data and cookies for improving your experience"
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "Process and fulfill your orders",
        "Communicate with you about your purchases and account",
        "Send promotional emails (with your consent)",
        "Improve our products and services",
        "Prevent fraud and ensure security",
        "Comply with legal obligations"
      ]
    },
    {
      title: "Information Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties",
        "We may share information with trusted service providers who help us operate our business",
        "We may disclose information when required by law or to protect our rights",
        "Anonymous, aggregated data may be used for business analysis"
      ]
    },
    {
      title: "Data Security",
      content: [
        "We implement appropriate security measures to protect your personal information",
        "Payment information is encrypted and processed through secure payment gateways",
        "Access to personal information is restricted to authorized personnel only",
        "We regularly review and update our security practices"
      ]
    },
    {
      title: "Your Rights",
      content: [
        "Access and review your personal information",
        "Request corrections to inaccurate information",
        "Request deletion of your personal information",
        "Opt-out of marketing communications",
        "Request a copy of your data in a portable format"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
            <p className="text-sm text-white/70 mt-4">Last updated: December 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primarycolor mb-4">Introduction</h2>
          <p className="text-primarycolor/80 leading-relaxed">
            Better Days Closet ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you visit our website or make a purchase from our store. 
            Please read this privacy policy carefully.
          </p>
        </div>

        {/* Privacy Sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-primarycolor mb-6">{section.title}</h2>
            <ul className="space-y-3">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-primarycolor/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Cookies */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primarycolor mb-6">Cookies and Tracking</h2>
          <div className="space-y-4 text-primarycolor/80">
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience. 
              Cookies are small data files stored on your device that help us:
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Remember your preferences and settings</li>
              <li>• Keep you logged in to your account</li>
              <li>• Analyze website traffic and usage patterns</li>
              <li>• Provide personalized content and recommendations</li>
            </ul>
            <p>
              You can control cookies through your browser settings, but disabling them may 
              affect the functionality of our website.
            </p>
          </div>
        </div>

        {/* Contact for Privacy */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <LockClosedIcon className="w-12 h-12 mx-auto mb-4 text-secondarycolor" />
            <h3 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your 
              personal information, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@betterdayscloset.com"
                className="bg-secondarycolor text-primarycolor px-6 py-3 rounded-lg font-semibold hover:bg-secondarycolor/90 transition-colors"
              >
                Email: privacy@betterdayscloset.com
              </a>
              <a
                href="tel:0720474319"
                className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Call: 0720 474 319
              </a>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primarycolor mb-4">Policy Updates</h2>
          <p className="text-primarycolor/80 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our 
            practices or for other operational, legal, or regulatory reasons. We will notify 
            you of any material changes by posting the updated policy on our website and 
            updating the "Last updated" date. We encourage you to review this policy 
            periodically to stay informed about how we protect your information.
          </p>
        </div>
      </div>
    </div>
  );
}
