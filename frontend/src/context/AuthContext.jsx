import React, { createContext, useState, useEffect, useContext } from 'react'
import apiClient from '../lib/apiClient'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`
    }

    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/users/me')
      setUser(response.data?.data || null)
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      delete apiClient.defaults.headers.Authorization
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (identifier, password) => {
    try {
      const payload = identifier?.includes('@')
        ? { email: identifier, password }
        : { username: identifier, password }

      const response = await apiClient.post('/users/login', payload)

      const { user: loggedInUser, accessToken, refreshToken } = response.data?.data || {}

      if (!loggedInUser || !accessToken || !refreshToken) {
        throw new Error('Invalid login response')
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`
      setUser(loggedInUser)

      return { success: true, user: loggedInUser }
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const payload = {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role,
        studentId: userData.studentId,
        employeeId: userData.employeeId,
        contactNumber: userData.contactNumber,
      }

      await apiClient.post('/users/register', payload)

      return await login(userData.username || userData.email, userData.password)
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/users/logout')
    } catch (error) {
      // ignore logout errors
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    delete apiClient.defaults.headers.Authorization
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refresh: fetchUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}





