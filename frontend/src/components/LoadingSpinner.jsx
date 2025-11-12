import React from 'react'
import { motion } from 'framer-motion'

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-200 via-pink-200 to-pink-300">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <motion.span
              className="text-4xl"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                },
                scale: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }
              }}
            >
              🏫
            </motion.span>
          </div>
        </motion.div>

        {/* Spinning Circles */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-red-500 border-t-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-xl font-semibold text-gray-800"
          style={{ fontFamily: "'Poppins', sans-serif" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {message}
        </motion.p>

        {/* Dots Animation */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner




