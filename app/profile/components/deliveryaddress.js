'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

export default function DeliveryAddress() {
  const router = useRouter();
  const { /* Supabase functions */ } = useSupabase();

  const [selectedOption, setSelectedOption] = useState('');
  const [region, setRegion] = useState('');
  const [area, setArea] = useState('');
  const [courierService, setCourierService] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');

  const deliveryOptions = [
    {
      id: 'nairobi',
      name: 'Nairobi Delivery',
      cost: 200,
      description: 'Delivery to this address happens with the help of a rider. Your contact will be given to the rider for specific details of the drop-off point of your product. We request that you stay on until you receive your product'
    },
    {
      id: 'pickup',
      name: 'CBD Pickup Point',
      cost: 0,
      description: 'Pickup mtaani is located in Room B5 Star Mall along Tom Mboya Street. Operating hours is 8am to 6pm, They also do doorstep delivery. Please visit their website www.pickupmtaani.com for more info.'
    },
    {
      id: 'countrywide',
      name: 'Rest of Kenya',
      cost: 450,
      description: 'Ena Coach delivers to different parts of the country. The price of delivery might change depending on weight. The cost indicated below is the base cost for any delivery.'
    }
  ];

  const pickupPoints = [
    { id: 'pickup-mtaani', name: 'Pickup Mtaani' },
    { id: 'nairobabe', name: 'Nairobabe' },
    { id: 'drop-n-pick', name: 'Drop-N-Pick' }
  ];

  const courierServices = [
    { id: 'ena-coach', name: 'Ena Coach' },
    { id: '2nk', name: '2NK Sacco' },
    { id: 'easy-coach', name: 'Easy Coach' }
  ];

  const handleSaveAddress = async () => {
    try {
      const deliveryData = {
        option_name: selectedOption,
        region,
        area,
        courier_service: courierService,
        pickup_point_name: pickupPoint,
        cost: deliveryOptions.find(opt => opt.id === selectedOption)?.cost || 0
      };

      // Save to Supabase
      // await saveDeliveryAddress(deliveryData);

      // Navigate back to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white p-4 flex items-center border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="text-purple-600" />
        </button>
        <h1 className="text-xl font-semibold text-purple-700 ml-4">DELIVERY ADDRESS</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-purple-700">Choose Your Delivery Option</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`p-4 rounded-xl text-center ${
                  selectedOption === option.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>

          {selectedOption === 'nairobi' && (
            <div className="space-y-4">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Region</option>
                <option value="Nairobi">Nairobi</option>
              </select>

              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Area</option>
                <option value="Ruaka">Ruaka</option>
              </select>
            </div>
          )}

          {selectedOption === 'pickup' && (
            <select
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Pickup Point</option>
              {pickupPoints.map(point => (
                <option key={point.id} value={point.id}>{point.name}</option>
              ))}
            </select>
          )}

          {selectedOption === 'countrywide' && (
            <select
              value={courierService}
              onChange={(e) => setCourierService(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Courier Service</option>
              {courierServices.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          )}

          {selectedOption && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700">
                {deliveryOptions.find(opt => opt.id === selectedOption)?.description}
              </p>
              <p className="text-sm font-medium text-purple-700 mt-2">
                Delivery Cost: Ksh. {deliveryOptions.find(opt => opt.id === selectedOption)?.cost}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveAddress}
          disabled={!selectedOption}
          className={`w-full py-4 rounded-full text-white ${
            selectedOption ? 'bg-purple-600' : 'bg-gray-400'
          }`}
        >
          Save Address
        </button>
      </div>
    </div>
  );
}