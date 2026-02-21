import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------------------------------------------
   Leaflet marker fix
------------------------------------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
const createCustomIcon = (isPaidMember, profileImg) => {
  const showAsPaid = false;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden ${
          showAsPaid && isPaidMember
            ? "ring-2 ring-yellow-400"
            : "ring-2 ring-blue-400"
        }">
          <img src="${profileImg}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
          showAsPaid && isPaidMember ? "bg-yellow-400" : "bg-blue-500"
        }">
          <span class="text-xs font-bold text-white">${
            showAsPaid && isPaidMember ? "★" : "🏳️"
          }</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36],
  });
};

/* -------------------------------------------------------
   Map updater (SAFE)
------------------------------------------------------- */
const MapCenterUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: false });
  }, [center, map]);

  return null;
};

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */
const NearbyMap = ({ users = [], userLocation = null }) => {
  const [radiusKm] = useState(5);

  /* ---------------------------------------------
     Filter users by distance
  --------------------------------------------- */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) => typeof u.distance === "number" && u.distance <= radiusKm,
    );
  }, [users, radiusKm]);

  /* ---------------------------------------------
     Memoized icons
  --------------------------------------------- */
  const icons = useMemo(() => {
    const map = new Map();
    filteredUsers.forEach((u) => {
      map.set(u.username, createCustomIcon(!!u.profile_id, u.profile_img));
    });
    return map;
  }, [filteredUsers]);

  /* ---------------------------------------------
     Memoized marker positions
  --------------------------------------------- */
  const markerData = useMemo(() => {
    if (!userLocation) return [];

    const count = filteredUsers.length || 1;

    return filteredUsers.map((user, index) => {
      const angle = (index * 360 * Math.PI) / 180 / count;
      const distanceDeg = user.distance / 111;

      return {
        user,
        position: [
          userLocation.latitude + Math.cos(angle) * distanceDeg,
          userLocation.longitude + Math.sin(angle) * distanceDeg,
        ],
      };
    });
  }, [filteredUsers, userLocation]);

  /* ---------------------------------------------
     Loading state
  --------------------------------------------- */
  if (!userLocation) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading your location…</p>
      </div>
    );
  }

  /* ---------------------------------------------
     Render
  --------------------------------------------- */
  return (
    <div className="space-y-2">
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging
          touchZoom
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapCenterUpdater
            center={[userLocation.latitude, userLocation.longitude]}
          />

          {/* You */}
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-red-600">Your Location</div>
                <div className="text-sm text-gray-600">Center point</div>
              </div>
            </Popup>
          </Marker>

          {/* Radius */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#8B5CF6",
              fillColor: "#8B5CF6",
              fillOpacity: 0.1,
              weight: 2,
            }}
          />

          {/* Users */}
          {markerData.map(({ user, position }) => (
            <Marker
              key={user.username}
              position={position}
              icon={icons.get(user.username)}
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
                  <div className="text-sm text-purple-600">
                    {user.distance?.toFixed(1)} km away
                  </div>

                  {user.profession?.name && (
                    <div className="text-sm text-gray-500">
                      {user.profession.name}
                    </div>
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
          ))}
        </MapContainer>
      </div>

      <div className="text-center text-sm text-gray-600">
        {filteredUsers.length} user
        {filteredUsers.length !== 1 && "s"} within {radiusKm} km
      </div>
    </div>
  );
};

export default NearbyMap;
