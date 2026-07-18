import { useEffect, useState } from 'react'
import { FaLocationDot } from 'react-icons/fa6'
import DashboardOverview from '../../components/DashboardOverview'
import { networkApi } from '../../services/api'
import Swal from 'sweetalert2'

export default function DonorDashboard() {
  const [tracking, setTracking] = useState(false)
  const [watchId, setWatchId] = useState(null)

  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [watchId])

  const toggleTracking = () => {
    if (tracking) {
      if (watchId) navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setTracking(false)
      Swal.fire('Live Tracking Disabled', 'Your location is no longer being updated live.', 'info')
    } else {
      if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            networkApi.updateLiveLocation({ latitude, longitude }).catch(err => console.error('Location update failed', err))
          },
          (error) => {
            console.error('Error getting location', error)
            Swal.fire('Error', 'Could not get your location. Please check permissions.', 'error')
            setTracking(false)
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        )
        setWatchId(id)
        setTracking(true)
        Swal.fire('Live Tracking Enabled', 'Your location is now being shared live with emergency requests.', 'success')
      } else {
        Swal.fire('Unsupported', 'Geolocation is not supported by your browser.', 'error')
      }
    }
  }

  return (
    <div className="grid gap-5">
      <div className="glass flex items-center justify-between rounded-lg p-5 shadow-soft border border-[rgba(255,255,255,0.1)]">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold"><FaLocationDot className="text-amber" /> Live Location Tracking</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Enable live tracking when you are en route to donate.</p>
        </div>
        <button 
          onClick={toggleTracking} 
          className={`px-4 py-2 font-bold text-white rounded-lg transition-all duration-300 ${tracking ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-mint hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
        >
          {tracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
      <DashboardOverview title="Donor Dashboard" />
    </div>
  )
}
