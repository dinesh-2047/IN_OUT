import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'

function Auth() {
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')
  
  useEffect(() => {
    setIsLogin(location.pathname === '/login')
  }, [location.pathname])
  const [formData, setFormData] = useState({
     username: '',
     email: '',
     password: '',
     confirmPassword: '',
     name: '',
     role: 'student',
     studentId: '',
     employeeId: '',
     contactNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login, register } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const roleConfig = {
    student: { icon: '🎓', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-700' },
    teacher: { icon: '👨‍🏫', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    class_incharge: { icon: '👨‍🏫', color: 'from-sky-500 to-indigo-500', bg: 'bg-sky-100', text: 'text-sky-700' },
    hod: { icon: '🏛️', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    dean: { icon: '🎓', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-100', text: 'text-purple-700' },
    vc: { icon: '🏫', color: 'from-rose-500 to-purple-500', bg: 'bg-rose-100', text: 'text-rose-700' },
    warden: { icon: '👔', color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-100', text: 'text-teal-700' },
    security: { icon: '🛡️', color: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-700' }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (isLogin) {
      if (!formData.username) newErrors.username = 'Username is required'
      if (!formData.password) newErrors.password = 'Password is required'
    } else {
      if (!formData.name) newErrors.name = 'Name is required'
      if (!formData.username) newErrors.username = 'Username is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (formData.role === 'student' && !formData.studentId) newErrors.studentId = 'Student ID is required'
      if (formData.role !== 'student' && formData.role !== 'security' && !formData.employeeId) {
        newErrors.employeeId = 'Employee ID is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(formData.username, formData.password)
      } else {
        result = await register({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.name,
          email: formData.email,
          role: formData.role,
          studentId: formData.studentId || undefined,
          employeeId: formData.employeeId || undefined,
          contactNumber: formData.contactNumber || undefined,
        })
      }

      if (result.success) {
        const role = result.user?.role
        if (role === 'student') {
          navigate('/student-dashboard', { replace: true })
        } else if (role === 'security') {
          navigate('/security-dashboard', { replace: true })
        } else if (['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden'].includes(role)) {
          navigate('/approver-dashboard', { replace: true })
        } else {
          navigate('/')
        }
      } else {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setErrors({})
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'student',
      studentId: '',
      employeeId: '',
      contactNumber: ''
    })
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
          isDark ? 'bg-blue-900/20' : 'bg-blue-400/30'
        } blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
          isDark ? 'bg-purple-900/20' : 'bg-purple-400/30'
        } blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full ${
          isDark ? 'bg-indigo-900/10' : 'bg-indigo-400/20'
        } blur-3xl animate-pulse delay-500`}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 z-20 p-2 rounded-lg transition-colors ${
          isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white/80 text-gray-700 hover:bg-white'
        } shadow-lg backdrop-blur-sm`}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {loading ? (
        <LoadingSpinner message={isLogin ? 'Signing in...' : 'Creating account...'} />
      ) : (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className={`p-8 rounded-3xl ${
              isDark ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' : 'bg-white/30 backdrop-blur-sm border border-white/50'
            } shadow-2xl`}>
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-6xl mb-4"
                >
                  🏫
                </motion.div>
                <h2 className={`text-3xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  University Gatepass System
                </h2>
                <p className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Secure, efficient, and digital gatepass management for campuses
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {Object.keys(roleConfig).map((roleKey) => {
                    const roleDetails = roleConfig[roleKey]
                    const label = roleKey
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')

                    return (
                      <div
                        key={roleKey}
                        className={`p-4 rounded-xl ${
                          isDark ? 'bg-slate-700/50' : 'bg-white/50'
                        } backdrop-blur-sm border ${
                          isDark ? 'border-slate-600' : 'border-white'
                        }`}
                      >
                        <div className={`text-2xl mb-2 bg-gradient-to-r ${roleDetails.color} bg-clip-text text-transparent`}>
                          {roleDetails.icon}
                        </div>
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className={`rounded-3xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-slate-800/90 backdrop-blur-md border border-slate-700' : 'bg-white/90 backdrop-blur-md border border-white/50'
            }`}>
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => !isLogin && switchMode()}
                  className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                    isLogin
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Login
                  {isLogin && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  )}
                </button>
                <button
                  onClick={() => isLogin && switchMode()}
                  className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                    !isLogin
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Sign Up
                  {!isLogin && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  )}
                </button>
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`text-2xl font-bold mb-6 ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        Welcome Back
                      </h3>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Username or Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                errors.username
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                              } ${
                                isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                              } focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="Enter your username"
                            />
                          </div>
                          {errors.username && (
                            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                errors.password
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                              } ${
                                isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                              } focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="Enter your password"
                            />
                          </div>
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className={`ml-2 text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Remember me
                            </span>
                          </label>
                          <Link
                            to="#"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Forgot Password?
                          </Link>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                          {loading ? 'Logging in...' : 'Login'}
                        </button>
                      </form>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Demo Credentials:</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">student1 / teacher1 / warden1 / security1</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">Password: 123456</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`text-2xl font-bold mb-6 ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        Create Account
                      </h3>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                          <label className={`block text-sm font-medium mb-3 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Select Your Role
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(roleConfig).map(([role, config]) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role }))}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                  formData.role === role
                                    ? `border-blue-500 bg-gradient-to-br ${config.color} text-white shadow-lg scale-105`
                                    : `border-gray-300 dark:border-slate-600 ${
                                        isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
                                      }`
                                }`}
                              >
                                <div className="text-2xl mb-1">{config.icon}</div>
                                <div className="text-xs font-medium capitalize">
                                  {role
                                    .replace('_', ' ')
                                    .split(' ')
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                errors.name
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                              } ${
                                isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                              } focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="Enter your full name"
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Username
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                errors.username
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                              } ${
                                isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                              } focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="Choose a username"
                            />
                          </div>
                          {errors.username && (
                            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                errors.email
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                              } ${
                                isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                              } focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="Enter your email"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                  errors.password
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                                } ${
                                  isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="Create password"
                              />
                            </div>
                            {errors.password && (
                              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Confirm Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                  errors.confirmPassword
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                                } ${
                                  isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="Confirm password"
                              />
                            </div>
                            {errors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                          </div>
                        </div>

                        {formData.role === 'student' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Student ID
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                  errors.studentId
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                                } ${
                                  isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="Enter your student ID"
                              />
                            </div>
                            {errors.studentId && (
                              <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
                            )}
                          </motion.div>
                        )}

                        {formData.role !== 'student' && formData.role !== 'security' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Employee ID
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h3a2 2 0 011.414.586l1 1A2 2 0 0012.828 5H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                                  errors.employeeId
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                                } ${
                                  isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="Enter your employee ID"
                              />
                            </div>
                            {errors.employeeId && (
                              <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
                            )}
                          </motion.div>
                        )}

                        {formData.role !== 'student' && (
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Contact Number (optional)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1.172a2 2 0 011.414.586l1.828 1.828a2 2 0 010 2.828l-.879.879a11.037 11.037 0 005.657 5.657l.879-.879a2 2 0 012.828 0l1.828 1.828a2 2 0 01.586 1.414V19a2 2 0 01-2 2 16 16 0 01-16-16z" />
                                </svg>
                              </div>
                              <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 ${
                                  isDark ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500/20`}
                                placeholder="Optional contact number"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                          {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 text-center">
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={switchMode}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      )}
    </div>
  )
}

export default Auth

