import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../App.css';

function Selections() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const vehiclesCollection = collection(db, 'vehicles');
    
    // Set up a real-time listener
    const unsubscribe = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(vehiclesList);
      
      // If the selected vehicle was deleted, deselect it
      if (selectedVehicle && !vehiclesList.find(v => v.id === selectedVehicle.id)) {
        setSelectedVehicle(null);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [selectedVehicle]);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    console.log(`Monitoring vehicle: ${vehicle.name} (${vehicle.plateNumber})`);
  };

  return (
    <div className='selections-page'>
      <h1>Vehicle Selection</h1>
      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className={`vehicle-card ${selectedVehicle && selectedVehicle.id === vehicle.id ? 'selected' : ''}`}
            onClick={() => handleVehicleSelect(vehicle)}
          >
            <h3>{vehicle.name}</h3>
            <p>Plate: {vehicle.plateNumber}</p>
          </div>
        ))}
      </div>
      {selectedVehicle && (
        <div className="selected-vehicle-info">
          <h2>Monitoring Vehicle:</h2>
          <p>{selectedVehicle.name} - {selectedVehicle.plateNumber}</p>
        </div>
      )}
    </div>
  );
}

export default Selections;