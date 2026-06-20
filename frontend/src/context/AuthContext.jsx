import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchMe()
    else setLoading(false)
  }, [fetchMe])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.access_token)
    await fetchMe()
  }

  // Returns true if user is new (needs onboarding)
  const register = async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('token', res.data.access_token)
    await fetchMe()
    return true // signal to redirect to onboarding
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }))

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
