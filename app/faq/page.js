"use client";
import { useState } from 'react';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      title: "Orders & Shopping",
      faqs: [
        {
          question: "How do I place an order?",
          answer: "You can place an order online through our website or visit our physical store at RNG Towers. Simply browse our products, add items to your cart, and proceed to checkout."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can be modified or cancelled within 2 hours of placement. Please contact us immediately at 0720 474 319 if you need to make changes."
        },
        {
          question: "Do you offer Cash on Delivery (COD)?",
          answer: "Yes, we offer Cash on Delivery for orders within Nairobi and selected areas. COD is available for orders up to KES 10,000."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept M-Pesa, bank transfers, cash payments, and major credit/debit cards (Visa, Mastercard)."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      faqs: [
        {
          question: "How long does delivery take?",
          answer: "Delivery within Nairobi takes 1-2 business days. Nationwide delivery takes 3-5 business days depending on your location."
        },
        {
          question: "What are your delivery charges?",
          answer: "Nairobi delivery costs KES 200. Nationwide delivery ranges from KES 300-500 depending on the destination."
        },
        {
          question: "Do you deliver nationwide?",
          answer: "Yes, we deliver to all major towns across Kenya. Remote areas may require additional delivery time and charges."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, you'll receive tracking information via SMS once your order is dispatched. You can also call us for updates."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return policy from the date of purchase. Items must be in original condition with tags attached."
        },
        {
          question: "How do I return an item?",
          answer: "Contact us at 0720 474 319 or visit our store. Bring the item with original receipt and packaging for a smooth return process."
        },
        {
          question: "Can I exchange for a different size?",
          answer: "Yes, exchanges are available subject to stock availability. The item must be in original condition with tags attached."
        },
        {
          question: "How long does a refund take?",
          answer: "Cash refunds are immediate. M-Pesa refunds take up to 24 hours, and bank transfers take 3-5 business days."
        }
      ]
    },
    {
      title: "Products & Sizing",
      faqs: [
        {
          question: "How do I know my size?",
          answer: "Check our detailed size guide for measurements. If you're unsure, visit our store for personal fitting assistance or contact us for advice."
        },
        {
          question: "Are your products authentic?",
          answer: "Yes, all our products are carefully sourced and authentic. We stand behind the quality of every item we sell."
        },
        {
          question: "Do you restock sold-out items?",
          answer: "We regularly restock popular items. Contact us to inquire about specific products or to be notified when items are back in stock."
        },
        {
          question: "Can I see products before buying?",
          answer: "Absolutely! Visit our store at RNG Towers to see, touch, and try on products before making a purchase."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <QuestionMarkCircleIcon className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find answers to common questions about shopping, delivery, returns, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-primarycolor mb-6">{category.title}</h2>
            <div className="space-y-4">
              {category.faqs.map((faq, faqIndex) => {
                const itemKey = `${categoryIndex}-${faqIndex}`;
                const isOpen = openItems[itemKey];
                
                return (
                  <div key={faqIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primarycolor/5 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-primarycolor pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDownIcon 
                        className={`w-5 h-5 text-primarycolor transition-transform flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-primarycolor/10 pt-4">
                          <p className="text-primarycolor/80 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer service team is here to help!
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
