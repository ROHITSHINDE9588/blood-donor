import { useEffect, useState } from 'react'
import { networkApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminBloodRequests() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchRequests = () => {
    setLoading(true)
    networkApi.requests()
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])

  const handleStatusChange = async (id, newStatus) => {
    const result = await Swal.fire({
      title: 'Change Status?',
      text: `This request will be marked as "${newStatus}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d90429',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change it!',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return
    try {
      await networkApi.updateRequest(id, { status: newStatus })
      Swal.fire('Updated!', `Status changed to: ${newStatus}`, 'success')
      fetchRequests()
    } catch {
      Swal.fire('Error', 'Could not update status.', 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Request?',
      text: 'This request will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d90429',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return
    try {
      await networkApi.deleteRequest(id)
      Swal.fire('Deleted!', 'Request has been deleted.', 'success')
      fetchRequests()
    } catch {
      Swal.fire('Error', 'Could not delete request.', 'error')
    }
  }

  return (
    <section className="glass overflow-hidden rounded-lg shadow-soft border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-xl font-black">Blood Requests Management</h2>
        <button onClick={fetchRequests} className="text-sm bg-blood-600 text-white px-3 py-1.5 rounded-lg hover:bg-blood-700 transition-colors">Refresh</button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-slate-500">No blood requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold">{row.patient_name}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-blood-600 bg-blood-50 dark:bg-blood-900/20 px-2 py-0.5 rounded">{row.blood_group}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.city}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${row.urgency === 'emergency' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                      {row.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${STATUS_COLORS[row.status] || 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {row.status !== 'verified' && row.status !== 'completed' && row.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(row.id, 'verified')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      {row.status !== 'completed' && row.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(row.id, 'completed')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {row.status !== 'rejected' && row.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(row.id, 'rejected')}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
