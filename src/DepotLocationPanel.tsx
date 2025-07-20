import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UnitSystem, DepotLocation } from '../App';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Props {
  depotLocation: DepotLocation | null;
  onLocationChange: (location: DepotLocation) => void;
  dailyRange: number;
  onRangeChange: (range: number) => void;
  rangeUnit: string;
  onRangeUnitChange: (unit: string) => void;
  currentUnits: UnitSystem;
  onUnitsChange: (units: UnitSystem) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

// Country to units mapping
const countryUnits: Record<string, UnitSystem> = {
  'GB': 'uk',
  'US': 'us',
  'CA': 'us',
  'AU': 'uk',
  'DE': 'metric-cons',
  'FR': 'metric-cons'
};

// Component to handle map clicks
function LocationMarker({ onLocationSelect, dailyRange, rangeUnit }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  dailyRange: number;
  rangeUnit: string;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup>
          Depot Location<br />
          Lat: {position[0].toFixed(6)}<br />
          Lng: {position[1].toFixed(6)}
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={rangeUnit === 'miles' ? dailyRange * 1609.34 : dailyRange * 1000}
        color="#2196F3"
        fillColor="#bbdefb"
        fillOpacity={0.2}
        weight={2}
      />
    </>
  );
}

const DepotLocationPanel: React.FC<Props> = ({
  depotLocation,
  onLocationChange,
  dailyRange,
  onRangeChange,
  rangeUnit,
  onRangeUnitChange,
  currentUnits,
  onUnitsChange,
  selectedCountry,
  onCountryChange
}) => {
  const [address, setAddress] = useState('M20 2UR, Manchester, UK');
  const [userChangedUnits, setUserChangedUnits] = useState(false);
  
  // Default map center (Manchester)
  const defaultCenter: [number, number] = [53.4428, -2.2302];

  // Handle country change
  const handleCountryChange = (country: string) => {
    onCountryChange(country);
    
    if (!userChangedUnits) {
      const preferredUnit = countryUnits[country];
      if (preferredUnit) {
        onUnitsChange(preferredUnit);
        convertRangeUnits(currentUnits, preferredUnit);
      }
    }
  };

  // Convert range values when units change
  const convertRangeUnits = (fromUnit: UnitSystem, toUnit: UnitSystem) => {
    const fromImperial = fromUnit === 'uk' || fromUnit === 'us';
    const toImperial = toUnit === 'uk' || toUnit === 'us';
    
    if (fromImperial && !toImperial) {
      // Miles to km
      onRangeChange(Math.round(dailyRange * 1.609344));
      onRangeUnitChange('km');
    } else if (!fromImperial && toImperial) {
      // Km to miles
      onRangeChange(Math.round(dailyRange * 0.621371));
      onRangeUnitChange('miles');
    }
  };

  // Handle units toggle
  const handleUnitsChange = (units: UnitSystem) => {
    setUserChangedUnits(true);
    const oldUnits = currentUnits;
    onUnitsChange(units);
    convertRangeUnits(oldUnits, units);
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    onLocationChange({
      lat,
      lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });
  };

  // Handle address search (placeholder for real geocoding)
  const handleAddressSearch = () => {
    // This would integrate with a real geocoding service
    console.log('Searching for:', address);
  };

  // Determine range slider properties
  const isImperial = currentUnits === 'uk' || currentUnits === 'us';
  const rangeMin = isImperial ? 6 : 10;
  const rangeMax = isImperial ? 311 : 500;

  return (
    <div className="panel">
      <h2 className="panel-title">Depot Location & Range</h2>
      
      {/* Address Section */}
      <div className="address-section">
        <div className="address-row">
          <select 
            className="country-select"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="GB">🇬🇧 UK</option>
            <option value="US">🇺🇸 USA</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="AU">🇦🇺 Australia</option>
            <option value="DE">🇩🇪 Germany</option>
            <option value="FR">🇫🇷 France</option>
          </select>
          <input
            type="text"
            className="address-input"
            placeholder="Enter address, postcode, or coordinates..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="search-btn" onClick={handleAddressSearch}>
            🔍
          </button>
        </div>
      </div>

      {/* Units Toggle */}
      <div className="units-toggle">
        <div 
          className={`units-option ${currentUnits === 'uk' ? 'active' : ''}`}
          onClick={() => handleUnitsChange('uk')}
        >
          Miles (miles/kWh)
        </div>
        <div 
          className={`units-option ${currentUnits === 'us' ? 'active' : ''}`}
          onClick={() => handleUnitsChange('us')}
        >
          Miles (kWh/100mi)
        </div>
        <div 
          className={`units-option ${currentUnits === 'metric-eff' ? 'active' : ''}`}
          onClick={() => handleUnitsChange('metric-eff')}
        >
          km (km/kWh)
        </div>
        <div 
          className={`units-option ${currentUnits === 'metric-cons' ? 'active' : ''}`}
          onClick={() => handleUnitsChange('metric-cons')}
        >
          km (kWh/100km)
        </div>
      </div>

      {/* Map */}
      <div style={{ height: '400px', marginBottom: '20px' }}>
        <MapContainer
          center={depotLocation ? [depotLocation.lat, depotLocation.lng] : defaultCenter}
          zoom={18}
          style={{ height: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution="&copy; Google"
            maxZoom={22}
          />
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
            attribution="&copy; Google"
            maxZoom={22}
            opacity={0.4}
          />
          <LocationMarker 
            onLocationSelect={handleLocationSelect}
            dailyRange={dailyRange}
            rangeUnit={rangeUnit}
          />
        </MapContainer>
      </div>

      {/* Daily Range Control */}
      <div className="control-group">
        <div className="control-label">
          <span>Daily Range</span>
          <div className="value-display">
            <input
              type="number"
              value={dailyRange}
              onChange={(e) => onRangeChange(Number(e.target.value))}
              min={rangeMin}
              max={rangeMax}
            />
            <span className="unit-text">{rangeUnit}</span>
          </div>
        </div>
        <div className="slider-container">
          <span className="slider-label">{rangeMin}</span>
          <input
            type="range"
            className="slider"
            min={rangeMin}
            max={rangeMax}
            value={dailyRange}
            onChange={(e) => onRangeChange(Number(e.target.value))}
          />
          <span className="slider-label">{rangeMax}</span>
        </div>
        <div className="explanatory-text">
          Daily vehicle distance = 2× this range. Charging energy = daily distance × consumption + buffer.
        </div>
      </div>
    </div>
  );
};

export default DepotLocationPanel;