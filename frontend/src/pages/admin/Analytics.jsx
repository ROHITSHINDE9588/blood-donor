import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FaBell, FaChartLine, FaDroplet, FaHospital, FaShieldHalved, FaUsers } from 'react-icons/fa6'
import ChartPanel from '../../components/ChartPanel'
import DonorMap from '../../components/DonorMap'
import StatCard from '../../components/StatCard'
import { networkApi } from '../../services/api'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const asList = (value) => (Array.isArray(value) ? value : [])
const donorRecord = (item) => item?.donor || item
const formatBoolean = (value) => (value ? 'Yes' : 'No')
const formatText = (value) => value || 'N/A'

function Badge({ value }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-black uppercase ${statusColors[value] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}>
      {value || 'N/A'}
    </span>
  )
}

function Panel({ title, children }) {
  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <h2 className="text-lg font-black text-ink dark:text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-800">
      {children}
    </div>
  )
}

function TablePanel({ title, rows, columns, emptyText }) {
  return (
    <Panel title={`${title} (${rows.length})`}>
      {rows.length ? (
        <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-100 dark:border-slate-800">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index} className="border-t border-slate-100 bg-white/60 dark:border-slate-800 dark:bg-slate-900/70">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 font-semibold">
                      {column.render ? column.render(row) : formatText(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>{emptyText}</EmptyState>
      )}
    </Panel>
  )
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    const safe = (promise, fallback) => promise.catch(() => ({ data: fallback }))
    const [analyticsRes, donorRes, hospitalRes, requestRes, userRes, predictionRes] = await Promise.all([
      safe(networkApi.analytics(), null),
      safe(networkApi.donors({}), []),
      safe(networkApi.hospitals(), []),
      safe(networkApi.requests(), []),
      safe(networkApi.users(), []),
      safe(networkApi.predictDemand(), []),
    ])

    setAnalytics(analyticsRes.data)
    setDonors(asList(donorRes.data))
    setHospitals(asList(hospitalRes.data))
    setRequests(asList(requestRes.data))
    setUsers(asList(userRes.data))
    setPredictions(asList(predictionRes.data))
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const normalizedDonors = useMemo(() => donors.map(donorRecord).filter(Boolean), [donors])
  const stats = analytics?.stats
  const activeRequests = requests.filter((request) => ['pending', 'verified', 'accepted'].includes(request.status)).length
  const statusEntries = Object.entries(analytics?.request_statuses || {})
  const pendingDonors = normalizedDonors.filter((donor) => donor.verification_status !== 'approved')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">
            {lastUpdated ? `Last updated ${formatDate(lastUpdated)}` : 'Loading live information...'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blood-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blood-700 disabled:opacity-60"
        >
          <FaChartLine /> {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FaUsers} label="Users" value={stats?.users ?? users.length} />
        <StatCard icon={FaDroplet} label="Donors" value={stats?.donors ?? normalizedDonors.length} tone="mint" />
        <StatCard icon={FaUsers} label="Recipients" value={stats?.recipients ?? users.filter((user) => user.role === 'recipient').length} tone="ink" />
        <StatCard icon={FaHospital} label="Hospitals" value={stats?.hospitals ?? hospitals.length} tone="ink" />
        <StatCard icon={FaBell} label="Blood Requests" value={stats?.blood_requests ?? requests.length} tone="amber" />
        <StatCard icon={FaBell} label="Active Emergencies" value={stats?.active_emergencies ?? activeRequests} tone="amber" />
        <StatCard icon={FaShieldHalved} label="Pending Verifications" value={pendingDonors.length} tone="blood" />
        <StatCard icon={FaChartLine} label="Completed Donations" value={stats?.completed_donations ?? 0} tone="mint" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <DonorMap donors={donors} hospitals={hospitals} />
        <div className="grid gap-5">
          <ChartPanel data={analytics?.blood_groups || []} />
          <Panel title="Request Status">
            {statusEntries.length ? (
              <div className="grid gap-3">
                {statusEntries.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-sm font-bold dark:bg-slate-900/70">
                    <Badge value={status} />
                    <span className="text-ink dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No request status data.</EmptyState>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-5">
        <TablePanel
          title="All Blood Requests"
          rows={requests}
          emptyText="No blood requests found."
          columns={[
            { key: 'patient_name', label: 'Patient' },
            { key: 'blood_group', label: 'Blood Group' },
            { key: 'city', label: 'City' },
            { key: 'units_required', label: 'Units' },
            { key: 'urgency', label: 'Urgency' },
            { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
            { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
          ]}
        />

        <TablePanel
          title="All Donors"
          rows={normalizedDonors}
          emptyText="No donors found."
          columns={[
            { key: 'name', label: 'Name', render: (row) => row.user?.full_name || 'Unknown donor' },
            { key: 'blood_group', label: 'Blood Group' },
            { key: 'city', label: 'City' },
            { key: 'age', label: 'Age' },
            { key: 'available', label: 'Available', render: (row) => formatBoolean(row.available) },
            { key: 'verification_status', label: 'Verification', render: (row) => <Badge value={row.verification_status} /> },
            { key: 'previous_donations', label: 'Donations' },
            { key: 'health_status', label: 'Health' },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <TablePanel
            title="All Hospitals"
            rows={hospitals}
            emptyText="No hospitals found."
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'city', label: 'City' },
              { key: 'phone', label: 'Phone', render: (row) => formatText(row.phone) },
              { key: 'verification_status', label: 'Status', render: (row) => <Badge value={row.verification_status} /> },
            ]}
          />

          <TablePanel
            title="All Users"
            rows={users}
            emptyText="No users found."
            columns={[
              { key: 'full_name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone', render: (row) => formatText(row.phone) },
              { key: 'role', label: 'Role', render: (row) => <Badge value={row.role} /> },
              { key: 'is_active', label: 'Active', render: (row) => formatBoolean(row.is_active) },
              { key: 'is_verified', label: 'Verified', render: (row) => formatBoolean(row.is_verified) },
            ]}
          />
        </div>
      </div>

      <Panel title="AI Predictive Demand (Next 7 Days)">
        {predictions.length ? (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="blood_group" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  />
                  <Bar dataKey="predicted_demand_units" radius={[4, 4, 0, 0]}>
                    {predictions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.trend === 'increasing' ? '#ef4444' : entry.trend === 'decreasing' ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500"></span> Increasing Trend</div>
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500"></span> Stable Trend</div>
              <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Decreasing Trend</div>
            </div>
          </>
        ) : (
          <EmptyState>No prediction data available.</EmptyState>
        )}
      </Panel>
    </div>
  )
}
