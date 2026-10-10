// The map picture. Real map data from OpenFreeMap (free, no key), repainted in the app's own dark glass colours
// so it does not look like Google Maps. If the map cannot be downloaded (no internet), a plain dark background is
// used and the trip route is still drawn on it.

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export const MAP_ATTRIBUTION = 'OpenFreeMap © OpenMapTiles Data from OpenStreetMap';

const DARK = {
  background: '#140f3d',
  land: '#1b1650',
  green: '#1a2f63',
  water: '#0e3a6b',
  road: '#7c6be0',
  roadMinor: '#4b3fa8',
  boundary: '#f472b6',
  text: '#e9e5ff',
  halo: '#140f3d',
};

export const EMPTY_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': DARK.background } }],
};

// Repaints every layer by its type, so it does not depend on the layer names of the original style
export const darkenStyle = (style) => {
  if (!style || !Array.isArray(style.layers)) return style;

  const layers = style.layers.map((layer) => {
    const id = String(layer.id || '').toLowerCase();
    const paint = { ...(layer.paint || {}) };

    switch (layer.type) {
      case 'background':
        paint['background-color'] = DARK.background;
        break;
      case 'fill':
        delete paint['fill-pattern'];
        delete paint['fill-outline-color'];
        paint['fill-color'] = id.includes('water')
          ? DARK.water
          : /park|wood|grass|green|forest|landcover|vegetation|farm/.test(id)
          ? DARK.green
          : DARK.land;
        break;
      case 'line':
        delete paint['line-pattern'];
        paint['line-color'] = id.includes('water')
          ? DARK.water
          : id.includes('boundary')
          ? DARK.boundary
          : id.includes('casing')
          ? DARK.background
          : /minor|service|path|track|street|pedestrian/.test(id)
          ? DARK.roadMinor
          : DARK.road;
        if (id.includes('boundary')) paint['line-opacity'] = 0.5;
        break;
      case 'symbol':
        paint['text-color'] = DARK.text;
        paint['text-halo-color'] = DARK.halo;
        paint['text-halo-width'] = 1.2;
        break;
      case 'fill-extrusion':
        paint['fill-extrusion-color'] = DARK.land;
        break;
      default:
        break;
    }

    return { ...layer, paint };
  });

  return { ...style, layers };
};

// Returns { style, offline }
export const loadMapStyle = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(STYLE_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error('style failed');
    const style = await response.json();
    return { style: darkenStyle(style), offline: false };
  } catch {
    return { style: EMPTY_STYLE, offline: true };
  }
};
