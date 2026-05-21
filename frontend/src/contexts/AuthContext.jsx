import { createContext, useEffect, useMemo, useState } from 'react'
import { getMe, login as loginRequest, register as registerRequest } from '../api/auth'
import { getErrorMessage } from '../utils/apiError'
import { applyTheme, getStoredTheme } from '../utils/theme'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [theme, setTheme] = useState(getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    let ignore = false

    async function bootstrap() {
      if (!token) {
        setCurrentUser(null)
        setLoading(false)
        return
      }

      try {
        const me = await getMe()
        if (!ignore) {
          setCurrentUser(me)
        }
      } catch (error) {
        if (!ignore) {
          localStorage.removeItem('token')
          setToken(null)
          setCurrentUser(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      ignore = true
    }
  }, [token])

  async function login(credentials) {
    const response = await loginRequest(credentials)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setCurrentUser(response.user)
    return response
  }

  async function register(payload) {
    const response = await registerRequest(payload)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setCurrentUser(response.user)
    return response
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      currentUser,
      loading,
      theme,
      setTheme,
      login,
      register,
      logout,
      setCurrentUser,
      authErrorMessage: getErrorMessage,
    }),
    [token, currentUser, loading, theme],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
