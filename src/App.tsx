import React, { useState } from 'react';
import './App.css';
import DepotLocationPanel from './components/DepotLocationPanel';
import VehicleConfigPanel from './components/VehicleConfigPanel';
import ChargerSelection from './components/ChargerSelection';
import ChargerLayout from './components/ChargerLayout';

// Types
export interface VehicleData {
  quantity: number;
  consumption: number;
  consumptionUnit: string;
  bufferPercent: number;
  dwellTime: number;
}

export interface DepotLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface ChargerType {
  id: string;
  power: number;
  name: string;
  type: 'AC' | 'DC';
  connector: string;
  typicalPrice: number;
}

export type UnitSystem = 'uk' | 'us' | 'metric-eff' | 'metric-cons';

function App() {
  // Main state
  const [depotLocation, setDepotLocation] = useState<DepotLocation | null>(null);
  const [dailyRange, setDailyRange] = useState(100);
  const [rangeUnit, setRangeUnit] = useState('miles');
  const [currentUnits, setCurrentUnits] = useState<UnitSystem>('uk');
  const [selectedCountry, setSelectedCountry] = useState('GB');
  
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    quantity: 10,
    consumption: 2.5,
    consumptionUnit: 'miles/kWh',
    bufferPercent: 20,
    dwellTime: 8.0
  });
  
  const [selectedCharger, setSelectedCharger] = useState<ChargerType | null>(null);

  // Calculate energy requirements
  const calculateRequirements = () => {
    const vehicleDistance = dailyRange * 2;
    let energyPerVehicle: number;
    
    // Calculate energy based on current unit system
    switch(currentUnits) {
      case 'uk': // miles/kWh
        energyPerVehicle = (vehicleDistance / vehicleData.consumption);
        break;
      case 'us': // kWh/100miles
        energyPerVehicle = (vehicleDistance * vehicleData.consumption / 100);
        break;
      case 'metric-eff': // km/kWh
        energyPerVehicle = (vehicleDistance / vehicleData.consumption);
        break;
      case 'metric-cons': // kWh/100km
        energyPerVehicle = (vehicleDistance * vehicleData.consumption / 100);
        break;
    }
    
    // Add buffer
    energyPerVehicle *= (1 + vehicleData.bufferPercent / 100);
    
    const totalFleetEnergy = energyPerVehicle * vehicleData.quantity;
    const minimumChargingPower = energyPerVehicle / vehicleData.dwellTime;
    
    return {
      vehicleDistance,
      energyPerVehicle,
      totalFleetEnergy,
      minimumChargingPower
    };
  };

  const requirements = calculateRequirements();

  return (
    <div className="app">
      <header className="app-header">
        <h1>EV Charging Infrastructure Planner</h1>
      </header>
      
      <main className="app-main">
        <div className="panels-container">
          {/* Left Panel - Depot Location & Range */}
          <DepotLocationPanel
            depotLocation={depotLocation}
            onLocationChange={setDepotLocation}
            dailyRange={dailyRange}
            onRangeChange={setDailyRange}
            rangeUnit={rangeUnit}
            onRangeUnitChange={setRangeUnit}
            currentUnits={currentUnits}
            onUnitsChange={setCurrentUnits}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
          />
          
          {/* Right Panel - Vehicle Configuration */}
          <VehicleConfigPanel
            vehicleData={vehicleData}
            onVehicleDataChange={setVehicleData}
            currentUnits={currentUnits}
            requirements={requirements}
            rangeUnit={rangeUnit}
          />
        </div>
        
        {/* Charger Selection */}
        {depotLocation && (
          <ChargerSelection
            minimumPowerPerVehicle={requirements.minimumChargingPower}
            vehicleQuantity={vehicleData.quantity}
            selectedCharger={selectedCharger}
            onChargerSelect={setSelectedCharger}
          />
        )}
        
        {/* Charger Layout */}
        {depotLocation && selectedCharger && (
          <ChargerLayout
            depotLocation={depotLocation}
            selectedCharger={selectedCharger}
            vehicleQuantity={vehicleData.quantity}
            onLayoutComplete={(elements, calculations) => {
              console.log('Layout completed:', elements, calculations);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;