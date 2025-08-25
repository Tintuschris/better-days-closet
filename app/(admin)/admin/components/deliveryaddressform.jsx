'use client';
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiX, FiMapPin, FiTruck, FiDollarSign, FiFileText } from 'react-icons/fi';
import { PremiumCard, Button, Input, FormGroup, Label, GradientText } from '../../../components/ui';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <PremiumCard className="w-full max-w-lg relative max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-primarycolor/60 hover:text-primarycolor z-10 p-2 rounded-lg hover:bg-primarycolor/10 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6">
          <GradientText className="text-xl font-bold mb-6 pr-8 flex items-center gap-3">
            <FiMapPin className="w-5 h-5" />
            {address ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </GradientText>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup>
              <Label required>
                <FiTruck className="w-4 h-4 mr-2" />
                Option Name
              </Label>
              <div className="relative">
                <select
                  name="option_name"
                  value={formData.option_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor bg-white/60"
                  required
                >
                  <option value="">Select Delivery Option</option>
                  {DELIVERY_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </FormGroup>

            {renderOptionSpecificFields()}

            <FormGroup>
              <Label required>
                <FiDollarSign className="w-4 h-4 mr-2" />
                Cost (KSh)
              </Label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
                <Input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0"
                  className="pl-10"
                  min="0"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiFileText className="w-4 h-4 mr-2" />
                Description
              </Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor bg-white/60 placeholder-primarycolor/60"
                rows="3"
                placeholder="Optional description for this delivery option..."
              />
            </FormGroup>

            <div className="flex justify-end space-x-4 pt-6 border-t border-primarycolor/10">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={addMutation.isLoading || updateMutation.isLoading}
                loadingText="Saving..."
              >
                {address ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </form>
        </div>
      </PremiumCard>
    </div>
  );
}
