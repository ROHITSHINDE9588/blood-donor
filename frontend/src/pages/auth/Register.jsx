import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import { roleDashboards } from '../../utils/bloodGroups'
import { getApiErrorMessage } from '../../services/api'

export default function Register() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { role: 'donor' } })
  const auth = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (payload) => {
    try {
      const user = await auth.register(payload)
      navigate(roleDashboards[user.role] || '/')
    } catch (error) {
      Swal.fire('Registration failed', getApiErrorMessage(error, 'Please review your details.'), 'error')
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl place-items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-2xl rounded-lg p-6 shadow-soft">
        <h1 className="text-3xl font-black text-ink dark:text-white">Register</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input {...register('full_name', { required: true })} placeholder="Full name" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <input {...register('email', { required: true })} type="email" placeholder="Email" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <input {...register('phone')} placeholder="Phone" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <select {...register('role')} className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>
          <input {...register('password', { required: true, minLength: 8 })} type="password" placeholder="Password" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:col-span-2" />
        </div>
        <button disabled={isSubmitting} className="mt-5 w-full rounded-lg bg-blood-600 px-4 py-3 font-black text-white disabled:opacity-60">Create Account</button>
      </form>
    </main>
  )
}
