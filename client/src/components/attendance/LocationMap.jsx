/**
 * Location Map Component
 * Displays a map with a marker at the specified location
 */
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationMap.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationMap = ({ 
  lat, 
  lng, 
  label = 'Location', 
  height = '300px',
  zoom = 15 
}) => {
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="map-placeholder" style={{ height }}>
        <p>📍 Location not available</p>
      </div>
    );
  }

  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{label}</strong>
            <br />
            <small>
              Lat: {lat.toFixed(6)}
              <br />
              Lng: {lng.toFixed(6)}
            </small>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
