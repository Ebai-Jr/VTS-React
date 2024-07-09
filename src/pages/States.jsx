import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import "../App.css"

function States() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const locationsCollection = collection(db, 'locations');
    const q = query(locationsCollection, orderBy('timestamp', 'asc'));
    const locationsSnapshot = await getDocs(q);
    const locationsList = locationsSnapshot.docs.map(doc => {
      const data = doc.data();
      const messageObj = JSON.parse(data.message);
      return {
        latitude: parseFloat(messageObj.latitude),
        longitude: parseFloat(messageObj.longitude),
        date: messageObj.date,
        timestamp: data.timestamp.toDate()
      };
    });
    
    const calculatedStates = calculateStates(locationsList);
    setStates(calculatedStates);
  };

  const calculateStates = (locations) => {
    const states = [];
    for (let i = 1; i < locations.length; i++) {
      const prevLocation = locations[i - 1];
      const currentLocation = locations[i];
      
      const distance = calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude
      );

      const timeDiff = (currentLocation.timestamp - prevLocation.timestamp) / 1000; // in seconds

      const state = {
        timestamp: currentLocation.timestamp,
        date: currentLocation.date,
        isMoving: distance > 2,
        distance: distance,
        timeDiff: timeDiff
      };

      states.push(state);
    }
    return states;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <div className='states-page'>
      <h1>Vehicle States</h1>
      <div className="table-container">
        <table className="states-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>State</th>
              <th>Distance (m)</th>
              <th>Time Diff (s)</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state, index) => (
              <tr key={index}>
                <td>{state.date}</td>
                <td>{state.timestamp.toLocaleTimeString()}</td>
                <td className={state.isMoving ? 'moving' : 'not-moving'}>
                  {state.isMoving ? 'Moving' : 'Not Moving'}
                </td>
                <td>{state.distance.toFixed(2)}</td>
                <td>{state.timeDiff.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default States;