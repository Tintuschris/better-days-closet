'use client';

import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import DeliveryAddressesForm from '../components/deliveryaddressform';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';

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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Delivery Addresses</h1>
        <button
          onClick={() => setSelectedAddress(null)}
          className="bg-primarycolor hover:bg-primarycolor/90 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Add New Address
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses?.map((address) => (
          <div
            key={address.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-800">
                {address.option_name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedAddress(address)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <p className="flex justify-between">
                <span>Region:</span>
                <span className="font-medium">{address.region}</span>
              </p>
              <p className="flex justify-between">
                <span>Area:</span>
                <span className="font-medium">{address.area}</span>
              </p>
              <p className="flex justify-between">
                <span>Delivery Cost:</span>
                <span className="font-medium text-green-600">
                  ${address.cost.toFixed(2)}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Courier:</span>
                <span className="font-medium">{address.courier}</span>
              </p>
              {address.pickup_point_name && (
                <p className="flex justify-between">
                  <span>Pickup Point:</span>
                  <span className="font-medium">{address.pickup_point_name}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

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
