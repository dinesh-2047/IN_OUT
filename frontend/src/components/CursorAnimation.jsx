import React, { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CursorAnimation = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDark } = useTheme();
  
  // Use motion values for better performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Throttle mouse move events for better performance
  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleMouseOver = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseOut = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    // Check if device is mobile/tablet (no cursor)
    const checkDevice = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 
                 'ontouchstart' in window || 
                 navigator.maxTouchPoints > 0);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Only add cursor animation on non-mobile devices
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      
      // Use event delegation for better performance
      document.body.addEventListener('mouseover', (e) => {
        if (e.target.tagName.toLowerCase() === 'a' || 
            e.target.tagName.toLowerCase() === 'button' ||
            e.target.tagName.toLowerCase() === 'input' ||
            e.target.tagName.toLowerCase() === 'select' ||
            e.target.tagName.toLowerCase() === 'textarea' ||
            e.target.closest('[role="button"]')) {
          handleMouseOver();
        }
      });
      
      document.body.addEventListener('mouseout', (e) => {
        if (e.target.tagName.toLowerCase() === 'a' || 
            e.target.tagName.toLowerCase() === 'button' ||
            e.target.tagName.toLowerCase() === 'input' ||
            e.target.tagName.toLowerCase() === 'select' ||
            e.target.tagName.toLowerCase() === 'textarea' ||
            e.target.closest('[role="button"]')) {
          handleMouseOut();
        }
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseover', handleMouseOver);
        document.body.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut, isMobile]);

  // Return null on mobile devices
  if (isMobile) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: isDark ? "rgba(255, 120, 31, 0.5)" : "rgba(108, 50, 246, 0.5)",
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.6,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 28,
          mass: 0.5,
        }}
      />
      
      {/* Trail effect */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-40"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: 0.3,
          scale: 0.6,
          backgroundColor: isDark ? "rgba(255, 120, 31, 0.3)" : "rgba(108, 50, 246, 0.3)",
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          mass: 0.8,
          delay: 0.03,
        }}
      />
      
      {/* Inout shape - diamond */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-30"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          rotate: {
            repeat: Infinity,
            duration: 8,
            ease: "linear",
          },
          default: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
            mass: 1,
          }
        }}
      >
        <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M20 0L40 20L20 40L0 20L20 0Z" 
            fill={isDark ? "rgba(255, 120, 31, 0.2)" : "rgba(108, 50, 246, 0.2)"}
            stroke={isDark ? "rgba(255, 120, 31, 0.5)" : "rgba(108, 50, 246, 0.5)"}
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </>
  );
};

export default CursorAnimation;