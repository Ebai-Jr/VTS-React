import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../App.css';

function Selections() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const vehiclesCollection = collection(db, 'vehicles');
    
    const unsubscribe = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(vehiclesList);
      
      // Check local storage for previously selected vehicle
      const storedVehicleID = localStorage.getItem('selectedVehicleID');
      if (storedVehicleID) {
        const storedVehicle = vehiclesList.find(v => v.vehicleID === storedVehicleID);
        if (storedVehicle) {
          setSelectedVehicle(storedVehicle);
        } else {
          localStorage.removeItem('selectedVehicleID');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem('selectedVehicleID', vehicle.vehicleID);
    console.log(`Monitoring vehicle: ${vehicle.name} (${vehicle.plateNumber}) - ID: ${vehicle.vehicleID}`);
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
            <p>ID: {vehicle.vehicleID}</p>
          </div>
        ))}
      </div>
      {selectedVehicle && (
        <div className="selected-vehicle-info">
          <h2>Monitoring Vehicle:</h2>
          <p>{selectedVehicle.name} - {selectedVehicle.plateNumber} (ID: {selectedVehicle.vehicleID})</p>
        </div>
      )}
    </div>
  );
}

export default Selections;