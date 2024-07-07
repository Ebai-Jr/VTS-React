import React, { useEffect, useRef } from 'react';
import initMap from '../components/olMap';

function Home() {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the map when the component mounts
    if (!mapRef.current) {
      // Replace these coordinates with your desired location
      const longitude = 10.254624;
      const latitude = 6.005553;
      mapRef.current = initMap(longitude, latitude);
    }

    // Cleanup function to remove the map when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className='home'>
      <h1>Home</h1>
      <div id="map" className="map"></div>
    </div>
  )
}

export default Home;