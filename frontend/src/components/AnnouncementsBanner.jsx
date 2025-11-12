import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function AnnouncementsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const announcements = [
    {
      id: 1,
      title: 'Gate Pass Policy Update',
      message: 'All gate pass applications must be submitted at least 2 hours before departure time.',
      type: 'info',
      icon: '📢'
    },
    {
      id: 2,
      title: 'Weekend Gate Pass',
      message: 'Weekend gate passes can now be applied for up to 3 days in advance.',
      type: 'success',
      icon: '✨'
    },
    {
      id: 3,
      title: 'Holiday Notice',
      message: 'During holidays, gate pass approval may take up to 24 hours.',
      type: 'warning',
      icon: '⚠️'
    }
  ]

  const currentAnnouncement = announcements[currentIndex]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAnnouncement.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`p-4 rounded-xl mb-6 border-l-4 ${
          currentAnnouncement.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
          currentAnnouncement.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{currentAnnouncement.icon}</span>
          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${
              currentAnnouncement.type === 'info' ? 'text-blue-900 dark:text-blue-200' :
              currentAnnouncement.type === 'success' ? 'text-green-900 dark:text-green-200' :
              'text-yellow-900 dark:text-yellow-200'
            }`}>
              {currentAnnouncement.title}
            </h4>
            <p className={`text-sm ${
              currentAnnouncement.type === 'info' ? 'text-blue-700 dark:text-blue-300' :
              currentAnnouncement.type === 'success' ? 'text-green-700 dark:text-green-300' :
              'text-yellow-700 dark:text-yellow-300'
            }`}>
              {currentAnnouncement.message}
            </p>
          </div>
        </div>
        <div className="flex gap-1 mt-3 justify-center">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnnouncementsBanner




