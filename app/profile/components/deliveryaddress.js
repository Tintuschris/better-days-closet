'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseContext } from '../../context/supabaseContext';
import { useCart } from '../../context/cartContext';
import { Icon } from '@iconify/react';
import arcticonsGlovoCouriers from '@iconify-icons/arcticons/glovo-couriers';
import { Button, Input, FormGroup, Label, GlassContainer, PremiumCard, GradientText } from '../../components/ui';
import { createClient } from '../../lib/supabase';

const SavedAddressDetails = ({ savedAddress, deliveryDetails }) => {
  if (!savedAddress) return null;

  return (
    <PremiumCard className="overflow-hidden">
      <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 p-6">
        <GradientText className="text-xl font-semibold text-white">
          Current Delivery Details
        </GradientText>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-full">
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
    </PremiumCard>
  );
};

export default function DeliveryAddress() {
  const router = useRouter();
  const { user, supabase } = useSupabaseContext();
  const { setDeliveryCost } = useCart();
  const queryClient = useQueryClient();

  const [state, setState] = useState({
    selectedOption: '',
    selectedRegion: '',
    selectedArea: '',
    selectedCourier: '',
    selectedPickupPoint: '',
    currentDetails: null,
    isEditing: false,
  });

  // Fetch delivery addresses using React Query
  const { data: deliveryAddresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['delivery-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('delivery_addresses').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's saved address using React Query
  const { data: savedAddress, isLoading: savedAddressLoading, refetch: refetchSavedAddress } = useQuery({
    queryKey: ['user-address', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Process delivery options
  const deliveryOptions = useMemo(() => {
    if (!deliveryAddresses.length) return [];

    const uniqueOptions = Array.from(new Set(deliveryAddresses.map(addr => addr.option_name)));
    return uniqueOptions.map(optionName => ({
      id: optionName,
      name: optionName,
      addresses: deliveryAddresses.filter(addr => addr.option_name === optionName)
    }));
  }, [deliveryAddresses]);

  // Initialize state when saved address is loaded
  useEffect(() => {
    if (savedAddress && !state.isEditing) {
      setState(prev => ({
        ...prev,
        selectedOption: savedAddress.delivery_option || '',
        selectedArea: savedAddress.area || '',
        selectedCourier: savedAddress.courier_service || '',
        selectedPickupPoint: savedAddress.pickup_point || '',
        isEditing: false,
      }));
    } else if (!savedAddress && !savedAddressLoading) {
      setState(prev => ({ ...prev, isEditing: true }));
    }
  }, [savedAddress, savedAddressLoading]);

  const handleSelection = (field, value) => {
    const updatedState = { ...state, [field]: value };
    
    if (field === 'selectedOption') {
      updatedState.selectedRegion = '';
      updatedState.selectedArea = '';
      updatedState.selectedCourier = '';
      updatedState.selectedPickupPoint = '';
    }

    const option = deliveryOptions.find(opt => opt.id === updatedState.selectedOption);
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

  // Save address mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (addressData) => {
      // Get delivery option details
      let deliveryDetails;
      const option = deliveryOptions.find(opt => opt.id === addressData.selectedOption);

      if (option) {
        switch (addressData.selectedOption) {
          case 'Nairobi Delivery':
            deliveryDetails = option.addresses.find(addr => addr.area === addressData.selectedArea);
            break;
          case 'CBD Pickup Point':
            deliveryDetails = option.addresses.find(addr => addr.pickup_point_name === addressData.selectedPickupPoint);
            break;
          case 'Rest of Kenya':
            deliveryDetails = option.addresses.find(addr =>
              addr.region === addressData.selectedRegion &&
              addr.area === addressData.selectedArea &&
              addr.courier === addressData.selectedCourier
            );
            break;
        }
      }

      if (!deliveryDetails) throw new Error('Delivery details not found');

      // Delete existing address
      await supabase.from('addresses').delete().eq('user_id', user.id);

      // Insert new address
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          delivery_option: addressData.selectedOption,
          area: addressData.selectedArea,
          courier_service: addressData.selectedCourier || '',
          pickup_point: addressData.selectedPickupPoint || '',
          cost: deliveryDetails.cost,
          description: deliveryDetails.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries(['user-address', user?.id]);
      queryClient.invalidateQueries(['address', user?.id]); // For main context

      setState(prev => ({ ...prev, isEditing: false }));
      setDeliveryCost(Number(data.cost));

      // Optionally navigate back
      // router.push('/profile');
    },
    onError: (error) => {
      console.error('Error saving address:', error);
    }
  });

  const handleSaveAddress = () => {
    if (!state.currentDetails || !user) return;

    const addressData = {
      selectedOption: state.selectedOption,
      selectedArea: state.selectedArea,
      selectedCourier: state.selectedCourier,
      selectedPickupPoint: state.selectedPickupPoint,
      selectedRegion: state.selectedRegion,
    };

    saveAddressMutation.mutate(addressData);
  };

  const handleChangeAddress = () => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      selectedOption: savedAddress?.delivery_option || '',
      selectedRegion: '',
      selectedArea: savedAddress?.area || '',
      selectedCourier: savedAddress?.courier_service || '',
      selectedPickupPoint: savedAddress?.pickup_point || '',
      currentDetails: null
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <GradientText className="text-lg font-semibold">
            Delivery Address
          </GradientText>

          <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 relative">
        {/* Loading State */}
        {(addressesLoading || savedAddressLoading) && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primarycolor mx-auto mb-4"></div>
              <p className="text-primarycolor">Loading addresses...</p>
            </div>
          </div>
        )}

        {/* Premium title when in editing mode */}
        {!addressesLoading && !savedAddressLoading && state.isEditing && (
          <PremiumCard className="p-6 mb-6 text-center">
            <GradientText className="text-2xl font-bold mb-2">
              Choose Your Delivery Option
            </GradientText>
            <p className="text-primarycolor/70">
              Select the most convenient delivery method for your order
            </p>
          </PremiumCard>
        )}

        {/* Premium Delivery Options Grid */}
        {!addressesLoading && !savedAddressLoading && state.isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {deliveryOptions.map((option) => (
              <GlassContainer
                key={option.id}
                className={`p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  state.selectedOption === option.id
                    ? 'bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 border-primarycolor/50 shadow-lg shadow-primarycolor/20'
                    : 'hover:shadow-lg hover:shadow-primarycolor/10'
                }`}
                onClick={() => handleSelection('selectedOption', option.id)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`
                    p-4 rounded-2xl transition-all duration-200
                    w-16 h-16 flex items-center justify-center
                    ${state.selectedOption === option.id
                      ? 'bg-gradient-to-br from-primarycolor to-primarycolor/90'
                      : 'bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10'
                    }
                  `}>
                    {option.id === 'Nairobi Delivery' && (
                      <Icon
                        icon="material-symbols-light:home-outline"
                        className={`w-8 h-8 ${state.selectedOption === option.id ? 'text-white' : 'text-primarycolor'}`}
                      />
                    )}
                    {option.id === 'CBD Pickup Point' && (
                      <Icon
                        icon={arcticonsGlovoCouriers}
                        className={`w-8 h-8 ${state.selectedOption === option.id ? 'text-white' : 'text-primarycolor'}`}
                      />
                    )}
                    {option.id === 'Rest of Kenya' && (
                      <Icon
                        icon="mdi:courier-fast"
                        className={`w-8 h-8 ${state.selectedOption === option.id ? 'text-white' : 'text-primarycolor'}`}
                      />
                    )}
                  </div>
                  <span className={`font-medium ${
                    state.selectedOption === option.id ? 'text-primarycolor' : 'text-primarycolor/80'
                  }`}>
                    {option.name}
                  </span>
                </div>
              </GlassContainer>
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
                  {deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => (
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
                  {deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => (
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
                    {[...new Set(deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses.map(addr => addr.region))].map(region => (
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
                    {deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses
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
                    {deliveryOptions.find(opt => opt.id === state.selectedOption)?.addresses
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
            savedAddress={savedAddress}
            deliveryDetails={state.currentDetails}
          />
        )}
          
        {/* Premium Action Button */}
        <div className="mt-8">
          <Button
            onClick={state.isEditing ? handleSaveAddress : handleChangeAddress}
            disabled={(state.isEditing && !state.currentDetails) || saveAddressMutation.isPending}
            loading={saveAddressMutation.isPending}
            variant="primary"
            size="lg"
            radius="full"
            fullWidth
            className="shadow-lg shadow-primarycolor/30"
          >
            {saveAddressMutation.isPending
              ? 'Saving...'
              : state.isEditing
                ? 'Save Address'
                : 'Change Address'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
