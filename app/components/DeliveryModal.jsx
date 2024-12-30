"use client";
import { useState, useEffect } from 'react';
import { X, MapPin, Truck, Store } from 'lucide-react';
import { useSupabase } from '../(admin)/admin/hooks/useSupabase';

export default function DeliveryModal({ onClose, onSelect }) {
  const { fetchDeliveryAddresses, getDeliveryOptionDetails } = useSupabase();
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAddresses = async () => {
      const addresses = await fetchDeliveryAddresses();
      setDeliveryAddresses(addresses);
      setLoading(false);
    };
    loadAddresses();
  }, [fetchDeliveryAddresses]);

  const getIcon = (type) => {
    switch (type) {
      case 'nairobi':
        return <Truck className="w-6 h-6" />;
      case 'cbd':
        return <Store className="w-6 h-6" />;
      case 'kenya':
        return <MapPin className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const handleOptionSelect = async (option) => {
    setSelectedOption(option.id);
    const details = await getDeliveryOptionDetails(option.id);
    const deliveryData = {
      option: option,
      details: details,
      cost: option.cost
    };
    localStorage.setItem('guestDeliveryDetails', JSON.stringify(deliveryData));
    onSelect(deliveryData);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <p className="text-primarycolor">Loading delivery options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primarycolor">Select Delivery Option</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-primarycolor" />
          </button>
        </div>

        <div className="space-y-4">
          {deliveryAddresses.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer
                ${selectedOption === option.id 
                  ? 'border-primarycolor bg-primarycolor/5' 
                  : 'border-gray-200 hover:border-primarycolor'
                }`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex items-start gap-4">
                <div className="text-primarycolor">
                  {getIcon(option.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primarycolor mb-2">{option.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{option.delivery_time}</span>
                    <span className="font-bold text-primarycolor">
                      Ksh. {option.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>* Delivery times are estimates and may vary based on location</p>
          <p>* Additional fees may apply for remote areas</p>
        </div>
      </div>
    </div>
  );
}
