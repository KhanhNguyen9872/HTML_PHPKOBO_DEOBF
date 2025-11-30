import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'react-feather'

export default function LanguageTransition({ isTransitioning, newLanguageCode, availableLanguages }) {
  // Tìm tên ngôn ngữ mới
  const newLanguage = availableLanguages?.find(lang => lang.code === newLanguageCode)
  const languageName = newLanguage?.name || (newLanguageCode ? newLanguageCode.toUpperCase() : '')

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && newLanguageCode && (
        <motion.div
          key={newLanguageCode}
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
          
          {/* Biểu tượng ngôn ngữ ở trung tâm */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3"
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
            <Globe 
              size={48} 
              strokeWidth={2.5}
              className="text-bw-white drop-shadow-lg"
            />
            <motion.span
              className="text-2xl font-bold text-bw-white drop-shadow-lg uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {languageName}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

