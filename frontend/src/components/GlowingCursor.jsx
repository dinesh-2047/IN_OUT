import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GlowingCursor = () => {
  const { isDark } = useTheme();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track mouse position
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, cursorX, cursorY]);

  // Track hover state on interactive elements
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });
    
    return () => {
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [isMobile]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: isDark ? "#ffffff" : "#8B5CF6",
          opacity: 0.7,
          scale: isHovering ? 1.5 : 1
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.5
        }}
      />
      
      {/* Outer glow */}
      <motion.div
        className="fixed top-0 left-0 w-24 h-24 rounded-full pointer-events-none z-40"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          background: isDark 
            ? "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0) 70%)" 
            : "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
          scale: isHovering ? 1.2 : 1
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.8
        }}
      />
    </>
  );
};

export default GlowingCursor;