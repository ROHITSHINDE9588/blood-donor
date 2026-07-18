import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { api } from '../../services/api'
import { bloodGroups } from '../../utils/bloodGroups'
import { FaMedal, FaLocationCrosshairs, FaSpinner } from 'react-icons/fa6'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom red "my location" marker
const myLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Helper to pan map to new location
function FlyToLocation({ coords }) {
  const map = useMap()
  if (coords) {
    map.flyTo([coords.lat, coords.lng], 14, { animate: true, duration: 1.5 })
  }
  return null
}

const inputClass = "rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-blood-500 w-full"

export default function Profile() {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      blood_group: 'O+', city: '', age: 28,
      health_status: 'healthy', available: true,
      previous_donations: 0, latitude: '', longitude: '',
    }
  })
  const previousDonations = watch('previous_donations')
  const latitude = watch('latitude')
  const longitude = watch('longitude')
  const [locLoading, setLocLoading] = useState(false)
  const [previewCoords, setPreviewCoords] = useState(null)

  // Get live GPS location and fill the form
  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      Swal.fire('Error', 'Your browser does not support GPS.', 'error')
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6))
        const lng = parseFloat(position.coords.longitude.toFixed(6))
        setValue('latitude', lat)
        setValue('longitude', lng)
        setPreviewCoords({ lat, lng })

        // Reverse geocode to get city name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || ''
          if (city) setValue('city', city)
        } catch {
          // ignore geocoding errors
        }

        setLocLoading(false)
        Swal.fire({
          title: 'Location found',
          text: `Latitude: ${lat}, Longitude: ${lng}`,
          icon: 'success',
          timer: 2500,
          showConfirmButton: false,
        })
      },
      (err) => {
        setLocLoading(false)
        Swal.fire('Error', 'Could not get your location. Check browser permissions.', 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (payload) => {
    try {
      await api.post('/donors', {
        ...payload,
        age: Number(payload.age),
        previous_donations: Number(payload.previous_donations || 0),
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
      })
      Swal.fire('Profile saved', 'Your donor profile is ready for emergency matching.', 'success')
    } catch (err) {
      const detail = err?.response?.data?.detail
      Swal.fire('Error', detail || 'Could not save profile.', 'error')
    }
  }

  const mapCenter = previewCoords
    ? [previewCoords.lat, previewCoords.lng]
    : [20.5937, 78.9629] // Default: India center

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-lg p-5 shadow-soft border border-[rgba(255,255,255,0.1)]">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <h1 className="text-2xl font-black">Donor Profile</h1>
        {Number(previousDonations) >= 5 && (
          <div className="badge-shine bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <FaMedal size={18} /> Hero Donor
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <select {...register('blood_group')} className={inputClass}>
          {bloodGroups.map((g) => <option key={g}>{g}</option>)}
        </select>
        <input {...register('city', { required: true })} placeholder="City" className={inputClass} />
        <input {...register('age')} type="number" placeholder="Age" className={inputClass} />
        <input {...register('health_status')} placeholder="Health status (e.g. healthy)" className={inputClass} />
        <input {...register('last_donation_date')} type="date" className={inputClass} />
        <input {...register('previous_donations')} type="number" placeholder="Previous donations count" className={inputClass} />
      </div>

      {/* Location Section */}
      <div className="mt-6 rounded-lg border border-dashed border-blood-300 dark:border-blood-800 bg-blood-50/50 dark:bg-blood-900/10 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h3 className="font-bold text-blood-700 dark:text-blood-400">Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use GPS location or enter coordinates manually</p>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locLoading}
            className="flex items-center gap-2 bg-blood-600 hover:bg-blood-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-md"
          >
            {locLoading
              ? <><FaSpinner className="animate-spin" /> Getting location...</>
              : <><FaLocationCrosshairs /> Use My Live Location</>
            }
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Latitude</label>
            <input
              {...register('latitude', { required: true })}
              type="number"
              step="0.000001"
              placeholder="e.g. 28.613939"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Longitude</label>
            <input
              {...register('longitude', { required: true })}
              type="number"
              step="0.000001"
              placeholder="e.g. 77.209023"
              className={inputClass}
            />
          </div>
        </div>

        {/* Live Map Preview */}
        <div className="mt-4 rounded-lg overflow-hidden border border-white/50 dark:border-slate-700 shadow-inner h-56">
          <MapContainer center={mapCenter} zoom={previewCoords ? 14 : 5} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {previewCoords && (
              <>
                <FlyToLocation coords={previewCoords} />
                <Marker position={[previewCoords.lat, previewCoords.lng]} icon={myLocationIcon}>
                  <Popup>
                    <strong>Your Location</strong><br />
                    {previewCoords.lat.toFixed(5)}, {previewCoords.lng.toFixed(5)}
                  </Popup>
                </Marker>
              </>
            )}
            {!previewCoords && latitude && longitude && Number(latitude) && Number(longitude) && (
              <Marker position={[Number(latitude), Number(longitude)]} icon={myLocationIcon}>
                <Popup>Manual Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        {previewCoords && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            Location found: {previewCoords.lat}, {previewCoords.lng}
          </p>
        )}
      </div>

      <button className="mt-6 w-full sm:w-auto rounded-lg bg-blood-600 hover:bg-blood-700 transition-colors px-8 py-3 font-black text-white shadow-[0_4px_14px_0_rgba(239,35,60,0.39)] text-lg">
        Save Profile
      </button>
    </form>
  )
}
