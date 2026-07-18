import { NavLink, Outlet } from 'react-router-dom'
import { FaBell, FaChartLine, FaGear, FaHeartPulse, FaHospital, FaShieldHalved, FaUsers } from 'react-icons/fa6'
import NavBar from '../components/NavBar'
import { useAuth } from '../context/AuthContext'

import AIChatbot from '../components/AIChatbot'

const menus = {
  donor: [
    ['Dashboard', '/donor', FaChartLine],
    ['Profile', '/donor/profile', FaUsers],
    ['Availability', '/donor/availability', FaHeartPulse],
    ['Blood Requests', '/donor/requests', FaBell],
    ['Donation History', '/donor/history', FaHospital],
    ['Notifications', '/donor/notifications', FaBell],
    ['Settings', '/donor/settings', FaGear],
  ],
  recipient: [
    ['Dashboard', '/recipient', FaChartLine],
    ['Search Donor', '/recipient/search-donor', FaUsers],
    ['Create Request', '/recipient/create-request', FaHeartPulse],
    ['Track Request', '/recipient/track-request', FaBell],
    ['Notifications', '/recipient/notifications', FaBell],
  ],
  hospital: [
    ['Dashboard', '/hospital', FaChartLine],
    ['Donors', '/hospital/donors', FaUsers],
    ['Requests', '/hospital/requests', FaHeartPulse],
    ['Verification', '/hospital/verification', FaBell],
    ['Reports', '/hospital/reports', FaHospital],
  ],
  admin: [
    ['Dashboard', '/admin', FaChartLine],
    ['Users', '/admin/users', FaUsers],
    ['Hospitals', '/admin/hospitals', FaHospital],
    ['Blood Requests', '/admin/blood-requests', FaHeartPulse],
    ['Donor Verification', '/admin/verification', FaShieldHalved],
    ['Settings', '/admin/settings', FaGear],
  ],
}

export default function DashboardLayout() {
  const { user } = useAuth()
  const items = menus[user?.role] || []

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-slate-950 dark:text-white">
      <NavBar />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass rounded-lg p-3 shadow-soft">
          <div className="px-3 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blood-600">{user?.role}</p>
            <h1 className="mt-1 text-xl font-black">{user?.full_name || 'Dashboard'}</h1>
          </div>
          <nav className="grid gap-1">
            {items.map(([label, to, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to.split('/').length === 2}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                    isActive ? 'bg-blood-600 text-white' : 'text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900'
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
      <AIChatbot />
    </div>
  )
}
