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
    <div className="bg-white rounded-2xl shadow-lg border-2 border-primarycolor/10 overflow-hidden">
      <div className="bg-primarycolor p-6">
        <h3 className="text-xl font-semibold text-secondarycolor">Current Delivery Details</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primarycolor/10 rounded-full">
            {savedAddress.delivery_option === 'Nairobi Delivery' && (
              <Icon icon="material-symbols-light:home-outline" className="w-6 h-6 text-primarycolor" />
            )}
            {savedAddress.delivery_option === 'CBD Pickup Point' && (
              <Icon icon={arcticonsGlovoCouriers} className="w-6 h-6 text-primarycolor" />
            )}
            {savedAddress.delivery_option === 'Rest of Kenya' && (
              <Icon icon="mdi:courier-fast" className="w-6 h-6 text-primarycolor" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-medium text-primarycolor">{savedAddress.delivery_option}</h4>
            {savedAddress.area && (
              <p className="text-secondarycolor mt-1">
                Area: <span className="font-medium">{savedAddress.area}</span>
              </p>
            )}
            {savedAddress.pickup_point && (
              <p className="text-secondarycolor mt-1">
                Pickup Point: <span className="font-medium">{savedAddress.pickup_point}</span>
              </p>
            )}
            {savedAddress.courier_service && (
              <p className="text-secondarycolor mt-1">
                Courier: <span className="font-medium">{savedAddress.courier_service}</span>
              </p>
            )}
          </div>
        </div>

        {deliveryDetails && (
          <div className="border-t border-primarycolor/10 pt-6">
            <div className="bg-primarycolor/5 rounded-xl p-4">
              <p className="text-sm text-primarycolor/80 leading-relaxed">
                {deliveryDetails.description}
              </p>
              <p className="text-lg font-semibold text-primarycolor mt-3">
                Delivery Cost: Ksh. {deliveryDetails.cost}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DeliveryAddress() {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchDeliveryAddresses, getCurrentUserAddress, saveUserAddress, getDeliveryOptionDetails, getFullDeliveryDetails } = useSupabase();
  const { setDeliveryCost } = useCart();

  const [state, setState] = useState({
    deliveryOptions: [],
    selectedOption: '',
    selectedRegion: '',
    selectedArea: '',
    selectedCourier: '',
    selectedPickupPoint: '',
    currentDetails: null,
    isEditing: false,
    savedAddress: null,
    isInitialized: false
  });

  useEffect(() => {
    const initializeAddresses = async () => {
      if (!user || state.isInitialized) return;

      try {
        const [addresses, userFullDetails] = await Promise.all([
          fetchDeliveryAddresses(),
          getFullDeliveryDetails(user.id)
        ]);

        const uniqueOptions = Array.from(new Set(addresses.map(addr => addr.option_name)));
        const groupedOptions = uniqueOptions.map(optionName => ({
          id: optionName,
          name: optionName,
          addresses: addresses.filter(addr => addr.option_name === optionName)
        }));

        setState(prev => ({
          ...prev,
          deliveryOptions: groupedOptions,
          isEditing: !userFullDetails,
          isInitialized: true,
          ...(userFullDetails && {
            savedAddress: userFullDetails,
            selectedOption: userFullDetails.delivery_option,
            selectedArea: userFullDetails.area,
            selectedCourier: userFullDetails.courier_service,
            selectedPickupPoint: userFullDetails.pickup_point,
            currentDetails: userFullDetails.deliveryDetails,
          })
        }));
      } catch (error) {
        console.error('Error initializing addresses:', error);
      }
    };

    initializeAddresses();
  }, [fetchDeliveryAddresses, getFullDeliveryDetails, user, state.isInitialized]);

  const handleSelection = (field, value) => {
    const updatedState = { ...state, [field]: value };
    
    if (field === 'selectedOption') {
      updatedState.selectedRegion = '';
      updatedState.selectedArea = '';
      updatedState.selectedCourier = '';
      updatedState.selectedPickupPoint = '';
    }

    const option = state.deliveryOptions.find(opt => opt.id === updatedState.selectedOption);
    if (option) {
      let details;
      switch (updatedState.selectedOption) {
        case 'Nairobi Delivery':
          details = option.addresses.find(addr => addr.area === updatedState.selectedArea);
          break;
        case 'CBD Pickup Point':
          details = option.addresses.find(addr => addr.pickup_point_name === updatedState.selectedPickupPoint);
          break;
        case 'Rest of Kenya':
          details = option.addresses.find(addr => 
            addr.region === updatedState.selectedRegion && 
            addr.area === updatedState.selectedArea && 
            addr.courier === updatedState.selectedCourier
          );
          break;
      }
      updatedState.currentDetails = details || null;
    }

    setState(updatedState);
  };

  const handleSaveAddress = async () => {
    if (!state.currentDetails || !user) return;

    try {
      const addressDetails = {
        selectedOption: state.selectedOption,
        selectedArea: state.selectedArea,
        selectedCourier: state.selectedCourier,
        selectedPickupPoint: state.selectedPickupPoint
      };

      const savedAddress = await saveUserAddress(user.id, addressDetails);
      setState(prev => ({
        ...prev,
        savedAddress,
        isEditing: false
      }));
      setDeliveryCost(savedAddress.cost);
      router.push('/cart');
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleChangeAddress = () => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      selectedOption: prev.savedAddress?.delivery_option || '',
      selectedRegion: '',
      selectedArea: prev.savedAddress?.area || '',
      selectedCourier: prev.savedAddress?.courier_service || '',
      selectedPickupPoint: prev.savedAddress?.pickup_point || '',
      currentDetails: null
    }));
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Updated header */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <button onClick={() => router.back()} className="text-primarycolor">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-primarycolor mx-auto">DELIVERY ADDRESS</h1>
        <div className="w-5"></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 relative">
        {/* Only show title when in editing mode */}
        {state.isEditing && (
          <div className="text-left mb-8">
            <h2 className="text-3xl font-semibold text-primarycolor">CHOOSE YOUR</h2>
            <h2 className="text-3xl font-semibold text-primarycolor">DELIVERY OPTION</h2>
          </div>
        )}

        {/* Delivery options - reduced size and increased border radius */}
        {state.isEditing && (
          <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-primarycolor">
            {state.deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelection('selectedOption', option.id)}
                className={`
                  flex flex-col items-center space-y-3
                `}
              >
                <div className={`
                  p-4 rounded-2xl transition-all duration-200
                  w-full max-w-[120px] md:max-w-[140px] aspect-square 
                  flex items-center justify-center
                  ${state.selectedOption === option.id
                    ? 'bg-primarycolor'
                    : 'bg-white border-2 border-primarycolor hover:border-primarycolor/80 hover:bg-primarycolor/5'
                  }
                `}>
                  {option.id === 'Nairobi Delivery' && (
                    <Icon
                      icon="material-symbols-light:home-outline"
                      className={`w-8 h-8 md:w-9 md:h-9 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'CBD Pickup Point' && (
                    <Icon
                      icon={arcticonsGlovoCouriers}
                      className={`w-8 h-8 md:w-9 md:h-9 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'Rest of Kenya' && (
                    <Icon
                      icon="mdi:courier-fast"
                      className={`w-8 h-8 md:w-9 md:h-9 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                </div>
                <span className={`text-sm font-medium text-center 
                  ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}
                `}>
                  {option.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {state.isEditing ? (
          <>
            {state.selectedOption === 'Nairobi Delivery' && (
              <div className="flex items-center justify-between mb-4">
                <span className="w-1/2 text-lg font-medium text-primarycolor">AREA</span>
                <select
                  value={state.selectedArea}
                  onChange={(e) => handleSelection('selectedArea', e.target.value)}
                  className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="">Select Area</option>
                  {state.deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => (
                    <option key={addr.area} value={addr.area}>{addr.area}</option>
                  ))}
                </select>
              </div>
            )}

            {state.selectedOption === 'CBD Pickup Point' && (
              <div className="flex items-center justify-between mb-4">
                <span className="w-1/2 text-lg font-medium text-primarycolor">PICKUP POINT</span>
                <select
                  value={state.selectedPickupPoint}
                  onChange={(e) => handleSelection('selectedPickupPoint', e.target.value)}
                  className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="">Select Pickup Point</option>
                  {state.deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => (
                    <option key={addr.pickup_point_name} value={addr.pickup_point_name}>
                      {addr.pickup_point_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {state.selectedOption === 'Rest of Kenya' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-1/2 text-lg font-medium text-primarycolor">REGION</span>
                  <select
                                        value={state.selectedRegion}
                    onChange={(e) => handleSelection('selectedRegion', e.target.value)}
                    className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1em'
                    }}
                  >
                    <option value="">Select Region</option>
                    {[...new Set(state.deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => addr.region))].map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="w-1/2 text-lg font-medium text-primarycolor">AREA</span>
                  <select
                    value={state.selectedArea}
                    onChange={(e) => handleSelection('selectedArea', e.target.value)}
                    className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1em'
                    }}
                  >
                    <option value="">Select Area</option>
                    {state.deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses
                      .filter(addr => addr.region === state.selectedRegion)
                      .map(addr => (
                        <option key={addr.area} value={addr.area}>{addr.area}</option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="w-1/2 text-lg font-medium text-primarycolor">COURIER SERVICE</span>
                  <select
                    value={state.selectedCourier}
                    onChange={(e) => handleSelection('selectedCourier', e.target.value)}
                    className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1em'
                    }}
                  >
                    <option value="">Select Courier Service</option>
                    {state.deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses
                      .filter(addr => addr.region === state.selectedRegion && addr.area === state.selectedArea)
                      .map(addr => (
                        <option key={addr.courier} value={addr.courier}>{addr.courier}</option>
                      ))}
                  </select>
                </div>
              </>
            )}

            {state.currentDetails && (
              <div className="mt-6 space-y-4">
                <p className="text-secondarycolor leading-relaxed">{state.currentDetails.description}</p>
                <p className="text-primarycolor font-semibold">Delivery Cost: Ksh. {state.currentDetails.cost}</p>
              </div>
            )}
          </>
        ) : (
          <SavedAddressDetails 
            savedAddress={state.savedAddress} 
            deliveryDetails={state.currentDetails} 
          />
        )}
          
        {/* Single action button that works for both states */}
        <div className="mt-12">
          <button
            onClick={state.isEditing ? handleSaveAddress : handleChangeAddress}
            disabled={state.isEditing && !state.currentDetails}
            className={`
              w-full py-4 px-6 rounded-full text-white text-lg font-medium
              transition-all duration-200 transform
              ${state.isEditing && !state.currentDetails
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primarycolor hover:bg-primarycolor/90 hover:scale-[1.02] shadow-lg'
              }
            `}
          >
            {state.isEditing ? 'Save Address' : 'Change Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
