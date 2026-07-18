import { useEffect, useState } from 'react'
import EntityTable from '../../components/EntityTable'
import { networkApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

export default function BloodRequests() {
  const [rows, setRows] = useState([])
  const { user } = useAuth()

  const fetchRequests = () => {
    networkApi.requests().then(({ data }) => setRows(data)).catch(() => setRows([]))
  }

  useEffect(() => { 
    fetchRequests() 
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await networkApi.updateRequest(id, { status: newStatus })
      Swal.fire('Updated', `Request marked as ${newStatus}`, 'success')
      fetchRequests()
    } catch (error) {
      Swal.fire('Error', 'Failed to update request status', 'error')
    }
  }

  const columns = [
    { key: 'patient_name', label: 'Patient' },
    { key: 'blood_group', label: 'Group', render: (row) => <span className="text-blood-600 font-bold">{row.blood_group}</span> },
    { key: 'city', label: 'City' },
    { key: 'urgency', label: 'Urgency' },
    { key: 'status', label: 'Status', render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
          ${row.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
            row.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
            row.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
        >
          {row.status}
        </span>
      ) 
    },
    { key: 'actions', label: 'Actions', render: (row) => {
      // Recipient created it, so they can complete or cancel it
      if (user?.role === 'recipient') {
        if (row.status === 'completed' || row.status === 'rejected') return null
        return (
          <div className="flex gap-2">
            <button onClick={() => handleUpdateStatus(row.id, 'completed')} className="bg-mint text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-600 transition-colors">Complete</button>
            <button onClick={() => handleUpdateStatus(row.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition-colors">Cancel</button>
          </div>
        )
      }
      return null
    }}
  ]

  return <EntityTable title="Blood Requests" rows={rows} columns={columns} />
}
