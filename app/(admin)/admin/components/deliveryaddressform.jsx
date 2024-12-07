'use client';
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiX } from 'react-icons/fi';

const DELIVERY_OPTIONS = [
  'Nairobi Delivery',
  'CBD Pickup Point',
  'Rest of Kenya'
];

export default function DeliveryAddressesForm({ address, onClose }) {
  const { useAddDeliveryAddress, useUpdateDeliveryAddress } = useSupabase();
  const addMutation = useAddDeliveryAddress();
  const updateMutation = useUpdateDeliveryAddress();

  const [formData, setFormData] = useState({
    option_name: '',
    region: '',
    area: '',
    cost: '',
    description: '',
    courier: '',
    pickup_point_name: ''
  });

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (address) {
        await updateMutation.mutateAsync({ id: address.id, address: formData });
        toast.success('Delivery address updated successfully');
      } else {
        await addMutation.mutateAsync(formData);
        toast.success('Delivery address added successfully');
      }
      onClose();
    } catch (error) {
      toast.error(address ? 'Failed to update address' : 'Failed to add address');
    }
  };

  const renderOptionSpecificFields = () => {
    switch (formData.option_name) {
      case 'Nairobi Delivery':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Area</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
              required
            />
          </div>
        );
      case 'CBD Pickup Point':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pickup Point Name
            </label>
            <input
              type="text"
              name="pickup_point_name"
              value={formData.pickup_point_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
              required
            />
          </div>
        );
      case 'Rest of Kenya':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Courier Service
              </label>
              <input
                type="text"
                name="courier"
                value={formData.courier}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
        >
          <FiX size={20} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6">
          <h2 className="text-xl font-semibold mb-6 pr-8">
            {address ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Option Name
              </label>
              <select
                name="option_name"
                value={formData.option_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                required
              >
                <option value="">Select Delivery Option</option>
                {DELIVERY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {renderOptionSpecificFields()}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primarycolor text-white rounded-md hover:bg-primarycolor/90"
                disabled={addMutation.isLoading || updateMutation.isLoading}
              >
                {addMutation.isLoading || updateMutation.isLoading
                  ? 'Saving...'
                  : address
                  ? 'Update'
                  : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
