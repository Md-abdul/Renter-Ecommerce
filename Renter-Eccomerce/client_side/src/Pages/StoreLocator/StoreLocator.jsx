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
  const [activeCity, setActiveCity] = useState(null);

  // Sample store data
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
      coordinates: [72.9476, 19.1707],
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
    {
      id: 3,
      name: "Fashion Outlet",
      address: "123 Main Street, Downtown",
      city: "PALGHAR",
      state: "Maharashtra",
      pincode: "401404",
      country: "India",
      phone: "9876543210",
      coordinates: [72.7654, 19.6969],
    },
    {
      id: 4,
      name: "Trendy Styles",
      address: "456 Market Road, Near Bus Stand",
      city: "DAHANU",
      state: "Maharashtra",
      pincode: "401601",
      country: "India",
      phone: "8765432109",
      coordinates: [72.7123, 19.9678],
    },
  ];

  // Cities for the city list with coordinates
  const cities = [
    { name: "Dahanu", coordinates: [72.7123, 19.9678] },
    { name: "Trimbal", coordinates: [72.7654, 19.6969] },
    { name: "Palghār", coordinates: [72.7654, 19.6969] },
    { name: "Kisiki", coordinates: [72.8765, 19.5432] },
    { name: "Vasa", coordinates: [72.9876, 19.4321] },
    { name: "Jtar", coordinates: [72.6543, 19.321] },
    { name: "Shahapur", coordinates: [73.1234, 19.4567] },
    { name: "Dombivu", coordinates: [73.0123, 19.5678] },
    { name: "Navi Mum", coordinates: [73.0012, 19.0456] },
    { name: "Kasj", coordinates: [72.8901, 19.0789] },
    { name: "Kajat", coordinates: [72.9012, 19.089] },
    { name: "Khopoli", coordinates: [73.3456, 18.789] },
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
        const marker = new mapboxgl.Marker({
          color: "#facc15", // yellow-400
        })
          .setLngLat(store.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2 max-w-xs">
              <h3 class="font-bold text-lg text-gray-800">${store.name}</h3>
              <p class="text-gray-600">${store.address}</p>
              <p class="text-gray-600">${store.city}, ${store.state} ${store.pincode}</p>
              <p class="text-gray-600">${store.country}</p>
              <p class="mt-2 text-yellow-600 font-medium">Phone: ${store.phone}</p>
              <button class="mt-2 px-3 py-1 bg-yellow-400 text-black rounded-md text-sm font-medium hover:bg-yellow-500 transition">
                Get Directions
              </button>
            </div>
          `)
          )
          .addTo(initializeMap);
      });

      initializeMap.addControl(new mapboxgl.NavigationControl(), "top-right");

      setMap(initializeMap);
      setMapInitialized(true);
    }

    return () => {
      if (map) map.remove();
    };
  }, [mapInitialized]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

    // Find stores matching the search query
    const foundStores = stores.filter(
      (store) =>
        store.pincode.includes(searchQuery) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundStores.length > 0 && map) {
      setSelectedStore(foundStores[0]);
      setActiveCity(null);
      map.flyTo({
        center: foundStores[0].coordinates,
        zoom: 14,
        essential: true,
      });
    }
  };

  const handleCityClick = (city) => {
    setActiveCity(city.name);
    setSearchQuery("");
    setSelectedStore(null);

    // Filter stores for this city
    const cityStores = stores.filter((store) =>
      store.city.toLowerCase().includes(city.name.toLowerCase())
    );

    if (cityStores.length > 0 && map) {
      map.flyTo({
        center: city.coordinates,
        zoom: 12,
        essential: true,
      });
    } else if (map) {
      map.flyTo({
        center: city.coordinates,
        zoom: 11,
        essential: true,
      });
    }
  };

  const filteredStores = activeCity
    ? stores.filter((store) =>
        store.city.toLowerCase().includes(activeCity.toLowerCase())
      )
    : stores;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar with City Filters on Top */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 mb-4"
          >
            <div className="flex-grow">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by pincode, address or city
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="e.g. 400081 or Mumbai"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
          </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Store List */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-5 bg-black text-yellow-400">
              <h2 className="font-bold text-xl">Our Stores</h2>
              <p className="text-yellow-300 text-sm">
                {filteredStores.length} stores found
                {activeCity ? ` in ${activeCity}` : ""}
              </p>
            </div>

            <div className="mt-3">
              <h3 className="text-black text-xl font-medium mb-2 p-2">
                Suggested Cities
              </h3>
              <div className="flex flex-wrap gap-2 p-2">
                {cities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleCityClick(city)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      activeCity === city.name
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-yellow-300 hover:bg-gray-700"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {selectedStore ? (
                <div className="p-5 border-b border-gray-200 bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800">
                      {selectedStore.name}
                    </h3>
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                      SELECTED
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{selectedStore.address}</p>
                  <p className="text-gray-600">
                    {selectedStore.city}, {selectedStore.state}{" "}
                    {selectedStore.pincode}
                  </p>
                  <p className="text-gray-600">{selectedStore.country}</p>
                  <p className="mt-2 text-yellow-600 font-medium">
                    {selectedStore.phone}
                  </p>
                  <button className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition w-full">
                    Get Directions
                  </button>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    className={`p-5 border-b border-gray-200 hover:bg-yellow-50 cursor-pointer transition ${
                      selectedStore?.id === store.id ? "bg-yellow-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedStore(store);
                      if (map) {
                        map.flyTo({
                          center: store.coordinates,
                          zoom: 14,
                          essential: true,
                        });
                      }
                    }}
                  >
                    <h3 className="font-bold text-gray-800">{store.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {store.address}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {store.city}, {store.state} {store.pincode}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-yellow-600 text-sm font-medium">
                        {store.phone}
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {store.city}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 text-center text-sm text-gray-500 bg-gray-100">
              Powered by <span className="font-bold">Stocklist</span>
            </div>
          </div>

          {/* Map */}
          <div className="w-full lg:w-2/3 h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-300">
            <div id="map" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
