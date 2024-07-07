import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Style, Circle, Fill, Stroke} from 'ol/style.js';
import {fromLonLat} from 'ol/proj.js';
import { boundingExtent } from 'ol/extent';

function initHistoricalMap(locations, polygons, showPolygons) {
  console.log("Initializing map with locations:", locations);
  console.log("Initializing map with polygons:", polygons);

  if (locations.length === 0) {
    console.error("No locations provided to initHistoricalMap");
    return null;
  }

  // Parse the JSON string and create features for points
  const pointFeatures = locations.map(location => {
    try {
      let parsedLocation;
      if (typeof location.message === 'string') {
        parsedLocation = JSON.parse(location.message);
      } else if (typeof location.message === 'object') {
        parsedLocation = location.message;
      } else {
        console.error("Invalid location message format:", location.message);
        return null;
      }
      
      const lon = parseFloat(parsedLocation.longitude);
      const lat = parseFloat(parsedLocation.latitude);
      
      if (isNaN(lon) || isNaN(lat)) {
        console.error("Invalid coordinates:", parsedLocation);
        return null;
      }
      
      const transformedCoord = fromLonLat([lon, lat]);
      console.log(`Creating feature for location: ${lon}, ${lat}, transformed: ${transformedCoord}`);
      return new Feature({
        geometry: new Point(transformedCoord),
        name: `Location at ${parsedLocation.timestamp}`,
      });
    } catch (error) {
      console.error("Error parsing location:", error, location);
      return null;
    }
  }).filter(feature => feature !== null);

  console.log("Valid point features:", pointFeatures);

  // Create features for polygons
  const polygonFeatures = polygons.map(polygon => {
    console.log("Creating polygon feature:", polygon);
    try {
      let coordinates;
      if (typeof polygon.geometry.coordinates === 'string') {
        // Remove any non-JSON characters and parse
        coordinates = JSON.parse(polygon.geometry.coordinates.replace(/\s+/g, ''));
      } else if (Array.isArray(polygon.geometry.coordinates)) {
        coordinates = polygon.geometry.coordinates;
      } else {
        throw new Error('Invalid coordinates format');
      }
      return new Feature({
        geometry: new Polygon(coordinates),
        name: `Polygon ${polygon.id}`,
      });
    } catch (error) {
      console.error("Error parsing polygon:", error, polygon);
      return null;
    }
  }).filter(feature => feature !== null);

  console.log("Valid polygon features:", polygonFeatures);

  // Create a style for the points
  const pointStyle = new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({color: 'white', width: 2})
    })
  });

  // Create a style for the polygons
  const polygonStyle = new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  });

  // Set the style for all features
  pointFeatures.forEach(feature => feature.setStyle(pointStyle));
  polygonFeatures.forEach(feature => feature.setStyle(polygonStyle));

  // Create vector source and layer for the points
  const pointVectorSource = new VectorSource({
    features: pointFeatures,
  });

  const pointVectorLayer = new VectorLayer({
    source: pointVectorSource,
    zIndex: 1
  });

  // Create vector source and layer for the polygons
  const polygonVectorSource = new VectorSource({
    features: polygonFeatures,
  });

  const polygonVectorLayer = new VectorLayer({
    source: polygonVectorSource,
    zIndex: 0,
    visible: showPolygons
  });

  console.log("Polygon layer created:", polygonVectorLayer);

  const allFeatures = [...pointFeatures, ...polygonFeatures];
  let extent = boundingExtent(allFeatures.map(feature => feature.getGeometry().getExtent()));

  // Check if extent is valid
  if (extent.some(isNaN)) {
    console.error("Invalid extent calculated:", extent);
    extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10]; // Default to whole world
  }

  console.log("Calculated extent:", extent);

  // Create the map
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      pointVectorLayer,
      polygonVectorLayer,
    ],
    target: 'map',
    view: new View({
      center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
      zoom: 2
    }),
  });

  // Fit view to extent // What causes that quick 1 second zoom
  map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });

  console.log("Map view extent:", map.getView().calculateExtent());
  console.log("Map created with layers:", map.getLayers().getArray());
  return map;
}

export default initHistoricalMap;