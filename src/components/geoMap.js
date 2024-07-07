import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Draw from 'ol/interaction/Draw.js';
import Modify from 'ol/interaction/Modify.js';
import Select from 'ol/interaction/Select.js';
import {Style, Fill, Stroke} from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {containsCoordinate} from 'ol/extent.js';

function initGeoMap(target) {
  const source = new VectorSource({wrapX: false});

  const vector = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      })
    })
  });

  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vector
    ],
    target: target,
    view: new View({
      center: [0, 0],
      zoom: 2
    })
  });

  const draw = new Draw({
    source: source,
    type: 'Polygon'
  });

  const modify = new Modify({source: source});
  const select = new Select();

  map.addInteraction(draw);
  map.addInteraction(modify);
  map.addInteraction(select);

  return { map, draw, modify, select, source };
}

function isPointInPolygon(point, polygon) {
  const extent = polygon.getExtent();
  return containsCoordinate(extent, point);
}

export { initGeoMap, isPointInPolygon };