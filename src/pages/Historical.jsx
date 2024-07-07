import React, { useEffect, useRef, useState } from 'react';
import initHistoricalMap from '../components/hisMap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Style, Circle, Fill, Stroke } from 'ol/style';

function Historical() {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [showPolygons, setShowPolygons] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationsCollection = collection(db, 'locations');
      const locationsSnapshot = await getDocs(locationsCollection);
      const locationsList = locationsSnapshot.docs.map(doc => doc.data());
      console.log("Fetched locations:", locationsList);
      setLocations(locationsList);
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
            coordinates: data.geometry.coordinates // Don't parse here, we'll handle it in hisMap.js
          }
        };
      });
      console.log("Fetched polygons:", polygonsList);
      setPolygons(polygonsList);
    };

    fetchLocations();
    fetchPolygons();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && polygons.length > 0 && !mapRef.current) {
      mapRef.current = initHistoricalMap(locations, polygons, showPolygons);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, [locations, polygons, showPolygons]);

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

  return (
    <div className='historical'>
      <h1>Historical</h1>
      <button onClick={togglePolygons}>
        {showPolygons ? 'Hide Polygons' : 'View with Polygons'}
      </button>
      <div id="map" className="map"></div>
    </div>
  )
}

export default Historical;