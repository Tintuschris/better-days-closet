"use client";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Icon } from '@iconify/react';
import arcticonsGlovoCouriers from '@iconify-icons/arcticons/glovo-couriers';
import { useSupabase } from '../(admin)/admin/hooks/useSupabase';

export default function DeliveryModal({ onClose, onSelect }) {
  const { useDeliveryAddresses } = useSupabase();
  const { data: deliveryAddresses } = useDeliveryAddresses();

  const [state, setState] = useState({
    selectedOption: '',
    selectedRegion: '',
    selectedArea: '',
    selectedCourier: '',
    selectedPickupPoint: '',
    currentDetails: null
  });

  const handleSelection = (field, value) => {
    const updatedState = { ...state, [field]: value };
    
    if (field === 'selectedOption') {
      // Reset other fields when option changes
      updatedState.selectedRegion = '';
      updatedState.selectedArea = '';
      updatedState.selectedCourier = '';
      updatedState.selectedPickupPoint = '';
      updatedState.currentDetails = null; // Reset details until all fields are selected
    }

    // Update currentDetails based on complete selection
    const relevantAddress = deliveryAddresses?.find(addr => {
      switch (updatedState.selectedOption) {
        case 'Nairobi Delivery':
          return addr.option_name === 'Nairobi Delivery' && addr.area === updatedState.selectedArea;
        case 'CBD Pickup Point':
          return addr.option_name === 'CBD Pickup Point' && addr.pickup_point_name === updatedState.selectedPickupPoint;
        case 'Rest of Kenya':
          return addr.option_name === 'Rest of Kenya' 
            && addr.region === updatedState.selectedRegion
            && addr.area === updatedState.selectedArea
            && addr.courier === updatedState.selectedCourier;
        default:
          return false;
      }
    });

    if (relevantAddress) {
      updatedState.currentDetails = relevantAddress;
    }

    setState(updatedState);
  };

  const handleConfirm = () => {
    const deliveryData = {
      delivery_option: state.selectedOption,
      region: state.selectedRegion,
      area: state.selectedArea,
      courier_service: state.selectedCourier,
      pickup_point: state.selectedPickupPoint,
      cost: state.currentDetails?.cost,
      description: state.currentDetails?.description
    };
    
    localStorage.setItem('guestDeliveryDetails', JSON.stringify(deliveryData));
    onSelect(deliveryData); // This will be used to update cart state
    onClose();
  };

  const selectStyles = {
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC0CB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-[90%] md:max-w-[600px] p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-primarycolor">CHOOSE YOUR</h2>
            <h2 className="text-2xl md:text-3xl font-semibold text-primarycolor">DELIVERY OPTION</h2>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-primarycolor" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-primarycolor">
          {['Nairobi Delivery', 'CBD Pickup Point', 'Rest of Kenya'].map((option) => (
            <button
              key={option}
              onClick={() => handleSelection('selectedOption', option)}
              className="flex flex-col items-center space-y-2 md:space-y-4"
            >
              <div className={`
                p-4 md:p-6 rounded-xl transition-all duration-200 w-full 
                aspect-square max-w-[120px] md:max-w-[160px] mx-auto
                flex items-center justify-center
                ${state.selectedOption === option
                  ? 'bg-primarycolor'
                  : 'bg-white border border-primarycolor hover:border-primarycolor'
                }
              `}>
                {option === 'Nairobi Delivery' && (
                  <Icon
                    icon="material-symbols-light:home-outline"
                    className={`w-8 h-8 md:w-10 md:h-10 ${state.selectedOption === option ? 'text-secondarycolor' : 'text-primarycolor'}`}
                  />
                )}
                {option === 'CBD Pickup Point' && (
                  <Icon
                    icon={arcticonsGlovoCouriers}
                    className={`w-8 h-8 md:w-10 md:h-10 ${state.selectedOption === option ? 'text-secondarycolor' : 'text-primarycolor'}`}
                  />
                )}
                {option === 'Rest of Kenya' && (
                  <Icon
                    icon="mdi:courier-fast"
                    className={`w-8 h-8 md:w-10 md:h-10 ${state.selectedOption === option ? 'text-secondarycolor' : 'text-primarycolor'}`}
                  />
                )}
              </div>
              <span className={`text-xs md:text-sm font-medium text-center
                ${state.selectedOption === option ? 'text-secondarycolor' : 'text-primarycolor'}
              `}>
                {option}
              </span>
            </button>
          ))}
        </div>
        {state.selectedOption === 'Nairobi Delivery' && (
          <div className="flex items-center justify-between mb-4">
            <span className="w-1/2 text-lg font-medium text-primarycolor">AREA</span>
            <select
              value={state.selectedArea}
              onChange={(e) => handleSelection('selectedArea', e.target.value)}
              className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
              style={selectStyles}
            >
              <option value="">Select Area</option>
              {deliveryAddresses
                ?.filter(addr => addr.option_name === 'Nairobi Delivery')
                .map(addr => (
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
              style={selectStyles}
            >
              <option value="">Select Pickup Point</option>
              {deliveryAddresses
                ?.filter(addr => addr.option_name === 'CBD Pickup Point')
                .map(addr => (
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
                style={selectStyles}
              >
                <option value="">Select Region</option>
                {[...new Set(deliveryAddresses
                  ?.filter(addr => addr.option_name === 'Rest of Kenya')
                  .map(addr => addr.region))]
                  .map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
              </select>
            </div>

            {state.selectedRegion && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-1/2 text-lg font-medium text-primarycolor">AREA</span>
                  <select
                    value={state.selectedArea}
                    onChange={(e) => handleSelection('selectedArea', e.target.value)}
                    className="w-1/2 p-3 bg-primarycolor text-secondarycolor rounded-lg appearance-none cursor-pointer"
                    style={selectStyles}
                  >
                    <option value="">Select Area</option>
                    {deliveryAddresses
                      ?.filter(addr => 
                        addr.option_name === 'Rest of Kenya' && 
                        addr.region === state.selectedRegion
                      )
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
                    style={selectStyles}
                  >
                    <option value="">Select Courier Service</option>
                    {deliveryAddresses
                      ?.filter(addr => 
                        addr.option_name === 'Rest of Kenya' && 
                        addr.region === state.selectedRegion &&
                        addr.area === state.selectedArea
                      )
                      .map(addr => (
                        <option key={addr.courier} value={addr.courier}>{addr.courier}</option>
                      ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {state.currentDetails && (
          <div className="mt-6 space-y-4">
            <p className="text-secondarycolor leading-relaxed">{state.currentDetails.description}</p>
            <p className="text-primarycolor font-semibold">
              Delivery Cost: Ksh. {state.currentDetails.cost}
            </p>
          </div>
        )}

        {((state.selectedOption === 'Nairobi Delivery' && state.selectedArea) ||
          (state.selectedOption === 'CBD Pickup Point' && state.selectedPickupPoint) ||
          (state.selectedOption === 'Rest of Kenya' && state.selectedCourier)) && (
          <button
            onClick={handleConfirm}
            className="w-full py-4 px-6 rounded-full text-white text-lg font-medium
              bg-primarycolor hover:bg-primarycolor hover:scale-105 shadow-lg
              transition-all duration-200 transform mt-6"
          >
            Confirm Selection
          </button>
        )}
      </div>
    </div>
  );
}
