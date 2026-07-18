export default function StatCard({ icon: Icon, label, value, tone = 'blood' }) {
  const tones = {
    blood: 'bg-blood-50 text-blood-600 dark:bg-blood-500/12 dark:text-blood-100',
    mint: 'bg-teal-50 text-mint dark:bg-teal-400/12 dark:text-teal-100',
    amber: 'bg-amber-50 text-amber dark:bg-amber-400/12 dark:text-amber-100',
    ink: 'bg-slate-100 text-ink dark:bg-slate-800 dark:text-white',
  }

  return (
    <div className="glass rounded-lg p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-black text-ink dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <span className={`grid h-12 w-12 place-items-center rounded-lg ${tones[tone]}`}>
            <Icon />
          </span>
        ) : null}
      </div>
    </div>
  )
}
