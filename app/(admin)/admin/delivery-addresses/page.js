'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '../../../hooks/useSupabase';
import DeliveryAddressesForm from '../components/deliveryaddressform'; // Import the form component

export default function DeliveryAddressesPage() {
  const { fetchDeliveryAddresses, deleteDeliveryAddress } = useSupabase(); // CRUD operations for delivery addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null); // For editing an address

  // Fetch delivery addresses on load
  useEffect(() => {
    fetchDeliveryAddresses().then(setAddresses);
  }, []);

  // Handle saving (refresh the list after adding/updating)
  const handleSave = async () => {
    const fetchedAddresses = await fetchDeliveryAddresses();
    setAddresses(fetchedAddresses);
    setSelectedAddress(null); // Reset form after save
  };

  // Handle deleting an address
  const handleDelete = async (id) => {
    await deleteDeliveryAddress(id);
    handleSave(); // Refresh the list after delete
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Delivery Addresses</h1>

      {/* Display the form for adding/updating */}
      <DeliveryAddressesForm address={selectedAddress} onSave={handleSave} />

      {/* List of existing delivery addresses */}
      <ul className="space-y-4 mt-4">
        {addresses.map((address) => (
          <li key={address.id} className="p-4 bg-gray-100 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{address.option_name}</p>
              <p className="text-gray-600">{address.region}, {address.area}</p>
              <p className="text-gray-500">Cost: {address.cost}</p>
              <p className="text-gray-500">{address.courier}</p>
              {address.pickup_point_name && <p className="text-gray-500">Pickup Point: {address.pickup_point_name}</p>}
            </div>
            <div>
              <button
                onClick={() => setSelectedAddress(address)} // Load the selected address into the form
                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
