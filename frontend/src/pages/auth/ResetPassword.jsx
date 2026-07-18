import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { authApi } from '../../services/api'

export default function ResetPassword() {
  const { register, handleSubmit } = useForm()

  const onSubmit = async (payload) => {
    await authApi.resetPassword(payload)
    Swal.fire('Password reset', 'You can now login with your new password.', 'success')
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl place-items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-lg p-6 shadow-soft">
        <h1 className="text-3xl font-black">Reset Password</h1>
        <div className="mt-6 grid gap-4">
          <input {...register('token', { required: true })} placeholder="Reset token" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <input {...register('new_password', { required: true, minLength: 8 })} type="password" placeholder="New password" className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900" />
          <button className="rounded-lg bg-blood-600 px-4 py-3 font-black text-white">Reset Password</button>
        </div>
      </form>
    </main>
  )
}
