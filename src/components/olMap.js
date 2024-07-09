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
  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([longitude, latitude])),
    name: 'Location',
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'https://openlayers.org/en/latest/examples/data/icon.png',
      scale: 1
    }),
  });

  iconFeature.setStyle(iconStyle);

  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 1
  });

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

  map.updateLocation = function(newLongitude, newLatitude) {
    const newCoords = fromLonLat([newLongitude, newLatitude]);
    iconFeature.getGeometry().setCoordinates(newCoords);
    map.getView().setCenter(newCoords);
    map.getView().setZoom(15);  // Zoom in when updating location
  };

  return map;
}

export default initMap;