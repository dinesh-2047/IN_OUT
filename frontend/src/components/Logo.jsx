import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Logo = () => {
  const { isDark } = useTheme();
  
  return (
    <Link to="/" className="flex items-center gap-3">
      <motion.div
        className="w-12 h-12 flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0Z" 
            fill={isDark ? "#8B5CF6" : "#7C3AED"} 
          />
          <circle cx="50" cy="30" r="15" fill="white" />
          <rect x="35" y="50" width="30" height="30" rx="5" fill="white" />
        </svg>
      </motion.div>
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        InOut
      </span>
    </Link>
  );
};

export default Logo;