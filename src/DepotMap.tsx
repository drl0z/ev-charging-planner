import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Depot Location<br />
        Lat: {position[0].toFixed(6)}<br />
        Lng: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

interface DepotMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  dailyRange: number;
}

const DepotMap: React.FC<DepotMapProps> = ({ onLocationSelect, dailyRange }) => {
  const [depotPosition, setDepotPosition] = useState<[number, number] | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setDepotPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[51.505, -0.09]} // London coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationSelect={handleLocationSelect} />
        
        {/* Range Circle - only show if depot is placed and range > 0 */}
        {depotPosition && dailyRange > 0 && (
          <Circle
            center={depotPosition}
            radius={dailyRange * 1000} // Convert km to meters
            color="blue"
            fillColor="lightblue"
            fillOpacity={0.2}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DepotMap;