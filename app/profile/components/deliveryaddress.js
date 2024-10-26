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
          <p className="text-secondarycolor leading-relaxed">{deliveryDetails?.description}</p>
        </div>
        <p className="text-lg">
          <span className="font-medium text-primarycolor">Delivery Cost: </span>
          <span className="text-secondarycolor">Ksh. {deliveryDetails?.cost}</span>
        </p>
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
  });

  useEffect(() => {
    const initializeAddresses = async () => {
      if (!user) return;

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
  }, [user]);

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
      selectedOption: '',
      selectedRegion: '',
      selectedArea: '',
      selectedCourier: '',
      selectedPickupPoint: '',
      currentDetails: null
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center justify-center border-b shadow-sm">
        <button
          onClick={() => router.back()}
          className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-primarycolor" />
        </button>
        <h1 className="text-xl font-bold text-primarycolor">DELIVERY ADDRESS</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-left my-8">
            <h2 className="text-4xl font-semibold text-primarycolor">CHOOSE YOUR</h2>
            <h2 className="text-4xl font-semibold text-primarycolor">DELIVERY OPTION</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-primarycolor">
            {state.deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => state.isEditing && handleSelection('selectedOption', option.id)}
                disabled={!state.isEditing}
                className={`
                  flex flex-col items-center space-y-4
                  ${!state.isEditing && 'opacity-50 pointer-events-none'}
                  ${state.selectedOption === option.id ? 'opacity-100' : ''}
                `}
              >
                <div className={`
                  p-6 rounded-xl transition-all duration-200 w-full aspect-square 
                  flex items-center justify-center
                  ${!state.isEditing && 'opacity-50'}
                  ${state.selectedOption === option.id
                    ? 'bg-primarycolor'
                    : 'bg-white border border-primarycolor hover:border-primarycolor'
                  }
                `}>
                  {option.id === 'Nairobi Delivery' && (
                    <Icon
                      icon="material-symbols-light:home-outline"
                      className={`w-10 h-10 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'CBD Pickup Point' && (
                    <Icon
                      icon={arcticonsGlovoCouriers}
                      className={`w-10 h-10 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                  {option.id === 'Rest of Kenya' && (
                    <Icon
                      icon="mdi:courier-fast"
                      className={`w-10 h-10 ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}`}
                    />
                  )}
                </div>
                <span className={`text-sm font-medium text-center 
                  ${state.selectedOption === option.id ? 'text-secondarycolor' : 'text-primarycolor'}
                  ${!state.isEditing && 'opacity-50'}
                `}>
                  {option.name}
                </span>
              </button>
            ))}
          </div>
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
          <div className="h-24"></div>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={state.isEditing ? handleSaveAddress : handleChangeAddress}
            disabled={state.isEditing && !state.currentDetails}
            className={`
              w-full py-4 px-6 rounded-full text-white text-lg font-medium
              transition-all duration-200 transform
              ${state.isEditing && !state.currentDetails
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primarycolor hover:bg-primarycolor hover:scale-105 shadow-lg'
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
