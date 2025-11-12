import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let startTime = null
      const duration = 2000 // 2 seconds
      
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeOutQuart * value))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(value)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix && ` ${suffix}`}
    </span>
  )
}

export default AnimatedCounter

