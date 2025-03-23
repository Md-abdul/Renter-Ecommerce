import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define the map center (India)
const mapCenter = [20.5937, 78.9629];

// Define the zoom level
const zoomLevel = 5;

// Define the branches with their coordinates
// const branches = [
//   { name: "Renter Mumbai", location: [19.076, 72.8777] },
//   { name: "Renter Delhi", location: [28.7041, 77.1025] },
//   { name: "Renter Bangalore", location: [12.9716, 77.5946] },
//   { name: "Renter Chennai", location: [13.0827, 80.2707] },
//   { name: "Renter Kolkata", location: [22.5726, 88.3639] },
// ];

const branches = [
  { name: "Renter Mumbai", location: [19.076, 72.8777] },
  { name: "Renter Delhi", location: [28.7041, 77.1025] },
  { name: "Renter Bangalore", location: [12.9716, 77.5946] },
  { name: "Renter Chennai", location: [13.0827, 80.2707] },
  { name: "Renter Kolkata", location: [22.5726, 88.3639] },
  { name: "Renter Hyderabad", location: [17.385, 78.4867] },
  { name: "Renter Pune", location: [18.5204, 73.8567] },
  { name: "Renter Ahmedabad", location: [23.0225, 72.5714] },
  { name: "Renter Jaipur", location: [26.9124, 75.7873] },
  { name: "Renter Chandigarh", location: [30.7333, 76.7794] },
  { name: "Renter Lucknow", location: [26.8467, 80.9462] },
  { name: "Renter Bhopal", location: [23.2599, 77.4126] },
  { name: "Renter Indore", location: [22.7196, 75.8577] },
  { name: "Renter Surat", location: [21.1702, 72.8311] },
  { name: "Renter Nagpur", location: [21.1458, 79.0882] },
  { name: "Renter Kochi", location: [9.9312, 76.2673] },
  { name: "Renter Patna", location: [25.5941, 85.1376] },
  { name: "Renter Bhubaneswar", location: [20.2961, 85.8245] },
  { name: "Renter Goa", location: [15.2993, 74.124] },
  { name: "Renter Guwahati", location: [26.1445, 91.7362] },
];

// Fix for default marker icons in React-Leaflet
// Replace lines 45-54 with this updated code:

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  iconColor: "#ff0000", // This line changes the marker color to red
});

const StoreLocator = () => {
  const [selectedState, setSelectedState] = useState("All");

  // Filter branches based on the selected state
  const filteredBranches =
    selectedState === "All"
      ? branches
      : branches.filter((branch) => branch.name.includes(selectedState));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-600 p-6">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-4">
          Renter Store Locator
        </h1>
        <p className="text-gray-300">
          Find the nearest Renter branch in your state. Select a state from the
          dropdown to filter branches.
        </p>
      </div>

      {/* State Selector */}
      <div className="w-full max-w-2xl mb-8">
        <label
          htmlFor="state-select"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Select State
        </label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="All" className="bg-gray-800">
            All States
          </option>
          <option value="Mumbai" className="bg-gray-800">
            Mumbai
          </option>
          <option value="Delhi" className="bg-gray-800">
            Delhi
          </option>
          <option value="Bangalore" className="bg-gray-800">
            Bangalore
          </option>
          <option value="Chennai" className="bg-gray-800">
            Chennai
          </option>
          <option value="Kolkata" className="bg-gray-800">
            Kolkata
          </option>
        </select>
      </div>

      {/* Map Container */}
      <div className="w-full max-w-8xl h-[600px] rounded-lg overflow-hidden shadow-2xl">
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredBranches.map((branch, index) => (
            <Marker key={index} position={branch.location} icon={defaultIcon}>
              <Popup className="font-medium text-yellow-600 bg-gray-800 p-2 rounded-lg">
                {branch.name}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default StoreLocator;
