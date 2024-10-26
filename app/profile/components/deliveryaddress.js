'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/cartContext';
import { Icon } from '@iconify/react';
import arcticonsGlovoCouriers from '@iconify-icons/arcticons/glovo-couriers';

const SavedAddressDetails = ({ savedAddress, deliveryDetails }) => {
  if (!savedAddress) return null;

  return (
    <div className="my-8 p-6 border-2 border-primarycolor rounded-lg">
      <h3 className="text-2xl font-semibold text-primarycolor mb-6">SAVED DELIVERY DETAILS</h3>

      <div className="space-y-2">
        <p className="text-lg">
          <span className="font-medium text-primarycolor">Delivery Option: </span>
          <span className="text-secondarycolor">{savedAddress.delivery_option}</span>
        </p>

        {savedAddress.area && (
          <p className="text-lg">
            <span className="font-medium text-primarycolor">Area: </span>
            <span className="text-secondarycolor">{savedAddress.area}</span>
          </p>
        )}

        {savedAddress.pickup_point && (
          <p className="text-lg">
            <span className="font-medium text-primarycolor">Pickup Point: </span>
            <span className="text-secondarycolor">{savedAddress.pickup_point}</span>
          </p>
        )}

        {savedAddress.courier_service && (
          <p className="text-lg">
            <span className="font-medium text-primarycolor">Courier Service: </span>
            <span className="text-secondarycolor">{savedAddress.courier_service}</span>
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h4 className="text-lg font-medium text-primarycolor">Reminder</h4>
          <p className="text-secondarycolor leading-relaxed">
            {deliveryDetails?.description}
          </p>
        </div>
        <p className="text-lg">
          <span className="font-medium text-primarycolor">Delivery Cost: </span>
          <span className="text-secondarycolor">Ksh. {deliveryDetails?.cost}</span>
        </p>
      </div>
    </div>
  );
}

export default function DeliveryAddress() {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchDeliveryAddresses, getCurrentUserAddress, saveUserAddress, getDeliveryOptionDetails, getFullDeliveryDetails, deleteUserAddress } = useSupabase();

  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [currentDetails, setCurrentDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);

  const getSavedAddressDetails = (savedAddress, deliveryOptions) => {
    if (!savedAddress || !deliveryOptions.length) return null;

    const option = deliveryOptions.find(opt => opt.id === savedAddress.delivery_option);
    if (!option) return null;

    let details;
    if (savedAddress.delivery_option === 'Nairobi Delivery') {
      details = option.addresses.find(addr => addr.area === savedAddress.area);
    } else if (savedAddress.delivery_option === 'CBD Pickup Point') {
      details = option.addresses.find(addr => addr.pickup_point_name === savedAddress.pickup_point);
    } else if (savedAddress.delivery_option === 'Rest of Kenya') {
      details = option.addresses.find(addr =>
        addr.region === savedAddress.region &&
        addr.area === savedAddress.area &&
        addr.courier === savedAddress.courier_service
      );
    }
    return details;
  };

  useEffect(() => {
    const loadDeliveryAddresses = async () => {
      try {
        const addresses = await fetchDeliveryAddresses();
        const uniqueOptions = Array.from(new Set(addresses.map(addr => addr.option_name)));

        const groupedOptions = uniqueOptions.map(optionName => {
          const relatedAddresses = addresses.filter(addr => addr.option_name === optionName);
          return {
            id: optionName,
            name: optionName,
            addresses: relatedAddresses
          };
        });

        setDeliveryOptions(groupedOptions);
      } catch (error) {
        console.error('Error loading delivery addresses:', error);
      }
    };

    loadDeliveryAddresses();
  }, [fetchDeliveryAddresses]);

  useEffect(() => {
    const loadSavedAddress = async () => {
      if (user) {
       
        const fullDetails = await getFullDeliveryDetails(user.id);
        if (fullDetails) {
          setSavedAddress(fullDetails);
          setDeliveryDetails(fullDetails.deliveryDetails);
          setSelectedOption(fullDetails.delivery_option);
          setSelectedArea(fullDetails.area);
          setSelectedCourier(fullDetails.courier_service);
          setSelectedPickupPoint(fullDetails.pickup_point);
          setCurrentDetails(fullDetails.deliveryDetails);
          setIsEditing(false);
        } else {
          setIsEditing(true);
          setCurrentDetails(null);
        }
      }
    };
    loadSavedAddress();
  }, [user, getFullDeliveryDetails]);

  const handleOptionSelect = async (optionId) => {
    setSelectedOption(optionId);
    resetSelections();
    const option = deliveryOptions.find(opt => opt.id === optionId);

    // Get delivery details for the selected option
    const details = await getDeliveryOptionDetails(optionId);
    setCurrentDetails(details);

    setSelectedAddress({
      ...option,
      availableRegions: [...new Set(option.addresses.map(addr => addr.region))],
      availableAreas: [...new Set(option.addresses.map(addr => addr.area))],
      availableCouriers: [...new Set(option.addresses.map(addr => addr.courier))],
      availablePickupPoints: [...new Set(option.addresses.map(addr => addr.pickup_point_name))]
    });
  };

  const resetSelections = () => {
    setSelectedRegion('');
    setSelectedArea('');
    setSelectedCourier('');
    setSelectedPickupPoint('');
    setCurrentDetails(null);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    const option = deliveryOptions.find(opt => opt.id === selectedOption);
    const details = option.addresses.find(addr => addr.area === area);
    setCurrentDetails(details);
  };

  const handlePickupPointSelect = (point) => {
    setSelectedPickupPoint(point);
    const option = deliveryOptions.find(opt => opt.id === selectedOption);
    const details = option.addresses.find(addr => addr.pickup_point_name === point);
    setCurrentDetails(details);
  };

  // First, update how getDeliveryOptionDetails is called in handleCountrywideSelect
const handleCountrywideSelect = (field, value) => {
  switch (field) {
    case 'region':
      setSelectedRegion(value);
      break;
    case 'area':
      setSelectedArea(value);
      break;
    case 'courier':
      setSelectedCourier(value);
      break;
  }

  const option = deliveryOptions.find(opt => opt.id === selectedOption);
  const details = option.addresses.find(addr =>
    addr.region === (field === 'region' ? value : selectedRegion) &&
    addr.area === (field === 'area' ? value : selectedArea) &&
    addr.courier === (field === 'courier' ? value : selectedCourier)
  );

  if (details) {
    setCurrentDetails(details);
  }
};


  const { setDeliveryCost } = useCart();
  const handleSaveAddress = async () => {
    try {
      if (!currentDetails || !user) return;

      const addressDetails = {
        selectedOption,
        selectedArea,
        selectedCourier,
        selectedPickupPoint
      };

      const savedAddress = await saveUserAddress(user.id, addressDetails);
      setDeliveryCost(savedAddress.cost);
      router.push('/cart');
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };
  const handleChangeAddress = async () => {
    try {
      if (savedAddress?.id) {
        await deleteUserAddress(savedAddress.id);
      }
      setIsEditing(true);
      setSavedAddress(null);
      setSelectedOption('');
      setSelectedRegion('');
      setSelectedArea('');
      setSelectedCourier('');
      setSelectedPickupPoint('');
      setCurrentDetails(null);
    } catch (error) {
      console.error('Error changing address:', error);
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center justify-center border-b shadow-sm">
        <button
          onClick={() => router.back()}
          className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-primarycolor" />
        </button>
        <h1 className="text-xl font-bold text-primarycolor">DELIVERY ADDRESS</h1>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6">
          {/* Your existing content sections */}
          <div className="text-left my-8">
            <h2 className="text-4xl font-semibold text-primarycolor">CHOOSE YOUR</h2>
            <h2 className="text-4xl font-semibold text-primarycolor">DELIVERY OPTION</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-primarycolor">
            {deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => !savedAddress || isEditing ? handleOptionSelect(option.id) : null}
                className={`
             flex flex-col items-center space-y-4
             ${(!savedAddress || isEditing) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
             ${savedAddress && savedAddress.delivery_option === option.id ? 'opacity-100' : ''}
           `}
                disabled={savedAddress && !isEditing}
              >
                <div className={`
                    p-6 rounded-xl transition-all duration-200 w-full aspect-square flex items-center justify-center
                    ${selectedOption === option.id
                    ? 'bg-primarycolor'
                    : 'bg-white border border-primarycolor hover:border-primarycolor'
                  }
                  `}>
                  {option.id === 'Nairobi Delivery' && (
                    <Icon
                      icon="material-symbols-light:home-outline"
                      className={`w-10 h-10 ${selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'CBD Pickup Point' && (
                    <Icon
                      icon={arcticonsGlovoCouriers}
                      className={`w-10 h-10 ${selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'Rest of Kenya' && (
                    <Icon
                      icon="mdi:courier-fast"
                      className={`w-10 h-10 ${selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                </div>
                <span className={`
                    text-sm font-medium text-center
                    ${selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}
                  `}>
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          {/* Form/Saved Address Section */}
          {isEditing ? (
            <>
              {/* Form Section */}
              {selectedOption && selectedAddress && (
                <div className="space-y-6">
                  {selectedOption === 'Nairobi Delivery' && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-primarycolor">AREA</span>
                      <select
                        value={selectedArea}
                        onChange={(e) => handleAreaSelect(e.target.value)}
                        className="w-1/2 p-2 bg-primarycolor text-secondarycolor rounded-lg outline-none"
                      >
                        <option value="">Select Area</option>
                        {selectedAddress.availableAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedOption === 'CBD Pickup Point' && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-primarycolor">PICKUP POINT</span>
                      <select
                        value={selectedPickupPoint}
                        onChange={(e) => handlePickupPointSelect(e.target.value)}
                        className="w-1/2 p-2 bg-primarycolor text-secondarycolor rounded-lg outline-none"
                      >
                        <option value="">Select Point</option>
                        {selectedAddress.availablePickupPoints.map(point => (
                          <option key={point} value={point}>{point}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedOption === 'Rest of Kenya' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-primarycolor">REGION</span>
                        <select
                          value={selectedRegion}
                          onChange={(e) => handleCountrywideSelect('region', e.target.value)}
                          className="w-1/2 p-2 bg-primarycolor text-secondarycolor rounded-lg outline-none"
                        >
                          <option value="">Select Region</option>
                          {selectedAddress.availableRegions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-primarycolor">AREA</span>
                        <select
                          value={selectedArea}
                          onChange={(e) => handleCountrywideSelect('area', e.target.value)}
                          className="w-1/2 p-2 bg-primarycolor text-secondarycolor rounded-lg outline-none"
                        >
                          <option value="">Select Area</option>
                          {selectedAddress.availableAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-primarycolor">COURIER SERVICE</span>
                        <select
                          value={selectedCourier}
                          onChange={(e) => handleCountrywideSelect('courier', e.target.value)}
                          className="w-1/2 p-2 bg-primarycolor text-secondarycolor rounded-lg outline-none"
                        >
                          <option value="">Select Courier</option>
                          {selectedAddress.availableCouriers.map(courier => (
                            <option key={courier} value={courier}>{courier}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description and Cost Section */}
              {currentDetails && (
                <div className="mt-6 space-y-4">
                  <p className="text-secondarycolor leading-relaxed">
                    {currentDetails.description}
                  </p>
                  <p className="text-primarycolor font-semibold">
                    Delivery Cost: Ksh. {currentDetails.cost}
                  </p>
                </div>
              )}
            </>
          ) : (
            savedAddress && (
              <SavedAddressDetails
                savedAddress={savedAddress}
                deliveryDetails={currentDetails}
              />
            )
          )}

          {/* Add bottom padding to account for floating button */}
          <div className="h-24"></div>
        </div>
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={isEditing ? handleSaveAddress : handleChangeAddress}
            disabled={isEditing && !currentDetails}
            className={`
                w-full py-4 px-6 rounded-full text-white text-lg font-medium
                transition-all duration-200 transform
                ${isEditing && !currentDetails
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primarycolor hover:bg-primarycolor hover:scale-105 shadow-lg'
              }
              `}
          >
            {isEditing ? 'Save Address' : 'Change Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
