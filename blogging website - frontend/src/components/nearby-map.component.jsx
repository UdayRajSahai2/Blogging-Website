import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Add custom CSS to ensure map doesn't interfere with other elements
const mapStyles = `
  .leaflet-container {
    z-index: 1 !important;
    position: relative !important;
  }
  .leaflet-control-container {
    z-index: 2 !important;
  }
  .leaflet-popup {
    z-index: 3 !important;
  }
  .leaflet-control-attribution {
    display: none !important;
  }
`;

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different user types
const createCustomIcon = (isPaidMember, profileImg) => {
  // For now, show all users as free users (but keep premium feature ready)
  const showAsPaid = false; // Change this to true when you want to show premium members
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full border-3 border-white shadow-lg overflow-hidden ${
          showAsPaid && isPaidMember ? 'ring-2 ring-yellow-400' : 'ring-2 ring-blue-400'
        }">
          <img src="${profileImg}" alt="User" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
          showAsPaid && isPaidMember ? 'bg-yellow-400' : 'bg-blue-500'
        }">
          <span class="text-xs font-bold text-white">${showAsPaid && isPaidMember ? '★' : '🏳️'}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to update map center when radius changes
const MapUpdater = ({ center, radius }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [map, center, radius]);

  return null;
};

const NearbyMap = ({ users = [], userLocation = null }) => {
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [filteredUsers, setFilteredUsers] = useState(users);

  const radiusOptions = [5, 10, 15, 25, 50];

  useEffect(() => {
    // Filter users based on selected radius
    const filtered = users.filter(user => 
      user.distance !== undefined && user.distance <= selectedRadius
    );
    setFilteredUsers(filtered);
  }, [users, selectedRadius]);

  // Calculate user positions based on distance and direction from center
  const calculateUserPosition = (user, index) => {
    if (!userLocation) return null;
    
    // For demo purposes, we'll create positions around the user's location
    // In a real implementation, you'd use the actual coordinates from the database
    const angle = (index * 360) / Math.max(filteredUsers.length, 1) * (Math.PI / 180);
    const distanceInDegrees = user.distance / 111; // Rough conversion: 1 degree ≈ 111 km
    
    return [
      userLocation.latitude + Math.cos(angle) * distanceInDegrees,
      userLocation.longitude + Math.sin(angle) * distanceInDegrees
    ];
  };

  if (!userLocation) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading your location...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative z-0">
      {/* Add custom styles */}
      <style>{mapStyles}</style>
      

      {/* Real Map */}
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
          scrollWheelZoom={false}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Update map when radius changes */}
          <MapUpdater center={[userLocation.latitude, userLocation.longitude]} radius={selectedRadius} />
          
          {/* User's location marker */}
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-red-600">Your Location</div>
                <div className="text-sm text-gray-600">Center point</div>
              </div>
            </Popup>
          </Marker>

          {/* Distance radius circle */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={selectedRadius * 1000} // Convert km to meters
            pathOptions={{
              color: '#8B5CF6',
              fillColor: '#8B5CF6',
              fillOpacity: 0.1,
              weight: 2
            }}
          />

          {/* Nearby users markers */}
          {filteredUsers.map((user, index) => {
            const position = calculateUserPosition(user, index);
            if (!position) return null;

            return (
              <Marker
                key={user.username}
                position={position}
                icon={createCustomIcon(!!user.profile_id, user.profile_img)}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <img 
                      src={user.profile_img} 
                      alt={user.fullname}
                      className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                    />
                    <div className="font-semibold">{user.fullname}</div>
                    <div className="text-sm text-gray-600">@{user.username}</div>
                    <div className="text-sm text-purple-600">{user.distance?.toFixed(1)} km away</div>
                    {user.profession?.name && (
                      <div className="text-sm text-gray-500">{user.profession.name}</div>
                    )}
                    {false && user.profile_id && (
                      <div className="text-xs text-yellow-600 font-semibold">★ Premium Member</div>
                    )}
                    <Link 
                      to={`/user/${user.username}`}
                      className="inline-block mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>


      {/* User count */}
      <div className="text-center text-sm text-gray-600">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} within {selectedRadius} km
      </div>
    </div>
  );
};

export default NearbyMap;