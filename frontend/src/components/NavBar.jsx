import { Link, NavLink } from 'react-router-dom'
import { FaDroplet, FaRightFromBracket, FaUserShield } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { roleDashboards } from '../utils/bloodGroups'

const links = [
  ['Search Blood', '/search-blood'],
  ['Hospitals', '/hospitals'],
  ['About', '/about'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
]

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth()
  const dashboard = roleDashboards[user?.role] || '/login'

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur dark:border-slate-800 dark:bg-slate-950/82">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-black text-blood-600">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blood-600 text-white">
            <FaDroplet />
          </span>
          <span>BloodNet AI</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-200 lg:flex">
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'text-blood-600' : 'hover:text-blood-600')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to={dashboard} className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white" title="Dashboard">
                <FaUserShield />
              </Link>
              <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-lg bg-blood-600 text-white" title="Logout">
                <FaRightFromBracket />
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg bg-blood-600 px-4 py-2 text-sm font-bold text-white shadow-soft">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
