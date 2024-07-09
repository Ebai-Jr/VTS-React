import React, { useEffect, useRef, useState } from 'react';
import initMap from '../components/olMap';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Home() {
  const mapRef = useRef(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const defaultLongitude = 10.254624;
      const defaultLatitude = 6.005553;
      mapRef.current = initMap(defaultLongitude, defaultLatitude);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const fetchLastLocation = async () => {
    try {
      console.log("Fetching last location...");
      const locationsCollection = collection(db, 'locations');
      const q = query(locationsCollection, orderBy('timestamp', 'desc'), limit(1));
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        updateLocationFromSnapshot(querySnapshot.docs[0]);
      } else {
        console.log('No locations found in the database.');
      }
    } catch (error) {
      console.error('Error fetching last location:', error);
    }
  };

  const updateLocationFromSnapshot = (doc) => {
    const locationData = doc.data();
    console.log("Raw location data:", locationData);
    
    let parsedLocation;
    try {
      parsedLocation = JSON.parse(locationData.message);
    } catch (error) {
      console.error("Error parsing location data:", error);
      parsedLocation = locationData.message; // Assume it's already an object if parsing fails
    }
    console.log("Parsed location:", parsedLocation);
    
    setLastLocation({
      ...parsedLocation,
      firestoreTimestamp: locationData.timestamp.toDate()
    });
    
    if (mapRef.current) {
      mapRef.current.updateLocation(
        parseFloat(parsedLocation.longitude), 
        parseFloat(parsedLocation.latitude)
      );
    }
  };

  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      // Stop live tracking
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsLiveTracking(false);
    } else {
      // Start live tracking
      const locationsCollection = collection(db, 'locations');
      const q = query(locationsCollection, orderBy('timestamp', 'desc'), limit(1));
      
      unsubscribeRef.current = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          updateLocationFromSnapshot(querySnapshot.docs[0]);
        }
      }, (error) => {
        console.error("Error in live tracking:", error);
      });
      
      setIsLiveTracking(true);
    }
  };

  return (
    <div className="map-page">
    <div className="sidebar">
    <div className="control-section">
      <h1>Home</h1>
      <button onClick={fetchLastLocation}>Get Last Location</button>
      <button onClick={toggleLiveTracking}>
        {isLiveTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
      </button>
      {lastLocation && (
        <p>
          Last known location: Longitude {lastLocation.longitude}, Latitude {lastLocation.latitude}
          <br />
          Date: {lastLocation.date}, Time: {lastLocation.timestamp}
          <br />
          Firestore Timestamp: {lastLocation.firestoreTimestamp.toString()}
        </p>
      )}
      </div>
      </div>
      <div className="map-container">
        <div id="map" className="map"></div>
      </div>
    </div>
  )
}

export default Home;