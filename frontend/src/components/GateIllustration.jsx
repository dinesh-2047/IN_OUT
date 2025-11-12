import React from 'react'
import { motion } from 'framer-motion'

function GateIllustration({ isDark }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto max-w-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Gate */}
        <motion.rect
          x="50"
          y="100"
          width="300"
          height="150"
          rx="10"
          fill={isDark ? "#374151" : "#E5E7EB"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Gate Bars */}
        <motion.line
          x1="120"
          y1="100"
          x2="120"
          y2="250"
          stroke={isDark ? "#4B5563" : "#9CA3AF"}
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.line
          x1="200"
          y1="100"
          x2="200"
          y2="250"
          stroke={isDark ? "#4B5563" : "#9CA3AF"}
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.line
          x1="280"
          y1="100"
          x2="280"
          y2="250"
          stroke={isDark ? "#4B5563" : "#9CA3AF"}
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* QR Code */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <rect x="150" y="170" width="100" height="100" rx="5" fill="white" stroke={isDark ? "#6B7280" : "#D1D5DB"} strokeWidth="2" />
          {/* QR Pattern */}
          <rect x="160" y="180" width="20" height="20" fill="black" />
          <rect x="190" y="180" width="20" height="20" fill="black" />
          <rect x="220" y="180" width="10" height="20" fill="black" />
          <rect x="160" y="210" width="20" height="20" fill="black" />
          <rect x="200" y="210" width="30" height="10" fill="black" />
          <rect x="160" y="240" width="30" height="20" fill="black" />
          <rect x="200" y="250" width="20" height="10" fill="black" />
        </motion.g>

        {/* Student/Phone */}
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <circle cx="100" cy="200" r="25" fill={isDark ? "#6366F1" : "#818CF8"} />
          <rect x="80" y="215" width="40" height="35" rx="5" fill={isDark ? "#4F46E5" : "#6366F1"} />
        </motion.g>

        {/* Scan Lines */}
        <motion.line
          x1="150"
          y1="220"
          x2="250"
          y2="220"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 1.5,
          }}
        />

        {/* Success Checkmark */}
        <motion.path
          d="M320 180 L340 200 L360 170"
          stroke="#10B981"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </svg>
    </div>
  )
}

export default GateIllustration





