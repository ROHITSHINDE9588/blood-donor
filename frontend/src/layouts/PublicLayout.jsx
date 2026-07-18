import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_45%,#eefcf9_100%)] dark:bg-[linear-gradient(180deg,#111827_0%,#172033_55%,#0f172a_100%)]">
      <NavBar />
      <Outlet />
    </div>
  )
}
