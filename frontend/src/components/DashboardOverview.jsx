import { useEffect, useState } from 'react'
import { FaBell, FaDroplet, FaHospital, FaUsers } from 'react-icons/fa6'
import ChartPanel from './ChartPanel'
import DonorMap from './DonorMap'
import StatCard from './StatCard'
import { networkApi } from '../services/api'

export default function DashboardOverview({ title }) {
  const [analytics, setAnalytics] = useState(null)
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    const fetchStats = () => {
      networkApi.analytics().then(({ data }) => setAnalytics(data)).catch(() => setAnalytics(null))
      networkApi.donors({ available: true }).then(({ data }) => setDonors(data)).catch(() => setDonors([]))
      networkApi.hospitals().then(({ data }) => setHospitals(data)).catch(() => setHospitals([]))
    }
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  const stats = analytics?.stats
  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-black">{title}</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FaUsers} label="Users" value={stats?.users ?? 'Live'} />
        <StatCard icon={FaDroplet} label="Donors" value={stats?.donors ?? donors.length} tone="mint" />
        <StatCard icon={FaHospital} label="Hospitals" value={stats?.hospitals ?? hospitals.length} tone="ink" />
        <StatCard icon={FaBell} label="Active emergencies" value={stats?.active_emergencies ?? 0} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <DonorMap donors={donors} hospitals={hospitals} />
        <ChartPanel data={analytics?.blood_groups || []} />
      </div>
    </div>
  )
}
