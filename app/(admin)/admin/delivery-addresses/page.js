'use client';

import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import DeliveryAddressesForm from '../components/deliveryaddressform';
import { FiEdit2, FiTrash2, FiPlus, FiMapPin, FiDollarSign, FiTruck } from 'react-icons/fi';
import { toast } from 'sonner';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

export default function DeliveryAddressesPage() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { useDeliveryAddresses, useDeleteDeliveryAddress } = useSupabase();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: addresses, isLoading } = useDeliveryAddresses();
  const deleteAddressMutation = useDeleteDeliveryAddress();

  const handleDelete = async (id) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      toast.success('Delivery address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete delivery address');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl lg:text-3xl font-bold mb-2">
            Delivery Addresses
          </GradientText>
          <p className="text-primarycolor/70">
            Manage delivery locations and shipping costs for your customers
          </p>
        </div>
        <Button
          onClick={() => setSelectedAddress(null)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Locations</p>
              <p className="text-2xl font-bold text-primarycolor">{addresses?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiMapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Avg. Cost</p>
              <p className="text-2xl font-bold text-green-600">
                Ksh. {addresses?.length > 0 ? Math.round(addresses.reduce((sum, addr) => sum + Number(addr.cost || 0), 0) / addresses.length) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Coverage</p>
              <p className="text-2xl font-bold text-purple-600">
                {addresses?.length || 0} Areas
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses?.map((address) => (
          <PremiumCard
            key={address.id}
            className="p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primarycolor/10 to-primarycolor/20 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-primarycolor" />
                </div>
                <h3 className="font-semibold text-lg text-primarycolor">
                  {address.option_name}
                </h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedAddress(address)}
                  className="p-2 text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
                  title="Edit address"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete address"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-primarycolor/70">Region:</span>
                <span className="font-medium text-primarycolor">{address.region}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-primarycolor/70">Area:</span>
                <span className="font-medium text-primarycolor">{address.area}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-primarycolor/70">Delivery Cost:</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <FiDollarSign className="w-3 h-3" />
                  Ksh. {Number(address.cost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-primarycolor/70">Courier:</span>
                <span className="font-medium text-primarycolor">{address.courier}</span>
              </div>
              {address.pickup_point_name && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-primarycolor/70">Pickup Point:</span>
                  <span className="font-medium text-primarycolor">{address.pickup_point_name}</span>
                </div>
              )}
            </div>
          </PremiumCard>
        ))}
      </div>

      {addresses?.length === 0 && (
        <PremiumCard className="p-8 text-center">
          <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-primarycolor/60" />
          </div>
          <p className="text-primarycolor/70 mb-4">No delivery addresses found. Add your first delivery location to get started.</p>
          <Button
            onClick={() => setSelectedAddress(null)}
            variant="primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add First Address
          </Button>
        </PremiumCard>
      )}

      {/* Form Modal */}
{selectedAddress !== undefined && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
    <div className="min-h-screen px-4 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DeliveryAddressesForm
          address={selectedAddress}
          onClose={() => setSelectedAddress(undefined)}
        />
      </div>
    </div>
  </div>
)}

    </div>
  );
}
