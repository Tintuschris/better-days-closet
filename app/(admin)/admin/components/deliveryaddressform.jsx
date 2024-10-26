'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '../../../hooks/useSupabase';

export default function DeliveryAddressesForm({ address, onSave }) {
  const { addDeliveryAddress, updateDeliveryAddress } = useSupabase();
  const [optionName, setOptionName] = useState(address?.option_name || '');
  const [region, setRegion] = useState(address?.region || '');
  const [area, setArea] = useState(address?.area || '');
  const [cost, setCost] = useState(address?.cost || '');
  const [description, setDescription] = useState(address?.description || '');
  const [courier, setCourier] = useState(address?.courier || '');
  const [pickupPointName, setPickupPointName] = useState(address?.pickup_point_name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addressData = { option_name: optionName, region, area, cost, description, courier, pickup_point_name: pickupPointName };

    if (address) {
      await updateDeliveryAddress(address.id, addressData);
    } else {
      await addDeliveryAddress(addressData);
    }
    onSave(); // Callback to refresh the list
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Option Name"
        value={optionName}
        onChange={(e) => setOptionName(e.target.value)}
        className="w-full p-2 border"
        required
      />
      <input
        type="text"
        placeholder="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="w-full p-2 border"
        required
      />
      <input
        type="text"
        placeholder="Area"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        className="w-full p-2 border"
        required
      />
      <input
        type="number"
        placeholder="Cost"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        className="w-full p-2 border"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border"
      />
      <input
        type="text"
        placeholder="Courier Service"
        value={courier}
        onChange={(e) => setCourier(e.target.value)}
        className="w-full p-2 border"
        required
      />
      <input
        type="text"
        placeholder="Pickup Point Name"
        value={pickupPointName}
        onChange={(e) => setPickupPointName(e.target.value)}
        className="w-full p-2 border"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        {address ? 'Update Address' : 'Add Address'}
      </button>
    </form>
  );
}
