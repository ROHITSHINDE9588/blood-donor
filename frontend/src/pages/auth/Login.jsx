import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import { roleDashboards } from '../../utils/bloodGroups'
import { getApiErrorMessage } from '../../services/api'

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const auth = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (payload) => {
    try {
      const user = await auth.login(payload)
      navigate(roleDashboards[user.role] || '/')
    } catch (error) {
      Swal.fire('Login failed', getApiErrorMessage(error, 'Check your credentials.'), 'error')
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl place-items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-lg p-6 shadow-soft">
        <h1 className="text-3xl font-black text-ink dark:text-white">Login</h1>
        <div className="mt-6 grid gap-4">
          <input {...register('email', { required: true })} type="email" placeholder="Email" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <input {...register('password', { required: true })} type="password" placeholder="Password" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <button disabled={isSubmitting} className="rounded-lg bg-blood-600 px-4 py-3 font-black text-white disabled:opacity-60">Login</button>
        </div>
        <div className="mt-4 flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </form>
    </main>
  )
}
