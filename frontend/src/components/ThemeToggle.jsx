import { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('bdn_theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('bdn_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => setDark((value) => !value)}
      className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-ink shadow-sm transition hover:border-blood-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  )
}
