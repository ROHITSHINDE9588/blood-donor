import { MapContainer, Marker, Popup, TileLayer, Circle } from 'react-leaflet'
import L from 'leaflet'
import { FaHospital, FaLocationDot, FaDroplet } from 'react-icons/fa6'

const availableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const unavailableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function LivePulse({ position }) {
  return (
    <Circle
      center={position}
      radius={600}
      pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 1.5, dashArray: '5 5' }}
    />
  )
}

export default function DonorMap({ donors = [], hospitals = [], center = [20.5937, 78.9629] }) {
  const donorPins = donors
    .map((item) => item.donor || item)
    .filter((donor) => donor.latitude && donor.longitude)

  const firstDonor = donorPins[0]
  const mapCenter = firstDonor
    ? [firstDonor.latitude, firstDonor.longitude]
    : center

  const availableCount = donorPins.filter((donor) => donor.available).length
  const hospitalCount = hospitals.filter((hospital) => hospital.latitude && hospital.longitude).length

  return (
    <div className="overflow-hidden rounded-lg border border-white/70 shadow-soft dark:border-slate-800">
      <div className="flex flex-wrap gap-4 border-b border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <FaLocationDot className="text-emerald-500" />
          <span>{availableCount} Available Donors</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
          <FaLocationDot className="text-slate-400" />
          <span>{donorPins.length - availableCount} Unavailable Donors</span>
        </span>
        <span className="flex items-center gap-1.5">
          <FaHospital className="text-red-500" />
          <span>{hospitalCount} Hospitals</span>
        </span>
      </div>

      <MapContainer center={mapCenter} zoom={firstDonor ? 12 : 5} scrollWheelZoom className="h-[480px] w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {donorPins.map((donor) => (
          <div key={`donor-${donor.id}`}>
            <Marker
              position={[donor.latitude, donor.longitude]}
              icon={donor.available ? availableIcon : unavailableIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="mb-1 flex items-center gap-2">
                    <FaDroplet className={donor.available ? 'text-red-500' : 'text-slate-400'} />
                    <strong className="text-base">{donor.user?.full_name || 'Donor'}</strong>
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <p>Blood Group: <strong>{donor.blood_group}</strong></p>
                    <p>City: {donor.city}</p>
                    <p>Health: {donor.health_status}</p>
                    <p>Donations: {donor.previous_donations}</p>
                    <p>
                      <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${donor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {donor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                    {donor.verification_status && (
                      <p>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${donor.verification_status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {donor.verification_status === 'approved' ? 'Verified' : donor.verification_status}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
            {donor.available && <LivePulse position={[donor.latitude, donor.longitude]} />}
          </div>
        ))}

        {hospitals
          .filter((hospital) => hospital.latitude && hospital.longitude)
          .map((hospital) => (
            <Marker key={`hospital-${hospital.id}`} position={[hospital.latitude, hospital.longitude]} icon={hospitalIcon}>
              <Popup>
                <div>
                  <strong><FaHospital className="mr-1 inline text-red-500" />{hospital.name}</strong>
                  <br />
                  <span className="text-sm">City: {hospital.city}</span>
                  {hospital.phone && <><br /><span className="text-sm">Phone: {hospital.phone}</span></>}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <div className="flex flex-wrap gap-4 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-200">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Available Donor</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-slate-400"></span> Unavailable Donor</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500"></span> Hospital</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-dashed border-emerald-400 bg-transparent"></span> Live Tracking Zone</span>
      </div>
    </div>
  )
}
