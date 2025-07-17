import React, { useState } from 'react';
import './App.css';
import DepotMap from './DepotMap';
import VehicleInfo, { VehicleData } from './VehicleInfo';
import ChargerSelection, { ChargerType } from './ChargerSelection';

function App() {
  const [depotLocation, setDepotLocation] = useState<{lat: number, lng: number} | null>(null);
  const [dailyRange, setDailyRange] = useState<number>(50); // Default 50km
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    quantity: 5,
    consumption: 25, // kWh/100km - typical for electric van
    bufferPercent: 20,
    dwellTime: 8 // hours
  });
  const [selectedCharger, setSelectedCharger] = useState<ChargerType | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setDepotLocation({ lat, lng });
    console.log(`Depot selected at: ${lat}, ${lng}`);
  };

  const handleVehicleDataChange = (data: VehicleData) => {
    setVehicleData(data);
  };

  const handleChargerSelect = (charger: ChargerType) => {
    setSelectedCharger(charger);
  };

  // Calculate minimum power per vehicle for charger validation
  const calculateMinimumPower = (): number => {
    const vehicleDistance = dailyRange * 2;
    const baseEnergy = (vehicleDistance * vehicleData.consumption) / 100;
    const energyWithBuffer = baseEnergy * (1 + vehicleData.bufferPercent / 100);
    return energyWithBuffer / vehicleData.dwellTime;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>EV Charging Infrastructure Planner</h1>
        
        <div style={{ margin: '20px 0' }}>
          <h2>Step 1: Select Depot Location & Daily Range</h2>
          <p>Click on the map to set your depot location:</p>
          
          <div style={{ margin: '10px 0' }}>
            <label htmlFor="dailyRange">Daily Range (km): </label>
            <input
              id="dailyRange"
              type="number"
              value={dailyRange}
              onChange={(e) => setDailyRange(Number(e.target.value))}
              min="1"
              max="1000"
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
        </div>

        <div style={{ width: '80%', maxWidth: '800px' }}>
          <DepotMap onLocationSelect={handleLocationSelect} dailyRange={dailyRange} />
        </div>

        <div style={{ width: '80%', maxWidth: '800px' }}>
          <VehicleInfo 
            vehicleData={vehicleData}
            onVehicleDataChange={handleVehicleDataChange}
            dailyRange={dailyRange}
          />
        </div>

        <div style={{ width: '80%', maxWidth: '800px' }}>
          <ChargerSelection
            minimumPowerPerVehicle={calculateMinimumPower()}
            vehicleQuantity={vehicleData.quantity}
            selectedCharger={selectedCharger}
            onChargerSelect={handleChargerSelect}
          />
        </div>

        {depotLocation && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Selected Depot Location:</h3>
            <p>Latitude: {depotLocation.lat.toFixed(6)}</p>
            <p>Longitude: {depotLocation.lng.toFixed(6)}</p>
            <p>Daily Range: {dailyRange} km</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;