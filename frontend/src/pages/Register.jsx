import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Logo from '../components/Logo'
import { FiUser, FiMail, FiLock, FiLogIn } from 'react-icons/fi'

function Register() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(name, username, password)

    if (result.success) {
      navigate('/login', { replace: true })
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-['Poppins'] transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <div
        className={`flex flex-col md:flex-row w-full max-w-4xl mx-4 md:mx-0 rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Left Section */}
        <div
          className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-6 mx-auto">
              <Logo />
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-purple-400' : 'text-indigo-600'
              }`}
            >
              Create Your Account
            </h1>
            <p className={`text-sm max-w-xs mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join our community to streamline your campus access and manage gate passes effortlessly.
            </p>
          </motion.div>
        </div>

        {/* Right Section */}
        <div
          className={`w-full md:w-1/2 p-8 md:p-12 ${
            isDark ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-center ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              Sign Up
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <FiUser
                  className={`absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-purple-500'
                      : 'border-gray-200 focus:ring-indigo-500'
                  }`}
                  placeholder="Full Name"
                />
              </div>
              <div className="relative">
                <FiMail
                  className={`absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-purple-500'
                      : 'border-gray-200 focus:ring-indigo-500'
                  }`}
                  placeholder="Email or Roll No"
                />
              </div>
              <div className="relative">
                <FiLock
                  className={`absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-purple-500'
                      : 'border-gray-200 focus:ring-indigo-500'
                  }`}
                  placeholder="Password"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg transition-all font-semibold text-white flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                } disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    <FiLogIn />
                    Sign Up
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-medium ${
                    isDark
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register

