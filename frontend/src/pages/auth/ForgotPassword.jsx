import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { authApi } from '../../services/api'

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm()

  const onSubmit = async (payload) => {
    await authApi.forgotPassword(payload)
    Swal.fire('Check your email', 'In development, the reset token is printed by the backend.', 'success')
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl place-items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-lg p-6 shadow-soft">
        <h1 className="text-3xl font-black">Forgot Password</h1>
        <input {...register('email', { required: true })} type="email" placeholder="Email" className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
        <button className="mt-4 w-full rounded-lg bg-blood-600 px-4 py-3 font-black text-white">Send Reset Token</button>
      </form>
    </main>
  )
}
