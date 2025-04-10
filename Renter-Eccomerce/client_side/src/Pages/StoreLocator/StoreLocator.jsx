import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Initialize Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZG9jdG9yOTU5MSIsImEiOiJjbHpqdDgyZDcwc2NzMmpzNGFybGF4NmV0In0.R8U4DHmRMWYrWojMagH-KA";

const StoreLocator = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Sample store data (you can expand this with more stores)
  const stores = [
    {
      id: 1,
      name: "96 K FASHION HOUSE MULUND",
      address:
        "Shop no 4 Rishi dayaram c h s, Lrd shahani colony navghar road Mulund East Mumbai",
      city: "MUMBAI",
      state: "MAHARASHTRA",
      pincode: "400081",
      country: "INDIA",
      phone: "9820254110",
      coordinates: [72.9476, 19.1707], // [longitude, latitude]
    },
    {
      id: 2,
      name: "A 1 BAZAR FOOT WEAR",
      address:
        "Shop No 3, Dattani Shopping Center, V.L. Road, Near Sarovar Hotel",
      city: "MUMBAI",
      state: "Maharashtra",
      pincode: "400067",
      country: "India",
      phone: "8108674386",
      coordinates: [72.8474, 19.2036],
    },
  ];

  // Cities for the city list
  const cities = [
    "Dahanu",
    "Trimbal",
    "Palghār",
    "Kisiki",
    "Vasa",
    "Jtar",
    "Shahapur",
    "Dombivu",
    "Navi Mum",
    "Kasj",
    "Kajat",
    "Khopoli",
  ];

  useEffect(() => {
    if (!mapInitialized) {
      const initializeMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [72.8777, 19.076], // Mumbai coordinates
        zoom: 10,
      });

      // Add markers for each store
      stores.forEach((store) => {
        const marker = new mapboxgl.Marker()
          .setLngLat(store.coordinates)
          .setPopup(
            new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${store.name}</h3>
              <p>${store.address}</p>
              <p>${store.city}, ${store.state} ${store.pincode}</p>
              <p>${store.country}</p>
              <p class="mt-2">Phone: ${store.phone}</p>
            </div>
          `)
          )
          .addTo(initializeMap);
      });

      setMap(initializeMap);
      setMapInitialized(true);
    }

    return () => {
      if (map) map.remove();
    };
  }, [mapInitialized]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    if (searchQuery.trim() === "") return;

    // Find stores matching the search query
    const foundStores = stores.filter(
      (store) =>
        store.pincode.includes(searchQuery) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundStores.length > 0 && map) {
      setSelectedStore(foundStores[0]);
      map.flyTo({
        center: foundStores[0].coordinates,
        zoom: 14,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Store Locator</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-grow">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type a postcode or address...
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pincode or address"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors self-end md:self-auto"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Store List */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Pincode</h2>
            </div>

            {selectedStore ? (
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg">{selectedStore.name}</h3>
                <p className="text-gray-700">{selectedStore.address}</p>
                <p className="text-gray-700">
                  {selectedStore.city}, {selectedStore.state}{" "}
                  {selectedStore.pincode}
                </p>
                <p className="text-gray-700">{selectedStore.country}</p>
                <p className="mt-2 text-blue-600">{selectedStore.phone}</p>
              </div>
            ) : (
              stores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedStore(store);
                    if (map) {
                      map.flyTo({
                        center: store.coordinates,
                        zoom: 14,
                      });
                    }
                  }}
                >
                  <h3 className="font-bold">{store.name}</h3>
                  <p className="text-gray-700">{store.address}</p>
                  <p className="text-gray-700">
                    {store.city}, {store.state} {store.pincode}
                  </p>
                </div>
              ))
            )}

            {/* City List */}
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-3">Nearby Cities</h2>
              <div className="flex flex-wrap gap-2">
                {cities.map((city, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 text-center text-sm text-gray-500">
              Powered by Stocklist.
            </div>
          </div>

          {/* Map */}
          <div className="w-full lg:w-2/3 h-96 lg:h-auto rounded-lg overflow-hidden shadow-md">
            <div id="map" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
