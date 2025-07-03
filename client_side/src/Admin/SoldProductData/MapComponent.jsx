import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// MapComponent.jsx (separate file)
const MapComponent = ({ initialCenter, onMapClick }) => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!map && mapContainer.current) {
      const initializeMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: initialCenter,
        zoom: 12,
      });

      initializeMap.on("click", onMapClick);
      initializeMap.addControl(new mapboxgl.NavigationControl(), "top-right");
      setMap(initializeMap);

      // Add marker for initial position
      new mapboxgl.Marker().setLngLat(initialCenter).addTo(initializeMap);
    }

    return () => {
      if (map) map.remove();
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapComponent;
