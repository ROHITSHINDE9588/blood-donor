import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { networkApi } from '../../services/api'

const VERIFICATION_COLORS = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DonorVerificationManager() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const fetchDonors = () => {
    setLoading(true)
    networkApi.donors({})
      .then(({ data }) => setDonors(data))
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDonors() }, [])

  const handleVerification = async (donorId, newStatus, donorName) => {
    const result = await Swal.fire({
      title: `Change ${donorName || 'this donor'} verification to ${newStatus}?`,
      icon: newStatus === 'approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${newStatus === 'approved' ? 'approve' : 'reject'} it`,
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return

    try {
      await networkApi.updateDonorVerification(donorId, { verification_status: newStatus })
      Swal.fire('Done!', `Donor ${newStatus === 'approved' ? 'approved' : 'rejected'}.`, newStatus === 'approved' ? 'success' : 'error')
      fetchDonors()
    } catch {
      Swal.fire('Error', 'Could not update verification.', 'error')
    }
  }

  const filteredDonors = donors.filter((item) => {
    const donor = item.donor || item
    return filter === 'all' || donor.verification_status === filter
  })

  return (
    <section className="glass overflow-hidden rounded-lg border border-[rgba(255,255,255,0.1)] shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <h2 className="text-xl font-black">Donor Verification Management</h2>
        <div className="flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                filter === status
                  ? 'bg-blood-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchDonors}
            className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500">Loading donors...</div>
      ) : filteredDonors.length === 0 ? (
        <div className="p-10 text-center text-slate-500">No donors found for this status.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Donor Name</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Donations</th>
                <th className="px-4 py-3">Verification Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((item) => {
                const donor = item.donor || item
                return (
                  <tr key={donor.id} className="border-t border-slate-100 transition-colors hover:bg-white/30 dark:border-slate-800 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold">{donor.user?.full_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blood-50 px-2 py-0.5 font-bold text-blood-600 dark:bg-blood-900/20">{donor.blood_group}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{donor.city}</td>
                    <td className="px-4 py-3">{donor.age}</td>
                    <td className="px-4 py-3 text-center">{donor.previous_donations}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${VERIFICATION_COLORS[donor.verification_status] || ''}`}>
                        {donor.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {donor.verification_status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleVerification(donor.id, 'approved', donor.user?.full_name)}
                            className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            Approve
                          </button>
                        )}
                        {donor.verification_status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleVerification(donor.id, 'rejected', donor.user?.full_name)}
                            className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-red-600"
                          >
                            Reject
                          </button>
                        )}
                        {donor.verification_status !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleVerification(donor.id, 'pending', donor.user?.full_name)}
                            className="rounded bg-amber-400 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-amber-500"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
