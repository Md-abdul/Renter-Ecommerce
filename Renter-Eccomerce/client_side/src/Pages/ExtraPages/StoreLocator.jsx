import React from 'react';
import { MapPin, Clock } from 'lucide-react';

// Sample static store data
const stores = [
  {
    id: 1,
    name: 'Renter Store 1',
    address: '123 Main St, New York, NY',
    distance: '1.2 km',
    open: true,
    image: 'https://via.placeholder.com/400x200?text=Store+1+Map', // Placeholder image for store location
  },
  {
    id: 2,
    name: 'Renter Store 2',
    address: '456 Elm St, Brooklyn, NY',
    distance: '2.5 km',
    open: false,
    image: 'https://via.placeholder.com/400x200?text=Store+2+Map', // Placeholder image for store location
  },
  {
    id: 3,
    name: 'Renter Store 3',
    address: '789 Oak St, Queens, NY',
    distance: '3.1 km',
    open: true,
    image: 'https://via.placeholder.com/400x200?text=Store+3+Map', // Placeholder image for store location
  },
];

export const StoreLocator = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-8">Find a Renter Store Near You</h1>

        {/* Store List */}
        <div className="space-y-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Store Image */}
              <img
                src={store.image}
                alt={`Location of ${store.name}`}
                className="w-full h-48 object-cover"
              />

              {/* Store Details */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="mr-2" />
                  <p>{store.address}</p>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="mr-2" />
                  <p>{store.open ? 'Open Now' : 'Closed'}</p>
                </div>
                <p className="text-gray-600">{store.distance} away</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// export default StoreLocator;