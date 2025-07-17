import React from 'react';

interface VehicleData {
  quantity: number;
  consumption: number; // kWh/100km
  bufferPercent: number;
  dwellTime: number; // hours
}

interface VehicleInfoProps {
  vehicleData: VehicleData;
  onVehicleDataChange: (data: VehicleData) => void;
  dailyRange: number;
}

interface CalculationResults {
  vehicleDistance: number;
  energyPerVehicle: number;
  totalFleetEnergy: number;
  minimumChargingPower: number;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicleData, onVehicleDataChange, dailyRange }) => {
  
  const updateVehicleData = (field: keyof VehicleData, value: number) => {
    onVehicleDataChange({
      ...vehicleData,
      [field]: value
    });
  };

  // Calculate energy requirements
  const calculateRequirements = (): CalculationResults => {
    const vehicleDistance = dailyRange * 2; // Round trip
    const baseEnergy = (vehicleDistance * vehicleData.consumption) / 100; // kWh
    const energyWithBuffer = baseEnergy * (1 + vehicleData.bufferPercent / 100);
    const totalFleetEnergy = energyWithBuffer * vehicleData.quantity;
    const minimumChargingPower = energyWithBuffer / vehicleData.dwellTime; // kW per vehicle

    return {
      vehicleDistance,
      energyPerVehicle: energyWithBuffer,
      totalFleetEnergy,
      minimumChargingPower
    };
  };

  const results = calculateRequirements();

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Step 2: Vehicle Information</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label htmlFor="quantity">Number of Vehicles:</label>
          <input
            id="quantity"
            type="number"
            value={vehicleData.quantity}
            onChange={(e) => updateVehicleData('quantity', Number(e.target.value))}
            min="1"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="consumption">Energy Consumption (kWh/100km):</label>
          <input
            id="consumption"
            type="number"
            value={vehicleData.consumption}
            onChange={(e) => updateVehicleData('consumption', Number(e.target.value))}
            min="10"
            max="50"
            step="0.1"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="buffer">Energy Buffer (%):</label>
          <input
            id="buffer"
            type="number"
            value={vehicleData.bufferPercent}
            onChange={(e) => updateVehicleData('bufferPercent', Number(e.target.value))}
            min="0"
            max="50"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="dwellTime">Dwell Time (hours):</label>
          <input
            id="dwellTime"
            type="number"
            value={vehicleData.dwellTime}
            onChange={(e) => updateVehicleData('dwellTime', Number(e.target.value))}
            min="1"
            max="24"
            step="0.5"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        border: '2px solid #2196F3',
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1976D2' }}>Calculated Requirements:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>VEHICLE DISTANCE (ROUND TRIP)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {results.vehicleDistance.toFixed(1)} km
            </div>
          </div>
          <div style={{ 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ENERGY PER VEHICLE</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {results.energyPerVehicle.toFixed(1)} kWh
            </div>
          </div>
          <div style={{ 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>TOTAL FLEET ENERGY</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e65100' }}>
              {results.totalFleetEnergy.toFixed(1)} kWh
            </div>
          </div>
          <div style={{ 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>MIN. CHARGING POWER/VEHICLE</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
              {results.minimumChargingPower.toFixed(1)} kW
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
export type { VehicleData, CalculationResults };