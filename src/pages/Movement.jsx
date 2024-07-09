import React, { useEffect, useState } from 'react';
import initMoveMap from '../components/moveMap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Movement() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [noDataForDate, setNoDataForDate] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingIndex, setTrackingIndex] = useState(-1);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [map, setMap] = useState(null);
  const [updateMap, setUpdateMap] = useState(null);
  const [clearMap, setClearMap] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      filterLocations();
    }
  }, [locations, selectedDate]);

  useEffect(() => {
    if (filteredLocations.length > 0 && !map) {
      const newMap = initMoveMap(filteredLocations);
      setMap(newMap.map);
      setUpdateMap(() => newMap.updateMap);
      setClearMap(() => newMap.clearMap);
    }
  }, [filteredLocations]);

  useEffect(() => {
    if (isTracking && updateMap) {
      clearMap();
      updateMap(filteredLocations[trackingIndex], trackingIndex);
    }
  }, [trackingIndex, isTracking]);

  const fetchLocations = async () => {
    const locationsCollection = collection(db, 'locations');
    const locationsSnapshot = await getDocs(locationsCollection);
    const locationsList = locationsSnapshot.docs.map(doc => {
      const data = doc.data();
      const messageObj = JSON.parse(data.message);
      return {
        ...data,
        latitude: parseFloat(messageObj.latitude),
        longitude: parseFloat(messageObj.longitude),
        date: messageObj.date,
        timestamp: messageObj.timestamp
      };
    });
    console.log("Fetched locations:", locationsList);
    setLocations(locationsList);
    setFilteredLocations(locationsList);
  };

  const filterLocations = () => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      const formattedDate = `${year}-${parseInt(month)}-${parseInt(day)}`;
      
      const filtered = locations.filter(location => location.date === formattedDate);
      console.log("Filtered locations:", filtered);
      setFilteredLocations(filtered);
      setNoDataForDate(filtered.length === 0);
    } else {
      setFilteredLocations(locations);
      setNoDataForDate(false);
    }
    setTrackingIndex(-1);
    stopTracking();
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const startTracking = () => {
    setIsTracking(true);
    setTrackingIndex(0);
    const interval = setInterval(() => {
      setTrackingIndex(prevIndex => {
        if (prevIndex >= filteredLocations.length - 1) {
          stopTracking();
          return filteredLocations.length - 1;
        }
        return prevIndex + 1;
      });
    }, 1000); // Adjust this value to change the speed of tracking
    setTrackingInterval(interval);
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }
    if (updateMap && filteredLocations.length > 0) {
      filteredLocations.forEach((location, index) => updateMap(location, index));
    }
  };

  return (
    <div className="map-page">
      <div className="sidebar">
        <h1>Movement</h1>
        <div className="filter-section">
          <h2>Select Date</h2>
          <div className="date-filter">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
            />
            <button onClick={() => setSelectedDate('')} className="clear-button">Clear Date Filter</button>
          </div>
        </div>
        <div className="control-section">
          <button onClick={isTracking ? stopTracking : startTracking}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>
        {noDataForDate && <p className="no-data-message">No data available for selected date.</p>}
      </div>
      <div className="map-container">
        <div id="map" className="map"></div>
      </div>
    </div>
  );
}

export default Movement;