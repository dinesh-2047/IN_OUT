import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { isDark } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Add smooth animation to cursor following
    const animateCursor = () => {
      setCursorPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.1,
        y: prev.y + (mousePosition.y - prev.y) * 0.1
      }));
      requestAnimationFrame(animateCursor);
    };
    
    const animationId = requestAnimationFrame(animateCursor);
    return () => cancelAnimationFrame(animationId);
  }, [mousePosition]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative overflow-hidden py-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-white text-xl font-bold">🏫</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  InOut
                </span>
            </Link>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Simplifying campus entry and exit management for educational institutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Home</Link></li>
              <li><Link to="/login" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Login</Link></li>
              <li><Link to="/register" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="#" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Help Center</Link></li>
              <li><Link to="#" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Contact Support</Link></li>
              <li><Link to="#" className={`text-sm hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </motion.a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            © {currentYear} InOut. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Interactive element that follows cursor */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          translateX: "-50%",
          translateY: "-50%"
        }}
      >
        <motion.div
          className={`w-24 h-24 rounded-full opacity-10 ${isDark ? 'bg-orange-500' : 'bg-purple-500'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </footer>
  );
};

export default Footer;