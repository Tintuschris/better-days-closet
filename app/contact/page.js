"use client";
import { useState } from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We'd love to hear from you. Get in touch with us for any questions, 
              feedback, or assistance you need.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-primarycolor mb-8">Get in Touch</h2>
            
            <div className="space-y-6">
              {/* Store Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6 text-primarycolor" />
                </div>
                <div>
                  <h3 className="font-semibold text-primarycolor mb-1">Store Location</h3>
                  <p className="text-primarycolor/70">Shop F61, Left Wing</p>
                  <p className="text-primarycolor/70">First Floor, RNG Towers</p>
                  <p className="text-primarycolor/70">Ronald Ngala Street, Nairobi</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-6 h-6 text-primarycolor" />
                </div>
                <div>
                  <h3 className="font-semibold text-primarycolor mb-1">Phone</h3>
                  <a href="tel:0720474319" className="text-primarycolor/70 hover:text-primarycolor transition-colors">
                    0720 474 319
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-6 h-6 text-primarycolor" />
                </div>
                <div>
                  <h3 className="font-semibold text-primarycolor mb-1">Email</h3>
                  <a href="mailto:info@betterdayscloset.com" className="text-primarycolor/70 hover:text-primarycolor transition-colors">
                    info@betterdayscloset.com
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-primarycolor" />
                </div>
                <div>
                  <h3 className="font-semibold text-primarycolor mb-1">Business Hours</h3>
                  <p className="text-primarycolor/70">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p className="text-primarycolor/70">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h3 className="font-semibold text-primarycolor mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-primarycolor/10 hover:bg-primarycolor hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-primarycolor/10 hover:bg-primarycolor hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-primarycolor/10 hover:bg-primarycolor hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                  <FaFacebookF className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primarycolor mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primarycolor mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor placeholder:text-primarycolor/50"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primarycolor mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor placeholder:text-primarycolor/50"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor placeholder:text-primarycolor/50"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Support</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="sizing">Sizing Help</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor placeholder:text-primarycolor/50"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primarycolor text-white py-3 px-6 rounded-lg font-semibold hover:bg-primarycolor/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
