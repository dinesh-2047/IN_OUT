import React from 'react'
import { motion } from 'framer-motion'

function FloatingParticles({ count = 20, isDark }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            isDark 
              ? 'bg-gradient-to-r from-orange-400/30 to-pink-400/30'
              : 'bg-gradient-to-r from-orange-400/20 to-pink-400/20'
          }`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -150, 150, 0],
            scale: [1, 1.5, 0.5, 1],
            opacity: [0.3, 0.6, 0.2, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Additional glowing particles */}
      {particles.slice(0, 10).map((particle) => (
        <motion.div
          key={`glow-${particle.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size / 2,
            height: particle.size / 2,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [0, -80, 80, 0],
            y: [0, 120, -120, 0],
            opacity: [0.5, 1, 0.3, 0.5],
          }}
          transition={{
            duration: particle.duration * 0.8,
            delay: particle.delay + 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default FloatingParticles





