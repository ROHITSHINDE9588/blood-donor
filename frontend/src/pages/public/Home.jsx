import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBell, FaHospital, FaLocationDot, FaUserDoctor } from 'react-icons/fa6'
import BloodGroupSelector from '../../components/BloodGroupSelector'
import DonorMap from '../../components/DonorMap'
import StatCard from '../../components/StatCard'
import { networkApi } from '../../services/api'

export default function Home() {
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    Promise.all([
      networkApi.donors({ blood_group: bloodGroup, available: true }).catch(() => ({ data: [] })),
      networkApi.hospitals().catch(() => ({ data: [] })),
    ]).then(([donorRes, hospitalRes]) => {
      setDonors(donorRes.data)
      setHospitals(hospitalRes.data)
    })
  }, [bloodGroup])

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="font-bold uppercase tracking-widest text-blood-600">AI powered emergency coordination</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-ink dark:text-white sm:text-6xl">
            Blood Donor Smart Network
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-200">
            Search compatible donors, rank them by emergency priority, verify hospital documents, and coordinate requests from one operational dashboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/search-blood" className="rounded-lg bg-blood-600 px-5 py-3 font-black text-white shadow-soft">
              Search Blood
            </Link>
            <Link to="/register" className="rounded-lg border border-slate-200 bg-white px-5 py-3 font-black text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              Become a Donor
            </Link>
          </div>
        </motion.div>
        <div className="glass rounded-lg p-4 shadow-soft">
          <BloodGroupSelector value={bloodGroup} onChange={setBloodGroup} />
          <div className="mt-4">
            <DonorMap donors={donors} hospitals={hospitals} />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaUserDoctor} label="Verified donors" value="1,240" />
        <StatCard icon={FaBell} label="Emergency alerts" value="24/7" tone="amber" />
        <StatCard icon={FaLocationDot} label="Geo matching" value="< 2 km" tone="mint" />
        <StatCard icon={FaHospital} label="Hospitals" value="86" tone="ink" />
      </section>
    </main>
  )
}
