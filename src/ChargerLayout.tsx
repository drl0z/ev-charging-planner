import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for different elements
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${color}; 
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    ">${symbol}</div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const chargerIcon = createCustomIcon('#4CAF50', '⚡');
const distributionPanelIcon = createCustomIcon('#FF9800', 'D');
const mainSupplyIcon = createCustomIcon('#F44336', 'M');

interface LayoutElement {
  id: string;
  type: 'charger' | 'distributionPanel' | 'mainSupply';
  position: [number, number];
  name: string;
}

interface ChargerLayoutProps {
  depotLocation: { lat: number; lng: number };
  selectedCharger: any;
  vehicleQuantity: number;
  onLayoutComplete: (elements: LayoutElement[], cableCalculations: any) => void;
}

const ChargerLayout: React.FC<ChargerLayoutProps> = ({ 
  depotLocation, 
  selectedCharger, 
  vehicleQuantity,
  onLayoutComplete 
}) => {
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [placementMode, setPlacementMode] = useState<'charger' | 'distributionPanel' | 'mainSupply' | null>(null);
  const [showCableRoutes, setShowCableRoutes] = useState(false);

  // Component to handle map clicks for placing elements
  function ElementPlacer() {
    useMapEvents({
      click(e) {
        if (!placementMode) return;

        const { lat, lng } = e.latlng;
        const newElement: LayoutElement = {
          id: `${placementMode}-${Date.now()}`,
          type: placementMode,
          position: [lat, lng],
          name: placementMode === 'charger' 
            ? `Charger ${layoutElements.filter(el => el.type === 'charger').length + 1}`
            : placementMode === 'distributionPanel'
            ? 'Distribution Panel'
            : 'Main Supply'
        };

        setLayoutElements(prev => {
          // Only allow one distribution panel and one main supply
          if (placementMode === 'distributionPanel') {
            return [...prev.filter(el => el.type !== 'distributionPanel'), newElement];
          }
          if (placementMode === 'mainSupply') {
            return [...prev.filter(el => el.type !== 'mainSupply'), newElement];
          }
          return [...prev, newElement];
        });

        // Auto-exit placement mode for single-instance items
        if (placementMode === 'distributionPanel' || placementMode === 'mainSupply') {
          setPlacementMode(null);
        }
      },
    });

    return null;
  }

  const calculateCableDistances = useCallback(() => {
    const chargers = layoutElements.filter(el => el.type === 'charger');
    const distributionPanel = layoutElements.find(el => el.type === 'distributionPanel');
    const mainSupply = layoutElements.find(el => el.type === 'mainSupply');

    if (!distributionPanel || !mainSupply) {
      return { chargerCables: [], mainCable: null, totalLength: 0 };
    }

    // Calculate distance between two lat/lng points (simple approximation)
    const calculateDistance = (pos1: [number, number], pos2: [number, number]): number => {
      const [lat1, lng1] = pos1;
      const [lat2, lng2] = pos2;
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const chargerCables = chargers.map(charger => ({
      from: charger.position,
      to: distributionPanel.position,
      length: calculateDistance(charger.position, distributionPanel.position),
      chargerId: charger.id
    }));

    const mainCable = {
      from: distributionPanel.position,
      to: mainSupply.position,
      length: calculateDistance(distributionPanel.position, mainSupply.position)
    };

    const totalLength = chargerCables.reduce((sum, cable) => sum + cable.length, 0) + mainCable.length;

    return { chargerCables, mainCable, totalLength };
  }, [layoutElements]);

  const cableCalculations = calculateCableDistances();

  const removeElement = (id: string) => {
    setLayoutElements(prev => prev.filter(el => el.id !== id));
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'charger': return chargerIcon;
      case 'distributionPanel': return distributionPanelIcon;
      case 'mainSupply': return mainSupplyIcon;
      default: return chargerIcon;
    }
  };

  const chargersPlaced = layoutElements.filter(el => el.type === 'charger').length;
  const allRequiredElementsPlaced = chargersPlaced === vehicleQuantity && 
                                   layoutElements.some(el => el.type === 'distributionPanel') &&
                                   layoutElements.some(el => el.type === 'mainSupply');

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Step 4: Charger Layout Design</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Selected Charger:</strong> {selectedCharger?.name || 'None selected'}</p>
        <p><strong>Chargers to place:</strong> {chargersPlaced}/{vehicleQuantity}</p>
      </div>

      {/* Placement Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPlacementMode(placementMode === 'charger' ? null : 'charger')}
          disabled={chargersPlaced >= vehicleQuantity}
          style={{
            padding: '10px 15px',
            backgroundColor: placementMode === 'charger' ? '#4CAF50' : '#f0f0f0',
            color: placementMode === 'charger' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: chargersPlaced >= vehicleQuantity ? 'not-allowed' : 'pointer',
            opacity: chargersPlaced >= vehicleQuantity ? 0.5 : 1
          }}
        >
          ⚡ Place Charger ({chargersPlaced}/{vehicleQuantity})
        </button>

        <button
          onClick={() => setPlacementMode(placementMode === 'distributionPanel' ? null : 'distributionPanel')}
          style={{
            padding: '10px 15px',
            backgroundColor: placementMode === 'distributionPanel' ? '#FF9800' : '#f0f0f0',
            color: placementMode === 'distributionPanel' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📋 Place Distribution Panel
        </button>

        <button
          onClick={() => setPlacementMode(placementMode === 'mainSupply' ? null : 'mainSupply')}
          style={{
            padding: '10px 15px',
            backgroundColor: placementMode === 'mainSupply' ? '#F44336' : '#f0f0f0',
            color: placementMode === 'mainSupply' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔌 Place Main Supply
        </button>

        <button
          onClick={() => setShowCableRoutes(!showCableRoutes)}
          disabled={!allRequiredElementsPlaced}
          style={{
            padding: '10px 15px',
            backgroundColor: showCableRoutes ? '#2196F3' : '#f0f0f0',
            color: showCableRoutes ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: allRequiredElementsPlaced ? 'pointer' : 'not-allowed',
            opacity: allRequiredElementsPlaced ? 1 : 0.5
          }}
        >
          🔗 {showCableRoutes ? 'Hide' : 'Show'} Cable Routes
        </button>
      </div>

      {placementMode && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px', 
          marginBottom: '15px',
          border: '1px solid #2196F3'
        }}>
          <strong>Click on the map to place: {placementMode.replace(/([A-Z])/g, ' $1').toLowerCase()}</strong>
        </div>
      )}

      {/* Satellite Map */}
      <div style={{ height: '500px', width: '100%', marginBottom: '20px' }}>
        <MapContainer
          center={[depotLocation.lat, depotLocation.lng]}
          zoom={20}
          maxZoom={22}
          style={{ height: '100%', width: '100%' }}
          key={`${depotLocation.lat}-${depotLocation.lng}`} // Force re-render when depot location changes
        >
          {/* High-resolution satellite imagery */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution='&copy; Google'
            maxZoom={22}
          />
          
          {/* Optional: Add labels/roads overlay for better context */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
            attribution='&copy; Google'
            maxZoom={22}
            opacity={0.4}
          />
          
          <ElementPlacer />

          {/* Render placed elements */}
          {layoutElements.map(element => (
            <Marker
              key={element.id}
              position={element.position}
              icon={getElementIcon(element.type)}
            >
              <Popup>
                <div>
                  <strong>{element.name}</strong><br />
                  Type: {element.type}<br />
                  <button 
                    onClick={() => removeElement(element.id)}
                    style={{ 
                      marginTop: '5px', 
                      padding: '5px 10px', 
                      backgroundColor: '#f44336', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Cable routes */}
          {showCableRoutes && cableCalculations.chargerCables.map((cable, index) => (
            <Polyline
              key={`charger-cable-${index}`}
              positions={[cable.from, cable.to]}
              color="#4CAF50"
              weight={3}
              opacity={0.7}
            />
          ))}

          {showCableRoutes && cableCalculations.mainCable && (
            <Polyline
              positions={[cableCalculations.mainCable.from, cableCalculations.mainCable.to]}
              color="#F44336"
              weight={5}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Cable Length Summary */}
      {allRequiredElementsPlaced && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '5px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Cable Installation Summary:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#333' }}>
            <div>
              <strong>Charger Cables:</strong> {cableCalculations.chargerCables.length} × {cableCalculations.chargerCables[0]?.length.toFixed(1) || 0}m avg
            </div>
            <div>
              <strong>Main Supply Cable:</strong> {cableCalculations.mainCable?.length.toFixed(1) || 0}m
            </div>
            <div>
              <strong>Total Cable Length:</strong> {cableCalculations.totalLength.toFixed(1)}m
            </div>
            <div>
              <strong>Est. Cable Cost:</strong> £{(cableCalculations.totalLength * 25).toFixed(0)} {/* £25/m estimate */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargerLayout;
export type { LayoutElement };