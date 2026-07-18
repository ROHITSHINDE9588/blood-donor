import { useState } from 'react'
import { FaMagnifyingGlass, FaRoute } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import BloodGroupSelector from '../../components/BloodGroupSelector'
import DonorMap from '../../components/DonorMap'
import { networkApi } from '../../services/api'

export default function SearchBlood() {
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [city, setCity] = useState('')
  const [distance, setDistance] = useState(25)
  const [donors, setDonors] = useState([])

  const search = async () => {
    try {
      const { data } = await networkApi.donors({ blood_group: bloodGroup, city, distance, available: true })
      setDonors(data)
    } catch {
      Swal.fire('Login required', 'Create an account or login to search live donors.', 'info')
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="glass rounded-lg p-5 shadow-soft">
          <h1 className="text-2xl font-black text-ink dark:text-white">Search Blood</h1>
          <div className="mt-5 space-y-5">
            <BloodGroupSelector value={bloodGroup} onChange={setBloodGroup} />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-200">
              Distance: {distance} km
              <input type="range" min="1" max="100" value={distance} onChange={(event) => setDistance(event.target.value)} className="mt-3 w-full accent-blood-600" />
            </label>
            <button onClick={search} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blood-600 px-4 py-3 font-black text-white">
              <FaMagnifyingGlass /> Search Donors
            </button>
          </div>
        </section>
        <section>
          <DonorMap donors={donors} />
          <div className="mt-4 grid gap-3">
            {donors.map((item) => (
              <div key={item.donor.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 shadow-soft">
                <div>
                  <p className="font-black">{item.donor.user.full_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.donor.blood_group} | {item.donor.city}</p>
                </div>
                <span className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-black text-mint dark:bg-teal-400/12">
                  <FaRoute /> {item.distance_km ?? 'N/A'} km
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
