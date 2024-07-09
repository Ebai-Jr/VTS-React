import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Style, Circle, Fill, Stroke} from 'ol/style.js';
import {fromLonLat} from 'ol/proj.js';
import { boundingExtent } from 'ol/extent';

function initMoveMap(locations) {
  if (locations.length === 0) {
    console.error("No locations provided to initMoveMap");
    return null;
  }

  // Create a style for the points
  const pointStyle = new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({color: 'white', width: 2})
    })
  });

  // Create vector source and layer for the points
  const pointVectorSource = new VectorSource();

  const pointVectorLayer = new VectorLayer({
    source: pointVectorSource,
    zIndex: 1
  });

  // Calculate initial extent
  const extent = boundingExtent(locations.map(location => 
    fromLonLat([parseFloat(location.longitude), parseFloat(location.latitude)])
  ));

  // Create the map
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      pointVectorLayer,
    ],
    target: 'map',
    view: new View({
      center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
      zoom: 2
    }),
  });

  // Fit view to extent
  map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });

  function updateMap(location, index) {
    const feature = new Feature({
      geometry: new Point(fromLonLat([parseFloat(location.longitude), parseFloat(location.latitude)])),
      name: `Location at ${location.timestamp}`,
    });
    feature.setStyle(pointStyle);
    pointVectorSource.addFeature(feature);

    if (index === locations.length - 1) {
      map.getView().fit(pointVectorSource.getExtent(), { padding: [50, 50, 50, 50], duration: 1000 });
    }
  }

  function clearMap() {
    pointVectorSource.clear();
  }

  return {
    map: map,
    updateMap: updateMap,
    clearMap: clearMap
  };
}

export default initMoveMap;