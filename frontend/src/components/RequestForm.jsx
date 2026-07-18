import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { networkApi } from '../services/api'
import { bloodGroups } from '../utils/bloodGroups'
import { FaLocationCrosshairs, FaSpinner } from 'react-icons/fa6'

const inputClass = "rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-blood-500 w-full"

export default function RequestForm() {
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      blood_group: 'O+', units_required: 1,
      urgency: 'critical', city: '', latitude: '', longitude: ''
    },
  })
  const [locLoading, setLocLoading] = useState(false)

  // Get GPS location and auto-fill form
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

        // Reverse geocode to get city
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || ''
          if (city) setValue('city', city)
        } catch { /* ignore */ }

        setLocLoading(false)
        Swal.fire({
          title: 'Location found',
          text: `Lat: ${lat}, Lng: ${lng}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      },
      () => {
        setLocLoading(false)
        Swal.fire('Error', 'Could not get your location.', 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (payload) => {
    await networkApi.createRequest({
      ...payload,
      units_required: Number(payload.units_required),
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
    })
    Swal.fire('Emergency created', 'Nearby donors, hospitals, and dashboards have been notified.', 'success')
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-lg p-5 shadow-soft border border-[rgba(255,255,255,0.1)]">
      <h2 className="text-xl font-black">Emergency Blood Request</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input {...register('patient_name', { required: true })} placeholder="Patient name" className={inputClass} />
        <select {...register('blood_group')} className={inputClass}>
          {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
        </select>
        <input {...register('units_required')} type="number" min="1" max="10" placeholder="Units required" className={inputClass} />
        <select {...register('urgency')} className={inputClass}>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="critical">Critical</option>
          <option value="emergency">Emergency</option>
        </select>
        <textarea {...register('notes')} placeholder="Notes (optional)" className={`${inputClass} sm:col-span-2 resize-none h-20`} />
      </div>

      {/* Location Section */}
      <div className="mt-4 rounded-lg border border-dashed border-blood-300 dark:border-blood-800 bg-blood-50/50 dark:bg-blood-900/10 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <p className="font-bold text-blood-700 dark:text-blood-400 text-sm">Hospital / Patient Location</p>
            <p className="text-xs text-slate-500">Use GPS or enter coordinates manually</p>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locLoading}
            className="flex items-center gap-2 bg-blood-600 hover:bg-blood-700 disabled:opacity-60 text-white font-bold px-3 py-1.5 rounded-lg transition-colors text-xs shadow"
          >
            {locLoading
              ? <><FaSpinner className="animate-spin" size={12} /> Getting location...</>
              : <><FaLocationCrosshairs size={12} /> Use Live Location</>
            }
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input {...register('city', { required: true })} placeholder="City" className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input {...register('latitude', { required: true })} type="number" step="0.000001" placeholder="Latitude" className={inputClass} />
            <input {...register('longitude', { required: true })} type="number" step="0.000001" placeholder="Longitude" className={inputClass} />
          </div>
        </div>
      </div>

      <button
        disabled={isSubmitting}
        className="mt-5 w-full sm:w-auto rounded-lg bg-blood-600 hover:bg-blood-700 transition-all px-8 py-3 font-black text-white disabled:opacity-60 shadow-[0_4px_14px_0_rgba(239,35,60,0.5)] text-lg"
      >
        Send Emergency Request
      </button>
    </form>
  )
}
