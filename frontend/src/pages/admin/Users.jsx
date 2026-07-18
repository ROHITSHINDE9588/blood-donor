import { useEffect, useState } from 'react'
import EntityTable from '../../components/EntityTable'
import { networkApi } from '../../services/api'

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const yesNo = (value) => (value ? 'Yes' : 'No')

export default function Users() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    networkApi.users()
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="glass rounded-lg p-10 text-center font-semibold text-slate-500 shadow-soft">
        Loading users...
      </section>
    )
  }

  return (
    <EntityTable
      title="Manage Users"
      rows={rows}
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (row) => row.phone || 'N/A' },
        { key: 'role', label: 'Role' },
        { key: 'is_active', label: 'Active', render: (row) => yesNo(row.is_active) },
        { key: 'is_verified', label: 'Verified', render: (row) => yesNo(row.is_verified) },
        { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
      ]}
    />
  )
}
