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
  const [activeCity, setActiveCity] = useState(null);
  const [stores, setStores] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stores and cities from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(
          "https://renter-ecommerce.vercel.app/api/stores"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();
        setStores(data);

        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(data.map((store) => store.city))
        ).map((city) => {
          const store = data.find((s) => s.city === city);
          return {
            name: city,
            coordinates: store.coordinates,
          };
        });

        setCities(uniqueCities);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Generate Google Maps URL
  const getGoogleMapsUrl = (store) => {
    const address = encodeURIComponent(
      `${store.address}, ${store.city}, ${store.state} ${store.pincode}, ${store.country}`
    );
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  useEffect(() => {
    if (loading) return; // Wait until data is loaded and DOM is rendered

    const initializeMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [72.9476, 19.1707], // India center
      zoom: 4,
    });

    initializeMap.addControl(new mapboxgl.NavigationControl(), "top-right");
    setMap(initializeMap);

    return () => {
      initializeMap.remove();
    };
  }, [loading]); // Depend on loading

  // Add markers when stores data is available
  useEffect(() => {
    if (map && stores.length > 0) {
      // Add markers
      stores.forEach((store) => {
        if (
          Array.isArray(store.coordinates) &&
          store.coordinates.length === 2
        ) {
          new mapboxgl.Marker({ color: "#facc15" })
            .setLngLat(store.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2 max-w-xs">
                  <h3 class="font-bold text-lg text-gray-800">${store.name}</h3>
                  <p class="text-gray-600">${store.address}</p>
                  <p class="text-gray-600">${store.city}, ${store.state} ${
                store.pincode
              }</p>
                  <p class="text-gray-600">${store.country}</p>
                  <p class="mt-2 text-yellow-600 font-medium">Phone: ${
                    store.phone
                  }</p>
                  <button onclick="window.open('${getGoogleMapsUrl(
                    store
                  )}', '_blank')" class="mt-2 px-3 py-1 bg-yellow-400 text-black rounded-md text-sm font-medium hover:bg-yellow-500 transition cursor-pointer">
                    Get Directions
                  </button>
                </div>
              `)
            )
            .addTo(map);
        }
      });

      // Fly to first store
      map.flyTo({
        center: stores[0].coordinates,
        zoom: 10,
      });
    }
  }, [map, stores]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

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

    if (map) {
      map.flyTo({
        center: city.coordinates,
        zoom: 12,
        essential: true,
      });
    }
  };

  const filteredStores = activeCity
    ? stores.filter((store) =>
        store.city.toLowerCase().includes(activeCity.toLowerCase())
      )
    : stores;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading stores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-gray-600">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
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
                  <button
                    onClick={() =>
                      window.open(getGoogleMapsUrl(selectedStore), "_blank")
                    }
                    className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition w-full cursor-pointer"
                  >
                    Get Directions
                  </button>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store._id}
                    className="p-5 border-b border-gray-200 hover:bg-yellow-50 cursor-pointer transition"
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
          </div>

          <div className="w-full lg:w-2/3 h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-300">
            <div id="map" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
