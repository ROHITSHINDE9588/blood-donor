import { useState } from 'react'
import Swal from 'sweetalert2'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-ink dark:text-white">Contact</h1>
      <form
        className="glass mt-6 grid gap-4 rounded-lg p-5 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault()
          Swal.fire('Message received', 'Wire this form to a backend feedback endpoint when you deploy.', 'success')
        }}
      >
        {['name', 'email'].map((field) => (
          <input key={field} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} placeholder={field} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
        ))}
        <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="message" rows="5" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
        <button className="rounded-lg bg-blood-600 px-4 py-3 font-black text-white">Send</button>
      </form>
    </main>
  )
}
