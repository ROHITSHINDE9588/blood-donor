import { useEffect, useState } from 'react'
import { FaBell } from 'react-icons/fa6'
import { networkApi } from '../services/api'

export default function NotificationsPanel() {
  const [items, setItems] = useState([])

  useEffect(() => {
    networkApi.notifications().then(({ data }) => setItems(data)).catch(() => setItems([]))
  }, [])

  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-xl font-black"><FaBell className="text-blood-600" /> Notifications</h2>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? <p className="text-slate-500 dark:text-slate-300">No notifications yet.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="font-black">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
