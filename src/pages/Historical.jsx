import React, { useEffect, useRef, useState } from 'react';
import initHistoricalMap from '../components/hisMap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Style, Circle, Fill, Stroke } from 'ol/style';

function Historical() {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [showPolygons, setShowPolygons] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [noDataForDate, setNoDataForDate] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchPolygons();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && polygons.length > 0) {
      filterLocations();
    }
  }, [locations, polygons, selectedDate]);

  useEffect(() => {
    if (filteredLocations.length > 0 && polygons.length > 0) {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
      mapRef.current = initHistoricalMap(filteredLocations, polygons, showPolygons);
      setNoDataForDate(false);
    } else if (filteredLocations.length === 0 && selectedDate) {
      setNoDataForDate(true);
    }
  }, [filteredLocations, polygons, showPolygons]);

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

  const fetchPolygons = async () => {
    const polygonsCollection = collection(db, 'polygons');
    const polygonsSnapshot = await getDocs(polygonsCollection);
    const polygonsList = polygonsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        geometry: {
          ...data.geometry,
          coordinates: data.geometry.coordinates
        }
      };
    });
    console.log("Fetched polygons:", polygonsList);
    setPolygons(polygonsList);
  };

  const filterLocations = () => {
    if (selectedDate) {
      // Convert selectedDate to match the format in the database
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
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const togglePolygons = () => {
    const newShowPolygons = !showPolygons;
    setShowPolygons(newShowPolygons);
    console.log("Toggling polygons:", newShowPolygons);
    if (mapRef.current) {
      const layers = mapRef.current.getLayers().getArray();
      console.log("Layers:", layers);
      if (layers.length > 2) {
        const polygonLayer = layers[2];
        console.log("Polygon layer:", polygonLayer);
        polygonLayer.setVisible(newShowPolygons);
        console.log("Polygon layer visibility set to:", newShowPolygons);
      } else {
        console.error("Polygon layer not found");
      }
      checkPointsInPolygons();
    } else {
      console.error("Map not initialized");
    }
  };

  const checkPointsInPolygons = () => {
    if (!mapRef.current) return;

    const vectorLayer = mapRef.current.getLayers().getArray()[1];
    const polygonLayer = mapRef.current.getLayers().getArray()[2];

    vectorLayer.getSource().getFeatures().forEach(point => {
      let isInside = false;
      polygonLayer.getSource().getFeatures().forEach(polygon => {
        if (polygon.getGeometry().intersectsCoordinate(point.getGeometry().getCoordinates())) {
          isInside = true;
        }
      });
      point.setStyle(getPointStyle(isInside));
    });
  };

  // Work on changing the icon color from red to green when inside the polygon/////////////////////////////
  const getPointStyle = (isInside) => {
    return new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({color: isInside ? 'green' : 'red'}),
        stroke: new Stroke({color: 'white', width: 2})
      })
    });
  };

  const checkAllPointsInPolygons = () => {
    if (!mapRef.current) return;

    const vectorLayer = mapRef.current.getLayers().getArray()[1];
    const polygonLayer = mapRef.current.getLayers().getArray()[2];

    let allInside = true;
    let pointsOutside = 0;

    vectorLayer.getSource().getFeatures().forEach(point => {
      let isInside = false;
      polygonLayer.getSource().getFeatures().forEach(polygon => {
        if (polygon.getGeometry().intersectsCoordinate(point.getGeometry().getCoordinates())) {
          isInside = true;
        }
      });
      if (!isInside) {
        allInside = false;
        pointsOutside++;
      }
    });

    return { allInside, pointsOutside };
  };

  const handleGeofenceCheck = () => {
    const result = checkAllPointsInPolygons();
    if (result.allInside) {
      alert("All locations are within the geofence.");
    } else {
      alert(`${result.pointsOutside} location(s) are outside the geofence.`);
    }
  };

  return (
    <div className="map-page">
      <div className="sidebar">
        <h1>Historical</h1>
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
        <button onClick={togglePolygons}>
          {showPolygons ? 'Hide Polygons' : 'View with Polygons'}
        </button>
        <button onClick={handleGeofenceCheck}>Geofence Check</button>
        </div>
        {noDataForDate && <p className="no-data-message">No data available for selected date.</p>}
      </div>
      <div className="map-container">
        <div id="map" className="map"></div>
      </div>
    </div>
  )
}

export default Historical;