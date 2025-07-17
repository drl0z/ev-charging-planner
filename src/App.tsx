import React, { useState } from 'react';
import './App.css';
import DepotMap from './DepotMap';

function App() {
  const [depotLocation, setDepotLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setDepotLocation({ lat, lng });
    console.log(`Depot selected at: ${lat}, ${lng}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>EV Charging Infrastructure Planner</h1>
        
        <div style={{ margin: '20px 0' }}>
          <h2>Step 1: Select Depot Location</h2>
          <p>Click on the map to set your depot location:</p>
        </div>

        <div style={{ width: '80%', maxWidth: '800px' }}>
          <DepotMap onLocationSelect={handleLocationSelect} />
        </div>

        {depotLocation && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Selected Depot Location:</h3>
            <p>Latitude: {depotLocation.lat.toFixed(6)}</p>
            <p>Longitude: {depotLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;