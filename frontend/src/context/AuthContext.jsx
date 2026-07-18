import { createContext, useContext, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bdn_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bdn_user')
    return raw ? JSON.parse(raw) : null
  })

  const persistSession = (data) => {
    localStorage.setItem('bdn_token', data.access_token)
    localStorage.setItem('bdn_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
  }

  const login = async (payload) => {
    const { data } = await authApi.login(payload)
    persistSession(data)
    await Swal.fire('Welcome back', `Signed in as ${data.user.role}`, 'success')
    return data.user
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    persistSession(data)
    await Swal.fire('Account created', 'Check the backend console for the email verification token in development.', 'success')
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('bdn_token')
    localStorage.removeItem('bdn_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, login, register, logout, isAuthenticated: Boolean(token) }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
