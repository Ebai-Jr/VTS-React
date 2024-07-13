import React, { useState, useEffect } from 'react';
import '../App.css';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct

function Team() {
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ name: '', plateNumber: '', vehicleID: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const vehiclesCollection = collection(db, 'vehicles');
    const vehiclesSnapshot = await getDocs(vehiclesCollection);
    const vehiclesList = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVehicles(vehiclesList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newVehicle.name && newVehicle.plateNumber && newVehicle.vehicleID) {
      try {
        const docRef = await addDoc(collection(db, 'vehicles'), newVehicle);
        setVehicles(prevVehicles => [...prevVehicles, { id: docRef.id, ...newVehicle }]);
        setNewVehicle({ name: '', plateNumber: '', vehicleID: '' });
      } catch (error) {
        console.error("Error adding vehicle: ", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id));
    } catch (error) {
      console.error("Error deleting vehicle: ", error);
    }
  };

  return (
    <div className='team-page'>
      <h1>Vehicle Management</h1>
      
      <section className="vehicle-form">
        <h2>Register New Vehicle</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={newVehicle.name}
            onChange={handleInputChange}
            placeholder="Vehicle Name"
            required
          />
          <input
            type="text"
            name="plateNumber"
            value={newVehicle.plateNumber}
            onChange={handleInputChange}
            placeholder="Plate Number"
            required
          />
          <input
            type="text"
            name="vehicleID"
            value={newVehicle.vehicleID}
            onChange={handleInputChange}
            placeholder="Vehicle ID"
            required
          />
          <button type="submit" className="register-button">Register Vehicle</button>
        </form>
      </section>

      <section>
        <h2>Registered Vehicles</h2>
        <ul className="vehicle-list">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="vehicle-item">
              {vehicle.name} - {vehicle.plateNumber} (ID: {vehicle.vehicleID})
              <button onClick={() => handleDelete(vehicle.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Team;