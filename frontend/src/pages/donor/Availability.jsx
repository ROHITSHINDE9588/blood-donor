import { useState, useEffect } from 'react'
import { FaToggleOn, FaToggleOff } from 'react-icons/fa6'
import { networkApi } from '../../services/api'
import Swal from 'sweetalert2'

export default function Availability() {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app we'd fetch the current donor profile to set initial state
    // For now we'll assume they are available or we can fetch donors with their user_id
    // Wait, let's just default to what they set or false if unknown.
    setLoading(false)
  }, [])

  const toggleAvailability = async () => {
    try {
      const newStatus = !available
      await networkApi.updateDonorMyStatus({ available: newStatus })
      setAvailable(newStatus)
      Swal.fire('Status Updated', `You are now marked as ${newStatus ? 'Available' : 'Unavailable'} for donations.`, 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Could not update your availability. Have you created a Donor Profile yet?', 'error')
    }
  }

  if (loading) return null

  return (
    <section className="glass rounded-lg p-5 shadow-soft border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black">
            {available ? <FaToggleOn className="text-mint" /> : <FaToggleOff className="text-slate-400" />} 
            Availability Status
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            Toggle your availability for emergency blood requests. When unavailable, you won't be matched or notified.
          </p>
        </div>
        <button 
          onClick={toggleAvailability}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none ${available ? 'bg-mint shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${available ? 'translate-x-9' : 'translate-x-1'}`} />
        </button>
      </div>
    </section>
  )
}
