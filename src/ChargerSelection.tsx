import React from 'react';

interface ChargerType {
  id: string;
  power: number; // kW
  name: string;
  type: 'AC' | 'DC';
  connector: string;
  typicalPrice: number; // £ (placeholder for future database)
}

interface ChargerSelectionProps {
  minimumPowerPerVehicle: number;
  vehicleQuantity: number;
  selectedCharger: ChargerType | null;
  onChargerSelect: (charger: ChargerType) => void;
}

const ChargerSelection: React.FC<ChargerSelectionProps> = ({ 
  minimumPowerPerVehicle, 
  vehicleQuantity, 
  selectedCharger, 
  onChargerSelect 
}) => {
  
  // Available charger types (future: this could come from a database)
  const availableChargers: ChargerType[] = [
    {
      id: 'ac22',
      power: 22,
      name: '22kW AC Charger',
      type: 'AC',
      connector: 'Type 2',
      typicalPrice: 3500
    },
    {
      id: 'dc50',
      power: 50,
      name: '50kW DC Fast Charger',
      type: 'DC',
      connector: 'CCS/CHAdeMO',
      typicalPrice: 15000
    },
    {
      id: 'dc120',
      power: 120,
      name: '120kW DC Ultra Fast',
      type: 'DC',
      connector: 'CCS',
      typicalPrice: 35000
    },
    {
      id: 'dc180',
      power: 180,
      name: '180kW DC Ultra Fast',
      type: 'DC',
      connector: 'CCS',
      typicalPrice: 55000
    }
  ];

  const isChargerSuitable = (chargerPower: number): boolean => {
    return chargerPower >= minimumPowerPerVehicle;
  };

  const calculateTotalPower = (chargerPower: number): number => {
    return chargerPower * vehicleQuantity;
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Step 3: Charger Selection</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Minimum power required per vehicle:</strong> {minimumPowerPerVehicle.toFixed(1)} kW</p>
        <p><strong>Number of vehicles:</strong> {vehicleQuantity}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
        {availableChargers.map((charger) => {
          const isSuitable = isChargerSuitable(charger.power);
          const isSelected = selectedCharger?.id === charger.id;
          const totalPower = calculateTotalPower(charger.power);

          return (
            <div
              key={charger.id}
              onClick={() => onChargerSelect(charger)}
              style={{
                border: isSelected ? '3px solid #2196F3' : '2px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f8ff' : 'white',
                opacity: isSuitable ? 1 : 0.6,
                position: 'relative'
              }}
            >
              {/* Suitability indicator */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: isSuitable ? '#4caf50' : '#f44336',
                color: 'white'
              }}>
                {isSuitable ? '✓ SUITABLE' : '✗ TOO SLOW'}
              </div>

              <h3 style={{ margin: '0 0 10px 0', color: isSelected ? '#2196F3' : '#333' }}>
                {charger.name}
              </h3>

              <div style={{ marginBottom: '10px', color: '#333' }}>
                <div><strong>Power:</strong> {charger.power} kW</div>
                <div><strong>Type:</strong> {charger.type}</div>
                <div><strong>Connector:</strong> {charger.connector}</div>
                <div><strong>Est. Price:</strong> £{charger.typicalPrice.toLocaleString()}</div>
              </div>

              <div style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '10px', 
                borderRadius: '4px',
                marginTop: '10px',
                color: '#333'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  Total Installation Power: {totalPower} kW
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  Total Est. Cost: £{(charger.typicalPrice * vehicleQuantity).toLocaleString()}
                </div>
              </div>

              {!isSuitable && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '8px', 
                  backgroundColor: '#ffebee', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#c62828'
                }}>
                  <strong>Warning:</strong> This charger is too slow for your dwell time requirements.
                  Vehicles may not fully charge within {Math.ceil(minimumPowerPerVehicle / charger.power * 10) / 10} hours needed.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCharger && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Selected Configuration:</h3>
          <p><strong>{selectedCharger.name}</strong> × {vehicleQuantity} units</p>
          <p><strong>Total Power:</strong> {calculateTotalPower(selectedCharger.power)} kW</p>
          <p><strong>Total Est. Cost:</strong> £{(selectedCharger.typicalPrice * vehicleQuantity).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default ChargerSelection;
export type { ChargerType };