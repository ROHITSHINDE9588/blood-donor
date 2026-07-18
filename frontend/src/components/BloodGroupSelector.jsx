import { bloodGroups } from '../utils/bloodGroups'

export default function BloodGroupSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {bloodGroups.map((group) => (
        <button
          key={group}
          type="button"
          onClick={() => onChange(group)}
          className={`h-11 rounded-lg border text-sm font-black transition ${
            value === group
              ? 'border-blood-600 bg-blood-600 text-white shadow-soft'
              : 'border-slate-200 bg-white text-ink hover:border-blood-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
          }`}
        >
          {group}
        </button>
      ))}
    </div>
  )
}
