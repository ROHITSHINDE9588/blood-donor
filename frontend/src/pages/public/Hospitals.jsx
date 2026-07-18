import { useEffect, useState } from 'react'
import { FaHospital } from 'react-icons/fa6'
import DonorMap from '../../components/DonorMap'
import { networkApi } from '../../services/api'

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    networkApi.hospitals().then(({ data }) => setHospitals(data)).catch(() => setHospitals([]))
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-ink dark:text-white">Nearby Hospitals</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <DonorMap hospitals={hospitals} />
        <div className="grid content-start gap-3">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="glass rounded-lg p-4 shadow-soft">
              <FaHospital className="text-blood-600" />
              <h2 className="mt-2 font-black">{hospital.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{hospital.address}</p>
              <p className="mt-2 text-sm font-bold">{hospital.verification_status}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
