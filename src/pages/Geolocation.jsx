import React, { useEffect, useRef, useState } from 'react';
import { initGeoMap, isPointInPolygon } from '../components/geoMap';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import GeoJSON from 'ol/format/GeoJSON.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { fromLonLat } from 'ol/proj.js';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style.js';

function Geolocation() {
  const mapRef = useRef(null);
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [vehicleFeature, setVehicleFeature] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      const { map, draw, modify, select, source } = initGeoMap('geo-map');
      mapRef.current = { map, draw, modify, select, source };

      draw.on('drawend', (event) => {
        const feature = event.feature;
        savePolygon(feature);
      });

      select.on('select', (event) => {
        if (event.selected.length > 0) {
          setSelectedPolygon(event.selected[0]);
        } else {
          setSelectedPolygon(null);
        }
      });

      modify.on('modifyend', (event) => {
        const feature = event.features.getArray()[0];
        updatePolygon(feature);
      });

      loadPolygons();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.map.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);

  const savePolygon = async (feature) => {
    const geojson = new GeoJSON().writeFeatureObject(feature);
    const flattenedGeojson = {
      type: geojson.type,
      geometry: {
        type: geojson.geometry.type,
        coordinates: JSON.stringify(geojson.geometry.coordinates),
      },
      properties: geojson.properties,
    };
    try {
      const docRef = await addDoc(collection(db, "polygons"), flattenedGeojson);
      feature.setId(docRef.id);
      setPolygons(prevPolygons => [...prevPolygons, feature]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const loadPolygons = async () => {
    const querySnapshot = await getDocs(collection(db, "polygons"));
    const loadedPolygons = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const feature = new GeoJSON().readFeature({
        type: data.type,
        geometry: {
          type: data.geometry.type,
          coordinates: JSON.parse(data.geometry.coordinates),
        },
        properties: data.properties,
      });
      feature.setId(doc.id);
      loadedPolygons.push(feature);
      mapRef.current.source.addFeature(feature);
    });
    setPolygons(loadedPolygons);
  };

  const updatePolygon = async (feature) => {
    const geojson = new GeoJSON().writeFeatureObject(feature);
    const flattenedGeojson = {
      type: geojson.type,
      geometry: {
        type: geojson.geometry.type,
        coordinates: JSON.stringify(geojson.geometry.coordinates),
      },
      properties: geojson.properties,
    };
    try {
      await updateDoc(doc(db, "polygons", feature.getId()), flattenedGeojson);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deletePolygon = async (polygonToDelete) => {
    if (polygonToDelete && polygonToDelete.getId()) {
      try {
        await deleteDoc(doc(db, "polygons", polygonToDelete.getId()));
        mapRef.current.source.removeFeature(polygonToDelete);
        setPolygons(prevPolygons => prevPolygons.filter(p => p !== polygonToDelete));
        if (selectedPolygon === polygonToDelete) {
          setSelectedPolygon(null);
        }
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    } else {
      console.error("Invalid polygon or polygon has no ID");
    }
  };

  const checkVehicleLocation = () => {
    // ... (keep this function as is)
  };

  return (
    <div className="map-page">
      <div className="sidebar">
      <div className="control-section">
        <h1>Geolocation</h1>
        <p>Draw polygons on the map to define geofenced areas.</p>
        <h2>Defined Areas:</h2>
        <ul>
          {polygons.map((polygon, index) => (
            <li key={polygon.getId()}>
              Area {index + 1}
              <button onClick={() => deletePolygon(polygon)}>Delete</button>
            </li>
          ))}
        </ul>
        <button onClick={checkVehicleLocation}>Check Vehicle Location</button>
      </div>
      </div>
      <div className="map-container">
        <div id="geo-map" className="map"></div>
      </div>
    </div>
  );
}

export default Geolocation;