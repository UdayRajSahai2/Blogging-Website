import { useEffect, useMemo, useRef } from "react";
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
import "../../index.css";
import {
  UserIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
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
   Fit map to radius
------------------------------------------------------- */
const FitToRadius = ({ center, radius }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!center || fitted.current) return;

    const lat = center[0];
    const lng = center[1];

    const latRadius = radius / 111000;
    const lngRadius = radius / (111000 * Math.cos((lat * Math.PI) / 180));

    const bounds = [
      [lat - latRadius, lng - lngRadius],
      [lat + latRadius, lng + lngRadius],
    ];

    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, {
        paddingTopLeft: [1, 1],
        paddingBottomRight: [16, 16],
        maxZoom: 11,
      });
      fitted.current = true;
    }, 150);
  }, [center, radius, map]);

  return null;
};

/* -------------------------------------------------------
   Custom Marker
------------------------------------------------------- */
const createCustomIcon = (profileImg) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-[30px] h-[30px] rounded-full border border-white shadow-md overflow-hidden">
          <img src="${profileImg}" class="w-full h-full object-cover"/>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

/* -------------------------------------------------------
   Map Zoom Controls
------------------------------------------------------- */
const MapZoomControls = () => {
  const map = useMap();

  const zoomIn = () => {
    map.flyTo(map.getCenter(), map.getZoom() + 1, { duration: 0.25 });
  };

  const zoomOut = () => {
    map.flyTo(map.getCenter(), map.getZoom() - 1, { duration: 0.25 });
  };

  return (
    <div className="absolute bottom-10 right-3 flex flex-col overflow-hidden rounded-lg bg-white/30 backdrop-blur shadow z-[1000]">
      <button
        onClick={zoomIn}
        className="w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-white/40"
      >
        +
      </button>

      <div className="h-px bg-white/40"></div>

      <button
        onClick={zoomOut}
        className="w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-white/40"
      >
        −
      </button>
    </div>
  );
};

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

const NearbyMap = ({ users = [], userLocation = null }) => {
  const maxRadiusKm = 40;

  /* Filter users within radius */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) => typeof u.distance === "number" && u.distance <= maxRadiusKm,
    );
  }, [users]);

  /* Marker icons */
  const icons = useMemo(() => {
    const map = new Map();

    filteredUsers.forEach((u) => {
      if (!map.has(u.username)) {
        map.set(u.username, createCustomIcon(u.profile_img));
      }
    });

    return map;
  }, [filteredUsers]);

  /* Marker positions */
  const markerData = useMemo(() => {
    if (!userLocation) return [];

    const baseLat = userLocation.latitude;
    const baseLng = userLocation.longitude;

    return filteredUsers.map((user, index) => {
      const distanceKm = user.distance || 0;

      let radiusFactor;

      if (distanceKm <= 10) {
        radiusFactor = 0.03 + distanceKm * 0.002;
      } else if (distanceKm <= 20) {
        radiusFactor = 0.07 + (distanceKm - 10) * 0.002;
      } else {
        radiusFactor = 0.11 + (distanceKm - 20) * 0.002;
      }

      const angle = (index * 137.5 * Math.PI) / 180;

      return {
        user,
        position: [
          baseLat + Math.cos(angle) * radiusFactor,
          baseLng + Math.sin(angle) * radiusFactor,
        ],
      };
    });
  }, [filteredUsers, userLocation]);

  /* Loading */
  if (!userLocation) {
    return (
      <div className="flex items-center justify-center py-2">
        <p className="text-gray-500 text-sm">Loading your location…</p>
      </div>
    );
  }

  /* Render */
  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 rounded-sm overflow-hidden">
        <div className="flex justify-center ">
          <div className="flex items-center gap-2 px-4 py-0.5 text-xs sm:text-sm bg-white/80 backdrop-blur text-gray-700">
            <UserIcon className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">{filteredUsers.length}</span> people
            nearby • within{" "}
            <span className="font-semibold">{maxRadiusKm} km</span>
          </div>
        </div>
        <MapContainer
          preferCanvas
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={10}
          zoomControl={false}
          zoomSnap={0.5}
          zoomDelta={0.5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false} // disable accidental zoom
          dragging={true}
          tap={false} // important for mobilescrollWheelZoom
        >
          <FitToRadius
            center={[userLocation.latitude, userLocation.longitude]}
            radius={40000}
          />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* User location */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={120}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>Your Location</Popup>
          </Circle>

          {/* Distance circles */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={10000}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#3cd7f0",
              fillOpacity: 0.4,
              dashArray: "8,6",
              weight: 2,
            }}
          />

          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={20000}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.08,
              dashArray: "8,6",
              weight: 2,
            }}
          />

          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={40000}
            pathOptions={{
              color: "#ef4444",

              fillColor: "#ef4444",
              fillOpacity: 0.08,
              dashArray: "8,6",
              weight: 2,
            }}
          />

          <MapZoomControls />

          {/* Users */}
          {markerData.map(({ user, position }) => (
            <Marker
              key={user.username}
              position={position}
              icon={icons.get(user.username)}
            >
              <Popup autoClose={false} closeButton={false}>
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

                  <Link
                    to={`/user/${user.username}`}
                    className="inline-block mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600"
                  >
                    View Profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default NearbyMap;
