import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crosshair } from 'lucide-react';
import { loadMapStyle, MAP_ATTRIBUTION } from './mapStyle';
import { boundsOf } from './tripAnalysis';

const GRADIENT = ['interpolate', ['linear'], ['line-progress'], 0, '#22d3ee', 0.5, '#a78bfa', 1, '#f472b6'];

const toCollection = (path) => ({
  type: 'FeatureCollection',
  features:
    path.length >= 2
      ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: path.map((p) => [p[1], p[0]]) } }]
      : [],
});

// A glossy round pin with an emoji
const makePin = (emoji, title, big) => {
  const el = document.createElement('div');
  el.textContent = emoji;
  el.title = title || '';
  const size = big ? 40 : 32;
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    `font-size:${big ? 22 : 17}px`,
    'background:linear-gradient(145deg,rgba(255,255,255,0.95),rgba(224,231,255,0.85))',
    'border:2px solid #ffffff',
    'box-shadow:0 6px 14px rgba(20,10,80,0.55),0 0 18px rgba(167,139,250,0.7)',
  ].join(';');
  return el;
};

// The real map (OpenFreeMap) in the app's own dark glass style, with the trip route drawn as a glowing trail.
//   path     [[lat, lon, time], ...]
//   markers  [{ lat, lon, emoji, title }]
//   live     follow the newest point (during a trip)
//   replayKey  change this number to play the trip again
export default function TripMap({ path, markers = [], live = false, liveEmoji = '🚗', replayKey = 0, height = '100%', interactive = true }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);
  const liveMarkerRef = useRef(null);
  const pinsRef = useRef([]);
  const followRef = useRef(true);
  const fittedRef = useRef(false);
  const replayFrameRef = useRef(null);
  const pathRef = useRef(path);
  const markersRef = useRef(markers);
  pathRef.current = path;
  markersRef.current = markers;

  const [state, setState] = useState('loading'); // loading | ready | failed
  const [offline, setOffline] = useState(false);
  const [showRecenter, setShowRecenter] = useState(false);

  // ----- drawing helpers (they always read the newest path / markers) -----
  const ensureLiveMarker = () => {
    const map = mapRef.current;
    if (!map) return null;
    if (!liveMarkerRef.current) {
      const el = makePin(liveEmoji, 'You', true);
      liveMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([0, 0]).addTo(map);
    }
    return liveMarkerRef.current;
  };

  const drawPath = () => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const current = pathRef.current;
    const source = map.getSource('trail');
    if (source) source.setData(toCollection(current));
    if (current.length === 0) return;

    const lastPoint = current[current.length - 1];

    if (live) {
      ensureLiveMarker().setLngLat([lastPoint[1], lastPoint[0]]);
      if (!fittedRef.current) {
        map.jumpTo({ center: [lastPoint[1], lastPoint[0]], zoom: 15 });
        fittedRef.current = true;
      } else if (followRef.current) {
        map.easeTo({ center: [lastPoint[1], lastPoint[0]], duration: 800 });
      }
    } else if (!fittedRef.current) {
      map.fitBounds(boundsOf(current), { padding: 60, duration: 0, maxZoom: 15 });
      fittedRef.current = true;
    }
  };

  const drawMarkers = () => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    pinsRef.current.forEach((pin) => pin.remove());
    pinsRef.current = markersRef.current.map((m) =>
      new maplibregl.Marker({ element: makePin(m.emoji, m.title, false), anchor: 'center' }).setLngLat([m.lon, m.lat]).addTo(map)
    );
  };

  // ----- create the map once -----
  useEffect(() => {
    let cancelled = false;
    let map = null;

    (async () => {
      const { style, offline: isOffline } = await loadMapStyle();
      if (cancelled || !containerRef.current) return;
      setOffline(isOffline);

      try {
        const first = pathRef.current[0];
        map = new maplibregl.Map({
          container: containerRef.current,
          style,
          center: first ? [first[1], first[0]] : [78.9, 22.5],
          zoom: first ? 12 : 3.5,
          pitch: live ? 45 : 35,
          attributionControl: false,
          interactive,
          fadeDuration: 0,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          if (cancelled) return;
          map.addSource('trail', { type: 'geojson', lineMetrics: true, data: toCollection([]) });
          map.addLayer({
            id: 'trail-glow',
            type: 'line',
            source: 'trail',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-width': 16, 'line-blur': 12, 'line-opacity': 0.55, 'line-gradient': GRADIENT },
          });
          map.addLayer({
            id: 'trail-line',
            type: 'line',
            source: 'trail',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-width': 5, 'line-gradient': GRADIENT },
          });
          readyRef.current = true;
          setState('ready');
          drawPath();
          drawMarkers();
        });

        if (live) {
          map.on('dragstart', () => {
            followRef.current = false;
            setShowRecenter(true);
          });
        }
      } catch (error) {
        console.error('Map could not start:', error);
        setState('failed');
      }
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      if (replayFrameRef.current) cancelAnimationFrame(replayFrameRef.current);
      if (map) map.remove();
      mapRef.current = null;
      liveMarkerRef.current = null;
      pinsRef.current = [];
    };
  }, []);

  useEffect(() => {
    drawPath();
  }, [path]);

  useEffect(() => {
    drawMarkers();
  }, [markers]);

  // ----- replay: the trail draws itself and the pin travels along it -----
  useEffect(() => {
    if (!replayKey || !readyRef.current || !mapRef.current) return undefined;
    const full = pathRef.current;
    if (full.length < 2) return undefined;

    const map = mapRef.current;
    const source = map.getSource('trail');
    const pin = ensureLiveMarker();
    const duration = 9000;
    const startedAt = performance.now();

    if (replayFrameRef.current) cancelAnimationFrame(replayFrameRef.current);

    const step = (now) => {
      const fraction = Math.min(1, (now - startedAt) / duration);
      const count = Math.max(2, Math.floor(fraction * full.length));
      source.setData(toCollection(full.slice(0, count)));
      const point = full[Math.min(count, full.length) - 1];
      pin.setLngLat([point[1], point[0]]);

      if (fraction < 1) {
        replayFrameRef.current = requestAnimationFrame(step);
      } else {
        source.setData(toCollection(full));
        replayFrameRef.current = null;
        setTimeout(() => {
          if (liveMarkerRef.current && !live) {
            liveMarkerRef.current.remove();
            liveMarkerRef.current = null;
          }
        }, 1200);
      }
    };

    replayFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (replayFrameRef.current) cancelAnimationFrame(replayFrameRef.current);
    };
  }, [replayKey]);

  const recenter = () => {
    followRef.current = true;
    setShowRecenter(false);
    drawPath();
  };

  const note = (text) => (
    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, padding: '6px 10px', borderRadius: 12, background: 'rgba(15,10,50,0.7)', color: '#fff', fontSize: 10.5, fontWeight: 800, textAlign: 'center', pointerEvents: 'none' }}>
      {text}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '26px',
        overflow: 'hidden',
        background: '#140f3d',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 14px 30px rgba(30,20,100,0.4), inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Gloss on the top edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))', pointerEvents: 'none' }} />

      {state === 'loading' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>Loading map...</div>}
      {state === 'failed' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>The map could not load on this phone. Your route is still saved.</div>}
      {state === 'ready' && offline && note('Map pictures need internet. Your route is shown on a plain background.')}

      {live && showRecenter && (
        <button type="button" onClick={recenter} aria-label="Follow me" style={{ position: 'absolute', right: 10, top: 10, width: 38, height: 38, borderRadius: 13, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.9)', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 14px rgba(20,10,80,0.4)' }}>
          <Crosshair size={18} />
        </button>
      )}
    </div>
  );
}
