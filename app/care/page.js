"use client";
import { ShieldCheckIcon, SunIcon } from '@heroicons/react/24/outline';
import { Droplets, Sparkles } from 'lucide-react';

export default function CarePage() {
  const careCategories = [
    {
      title: "Cotton & Natural Fabrics",
      icon: Droplets,
      color: "bg-blue-50 text-blue-600",
      tips: [
        "Wash in cold or warm water (30-40°C) to prevent shrinking",
        "Use mild detergent without bleach or harsh chemicals",
        "Turn garments inside out before washing to protect colors",
        "Air dry when possible; if using a dryer, use low heat",
        "Iron while slightly damp for best results",
        "Store in a cool, dry place away from direct sunlight"
      ]
    },
    {
      title: "Synthetic & Blended Fabrics",
      icon: Sparkles,
      color: "bg-purple-50 text-purple-600",
      tips: [
        "Wash in cool water (30°C) to maintain fabric integrity",
        "Use fabric softener sparingly to avoid buildup",
        "Avoid high heat when drying to prevent melting or damage",
        "Iron on low to medium heat with a pressing cloth if needed",
        "Hang or fold immediately after drying to prevent wrinkles",
        "Check care labels for specific synthetic fabric requirements"
      ]
    },
    {
      title: "Delicate & Special Fabrics",
      icon: ShieldCheckIcon,
      color: "bg-pink-50 text-pink-600",
      tips: [
        "Hand wash or use delicate cycle with cold water",
        "Use gentle, pH-neutral detergent designed for delicates",
        "Never wring or twist; gently squeeze out excess water",
        "Lay flat to dry away from direct heat or sunlight",
        "Steam or iron on lowest setting with protective cloth",
        "Store hanging or flat to maintain shape"
      ]
    },
    {
      title: "Denim & Heavy Fabrics",
      icon: SunIcon,
      color: "bg-indigo-50 text-indigo-600",
      tips: [
        "Wash inside out in cold water to preserve color",
        "Wash separately or with similar colors for first few washes",
        "Use minimal detergent to maintain fabric texture",
        "Air dry when possible; tumble dry on low if needed",
        "Iron on medium heat while slightly damp",
        "Store hanging to prevent permanent creases"
      ]
    }
  ];

  const generalTips = [
    {
      title: "Read Care Labels",
      description: "Always check the care label before washing. Symbols provide specific instructions for each garment."
    },
    {
      title: "Sort by Color & Fabric",
      description: "Separate lights, darks, and colors. Group similar fabrics together for optimal care."
    },
    {
      title: "Pre-treat Stains",
      description: "Address stains immediately with appropriate stain removers before they set."
    },
    {
      title: "Don't Overload",
      description: "Give clothes room to move in the washer for better cleaning and less wrinkles."
    },
    {
      title: "Use Quality Hangers",
      description: "Invest in good hangers to maintain garment shape and prevent stretching."
    },
    {
      title: "Regular Maintenance",
      description: "Clean your washing machine monthly and check for loose buttons or threads regularly."
    }
  ];

  const stainGuide = [
    { stain: "Blood", treatment: "Rinse with cold water immediately, then wash with enzyme detergent" },
    { stain: "Oil/Grease", treatment: "Blot excess, apply dish soap directly, let sit 10 minutes, then wash" },
    { stain: "Sweat", treatment: "Pre-treat with white vinegar or baking soda paste before washing" },
    { stain: "Makeup", treatment: "Use makeup remover or micellar water, then wash as normal" },
    { stain: "Food", treatment: "Scrape off excess, rinse with cold water, pre-treat with stain remover" },
    { stain: "Ink", treatment: "Dab with rubbing alcohol using cotton ball, then wash immediately" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primarycolor to-primarycolor/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-secondarycolor" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Care Instructions</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Keep your clothes looking their best with our comprehensive care guide. 
              Proper care extends the life of your garments and maintains their quality.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Fabric-Specific Care */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primarycolor text-center mb-12">Care by Fabric Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {careCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color} mr-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-primarycolor">{category.title}</h3>
                </div>
                <ul className="space-y-3">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primarycolor rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-primarycolor/80">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* General Care Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">General Care Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalTips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primarycolor font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-primarycolor mb-2">{tip.title}</h3>
                <p className="text-primarycolor/70 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stain Removal Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">Quick Stain Removal Guide</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primarycolor/10">
                  <th className="px-6 py-4 text-left text-primarycolor font-semibold">Stain Type</th>
                  <th className="px-6 py-4 text-left text-primarycolor font-semibold">Treatment</th>
                </tr>
              </thead>
              <tbody>
                {stainGuide.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-primarycolor">{item.stain}</td>
                    <td className="px-6 py-4 text-primarycolor/80">{item.treatment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-primarycolor/5 rounded-lg">
            <p className="text-sm text-primarycolor/80">
              <strong>Important:</strong> Always test stain removal methods on a hidden area first. 
              For stubborn stains, consider professional cleaning services.
            </p>
          </div>
        </div>

        {/* Storage Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-primarycolor mb-8">Proper Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-primarycolor mb-4">Hanging Items</h3>
              <ul className="space-y-2 text-primarycolor/80">
                <li>• Use padded or wooden hangers for delicate items</li>
                <li>• Hang shirts, dresses, and jackets to prevent wrinkles</li>
                <li>• Leave space between garments for air circulation</li>
                <li>• Use garment bags for special occasion wear</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primarycolor mb-4">Folding Items</h3>
              <ul className="space-y-2 text-primarycolor/80">
                <li>• Fold knitwear and heavy sweaters to prevent stretching</li>
                <li>• Use tissue paper between folds for delicate items</li>
                <li>• Store in drawers or on shelves away from direct light</li>
                <li>• Use cedar blocks or lavender sachets to deter moths</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Care */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">When to Seek Professional Care</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Some items require professional cleaning for best results. Consider dry cleaning for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-6">
              <ul className="space-y-2">
                <li>• Suits and formal wear</li>
                <li>• Silk and delicate fabrics</li>
                <li>• Items with "Dry Clean Only" labels</li>
              </ul>
              <ul className="space-y-2">
                <li>• Leather and suede items</li>
                <li>• Heavily stained garments</li>
                <li>• Structured garments with padding</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-secondarycolor text-primarycolor px-6 py-3 rounded-lg font-semibold hover:bg-secondarycolor/90 transition-colors"
              >
                Need Care Advice?
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
      </div>
    </div>
  );
}
