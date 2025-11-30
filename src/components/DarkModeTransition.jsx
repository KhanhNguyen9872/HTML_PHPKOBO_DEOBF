import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'react-feather'

export default function DarkModeTransition({ isTransitioning, newDarkMode }) {
  // Hiển thị icon của mode MỚI (không phải mode cũ)
  const iconToShow = newDarkMode ? 'moon' : 'sun'

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Overlay mờ */}
          <motion.div
            className="absolute inset-0 bg-bw-black/40 dark:bg-bw-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
          
          {/* Icon ở trung tâm - chỉ hiển thị icon của mode mới */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ 
              scale: 1,
              rotate: 0
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {iconToShow === 'sun' ? (
              <Sun 
                size={64} 
                strokeWidth={2.5}
                className="text-bw-white drop-shadow-lg"
              />
            ) : (
              <Moon 
                size={64} 
                strokeWidth={2.5}
                className="text-bw-white drop-shadow-lg"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

