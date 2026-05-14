import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG marker factory
function makeIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 4px 14px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;transform:rotate(-45deg);
    "><span style="transform:rotate(45deg)">${emoji}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

const JOB_ICON    = makeIcon('#6366f1', '💼');
const WORKER_ICON = makeIcon('#10b981', '👷');
const ME_ICON     = makeIcon('#f59e0b', '📍');

// Fly to user location when it changes
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 10, { duration: 1.2 });
  }, [center, map]);
  return null;
}

/**
 * NearbyMap
 * Props:
 *   userLocation  - { lat, lng }
 *   items         - array of { id, lat, lng, title, subtitle, distance, type:'job'|'worker', wage?, rating? }
 *   radiusKm      - number (draw circle)
 *   onItemClick   - (item) => void
 */
export default function NearbyMap({ userLocation, items = [], radiusKm = 25, onItemClick }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [20.5937, 78.9629]; // India center fallback

  return (
    <MapContainer
      center={center}
      zoom={userLocation ? 9 : 5}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && <FlyTo center={center} />}

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker position={center} icon={ME_ICON}>
            <Popup>
              <div className="text-center p-1">
                <div className="font-bold text-sm">📍 You are here</div>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.06, weight: 1.5, dashArray: '6' }}
          />
        </>
      )}

      {/* Job / Worker markers */}
      {items.map(item => (
        <Marker
          key={`${item.type}-${item.id}`}
          position={[item.lat, item.lng]}
          icon={item.type === 'job' ? JOB_ICON : WORKER_ICON}
          eventHandlers={{ click: () => onItemClick && onItemClick(item) }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div className="font-bold text-sm mb-1">{item.title}</div>
              <div className="text-xs text-gray-500 mb-1">{item.subtitle}</div>
              {item.distance != null && (
                <div className="text-xs font-semibold text-indigo-600">📍 {item.distance} km away</div>
              )}
              {item.wage && (
                <div className="text-xs font-bold text-emerald-600 mt-1">₹{item.wage}/day</div>
              )}
              {item.rating > 0 && (
                <div className="text-xs text-amber-500 mt-0.5">⭐ {item.rating}</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
