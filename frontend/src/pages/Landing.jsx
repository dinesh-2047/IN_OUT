import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import AnimatedCounter from '../components/AnimatedCounter'
import GateIllustration from '../components/GateIllustration'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import FloatingParticles from '../components/FloatingParticles'

function Landing() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const featuresRef = useRef(null)
  const heroRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Advanced scroll animations
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const heroSpring = useSpring(heroY, springConfig)

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = heroRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRoleClick = (role) => {
    navigate(`/login`)
  }

  const stats = [
    { icon: '🧑‍🎓', value: 1200, suffix: '+ Students Registered', color: 'text-orange-600' },
    { icon: '🧾', value: 500, suffix: '+ Gatepasses Approved', color: 'text-red-600' },
    { icon: '🛡', value: 24, suffix: '/7 Security Verified', color: 'text-orange-500' },
  ]

  const isActiveLink = (path) => {
    return location.pathname === path
  }

  // Enhanced hero background animation
  const HeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
          : 'bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100'
      }`}>
        {/* Animated gradient orbs */}
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
            isDark ? 'bg-purple-500/20' : 'bg-orange-400/30'
          } blur-3xl`}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full ${
            isDark ? 'bg-indigo-500/20' : 'bg-pink-400/30'
          } blur-3xl`}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Interactive mouse-following spotlight */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"
          style={{
            x: mousePosition.x * 100,
            y: mousePosition.y * 100,
          }}
        />
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen font-['Poppins'] transition-all duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-peach-200 via-pink-200 to-pink-300'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg rounded-b-2xl mx-4 mt-2 ${isDark ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/80 border border-white/50'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo />

            {/* Navigation Links - Centered */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/register"
                className={`text-base font-medium transition-colors duration-200 ${
                  isActiveLink('/register')
                    ? 'text-[#6c32f6] font-semibold'
                    : isDark ? 'text-gray-200 hover:text-[#ff781f]' : 'text-gray-700 hover:text-[#ff781f]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Apply
              </Link>
              <Link
                to="/login"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToFeatures()
                }}
                className={`text-base font-medium transition-colors duration-200 ${
                  isActiveLink('/features')
                    ? 'text-[#6c32f6] font-semibold'
                    : isDark ? 'text-gray-200 hover:text-[#ff781f]' : 'text-gray-700 hover:text-[#ff781f]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Track Application
              </Link>
              <Link
                to="/login"
                className={`text-base font-medium transition-colors duration-200 ${
                  isActiveLink('/login')
                    ? 'text-[#6c32f6] font-semibold'
                    : isDark ? 'text-gray-200 hover:text-[#ff781f]' : 'text-gray-700 hover:text-[#ff781f]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Login
              </Link>
            </div>

            {/* Sign In Button - Right */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-32">
        {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: heroSpring, opacity: heroOpacity }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <HeroBackground />
        <FloatingParticles />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                New: AI-powered gatepass system
              </motion.div>

              {/* Main title with gradient text */}
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className={`bg-gradient-to-r ${
                  isDark 
                    ? 'from-orange-400 via-pink-400 to-purple-400' 
                    : 'from-orange-600 via-red-600 to-pink-600'
                } bg-clip-text text-transparent animate-gradient-x`}>
                  Smart Campus Gatepass
                </span>
                <br />
                <span className={`${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Management System
                </span>
              </motion.h1>

              {/* Enhanced subtitle */}
              <motion.p 
                className={`text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Experience the future of campus security with our AI-powered, blockchain-secured, 
                and IoT-integrated gatepass system. Fast, secure, and intelligent.
              </motion.p>

              {/* Enhanced CTA buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  onClick={scrollToFeatures}
                  className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600' 
                      : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
                  } shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Now
                    <motion.span 
                      className="text-xl"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                </motion.button>

                <motion.button
                  onClick={() => handleRoleClick('student')}
                  className={`group px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 ${
                    isDark 
                      ? 'border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white' 
                      : 'border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                  } backdrop-blur-sm bg-white/10 hover:bg-white/20`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <span>🔐</span>
                    Secure Login
                  </span>
                </motion.button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>24/7 Support</span>
                </div>
              </motion.div>

              {/* Enhanced 3-step process */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {[
                  { 
                    step: '1', 
                    title: 'Apply', 
                    description: 'Submit gatepass with AI validation',
                    icon: '📝',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    step: '2', 
                    title: 'Approve', 
                    description: 'Smart approval with ML algorithms',
                    icon: '✅',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    step: '3', 
                    title: 'Scan', 
                    description: 'QR code scanning with blockchain',
                    icon: '📱',
                    color: 'from-purple-500 to-pink-500'
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    className={`relative group p-4 rounded-xl backdrop-blur-sm ${
                      isDark 
                        ? 'bg-white/5 border border-white/10' 
                        : 'bg-white/60 border border-white/20'
                    } shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      rotateY: 5,
                      rotateX: -5
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                  >
                    {/* Step number with gradient */}
                    <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {item.step}
                    </div>
                    
                    {/* Icon with animation */}
                    <motion.div 
                      className="text-2xl mb-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {item.icon}
                    </motion.div>
                    
                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-1 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-xs ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Illustration */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <motion.div 
                className="p-8 rounded-3xl bg-white/40 backdrop-blur-md shadow-2xl border border-white/50"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <GateIllustration isDark={false} />
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="flex justify-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <motion.div
              className={`w-6 h-10 border-2 ${
                isDark ? 'border-white/30' : 'border-gray-400'
              } rounded-full flex justify-center`}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`w-1 h-3 ${
                isDark ? 'bg-white/60' : 'bg-gray-600'
              } rounded-full mt-2`}></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

        {/* Stats Bar */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className={`text-3xl font-bold mb-1 ${stat.color}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <AnimatedCounter value={stat.value} />
                  <span className="text-lg font-normal ml-1">{stat.suffix}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <section ref={featuresRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: 'var(--text-primary)'
            }}>
              Why Choose <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">InOut</span>?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: 'var(--text-secondary)'
            }}>
              Experience the future of campus gate pass management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '⚡',
                title: 'Fast Processing',
                description: 'Get your gate pass approved in minutes, not days.',
                highlight: 'minutes'
              },
              {
                icon: '🔒',
                title: 'Secure & Safe',
                description: 'End-to-end encryption ensures your data is protected.',
                highlight: 'protected'
              },
              {
                icon: '📱',
                title: 'QR Code System',
                description: 'Simple scan and verify process for seamless entry.',
                highlight: 'seamless'
              },
              {
                icon: '✅',
                title: 'Real-time Updates',
                description: 'Track your application status in real-time.',
                highlight: 'real-time'
              },
              {
                icon: '🌐',
                title: 'Accessible Anywhere',
                description: 'Use from any device, anywhere, anytime.',
                highlight: 'anywhere'
              },
              {
                icon: '📊',
                title: 'Easy Management',
                description: 'Simple dashboard for students, wardens, and security.',
                highlight: 'Simple'
              },
              {
                icon: '🕐',
                title: '24×7 Access',
                description: 'Gate pass system available anytime, anywhere.',
                highlight: 'anytime'
              },
              {
                icon: '🔔',
                title: 'Smart Notifications',
                description: 'Real-time updates when your pass is approved.',
                highlight: 'Real-time'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative bg-[var(--glass-bg)] backdrop-blur-md rounded-xl p-5 shadow-md border border-[var(--glass-border)] hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-primary)'
                }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--text-primary)'
                  }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--text-secondary)'
                  }}>
                    {feature.description.split(feature.highlight).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">{feature.highlight}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Landing
