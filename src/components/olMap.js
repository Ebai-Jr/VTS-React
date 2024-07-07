import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Style, Icon} from 'ol/style.js';
import {fromLonLat} from 'ol/proj.js';

function initMap(longitude, latitude) {
  // Create the icon feature
  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([longitude, latitude])),
    name: 'Location',
  });

  // Create a style for the icon
  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'https://openlayers.org/en/latest/examples/data/icon.png',  // URL to a marker icon
      scale: 1  // Adjust this value to change the size of the icon
    }),
  });

  iconFeature.setStyle(iconStyle);

  // Create vector source and layer for the icon
  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 1  // Ensure the marker is on top of the map
  });

  // Create the map
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer,
    ],
    target: 'map',
    view: new View({
      center: fromLonLat([longitude, latitude]),
      zoom: 10,
    }),
  });

  return map;
}

export default initMap;