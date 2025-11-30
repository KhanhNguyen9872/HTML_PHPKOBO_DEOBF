import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Home, XCircle, Zap, Database, Code } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'

// Component để trigger error
function ErrorThrower({ type, t }) {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    switch (type) {
      case 'render':
        throw new Error(t('errorTest.renderError'))
      case 'async':
        throw new Error(t('errorTest.asyncError'))
      case 'null':
        const obj = null
        return obj.property // TypeError
      case 'undefined':
        const arr = undefined
        return arr[0] // TypeError
      case 'syntax':
        throw new SyntaxError(t('errorTest.syntaxError'))
      default:
        throw new Error(t('errorTest.genericError'))
    }
  }

  return (
    <motion.button
      onClick={() => setShouldError(true)}
      className="w-full px-4 py-2.5 bg-bw-danger-500 text-bw-white rounded-sm hover:bg-bw-danger-600 active:bg-bw-danger-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AlertTriangle size={16} strokeWidth={2.5} />
      {t('errorTest.triggerError')}
    </motion.button>
  )
}

export default function ErrorTestPage({ onBack }) {
  const { t } = useI18n()

  const errorTypes = [
    { 
      id: 'render', 
      nameKey: 'errorTest.renderErrorName', 
      icon: Code, 
      descKey: 'errorTest.renderErrorDesc' 
    },
    { 
      id: 'null', 
      nameKey: 'errorTest.nullReferenceName', 
      icon: Database, 
      descKey: 'errorTest.nullReferenceDesc' 
    },
    { 
      id: 'undefined', 
      nameKey: 'errorTest.undefinedAccessName', 
      icon: XCircle, 
      descKey: 'errorTest.undefinedAccessDesc' 
    },
    { 
      id: 'syntax', 
      nameKey: 'errorTest.syntaxErrorName', 
      icon: AlertTriangle, 
      descKey: 'errorTest.syntaxErrorDesc' 
    },
    { 
      id: 'async', 
      nameKey: 'errorTest.asyncErrorName', 
      icon: Zap, 
      descKey: 'errorTest.asyncErrorDesc' 
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <div className="min-h-screen bg-bw-white dark:bg-bw-gray-1 p-3 sm:p-4 md:p-6 lg:p-8">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="p-2 sm:p-2.5 bg-bw-danger-500/10 dark:bg-bw-danger-500/20 rounded-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AlertTriangle 
                size={20} 
                className="text-bw-danger-500 dark:text-bw-danger-400 sm:w-6 sm:h-6" 
              />
            </motion.div>
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold text-bw-black dark:text-bw-white"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {t('errorTest.title')}
            </motion.h1>
          </motion.div>
          <motion.button
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-bw-black dark:bg-bw-gray-3 text-bw-white rounded-sm hover:bg-bw-gray-7 dark:hover:bg-bw-gray-2 active:bg-bw-gray-6 dark:active:bg-bw-gray-1 transition-colors text-sm font-medium"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home size={16} strokeWidth={2.5} />
            <span className="hidden xs:inline">{t('errorTest.goHome')}</span>
            <span className="xs:hidden">{t('errorTest.home')}</span>
          </motion.button>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          className="bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-sm p-4 sm:p-5 md:p-6 mb-4 sm:mb-6"
          variants={itemVariants}
        >
          <p className="text-xs sm:text-sm md:text-base text-bw-gray-7 dark:text-bw-gray-6 leading-relaxed">
            {t('errorTest.description')}
          </p>
        </motion.div>

        {/* Error Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          variants={containerVariants}
        >
          {errorTypes.map((error, index) => {
            const Icon = error.icon
            return (
              <motion.div
                key={error.id}
                className="bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm p-4 sm:p-5 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 flex flex-col"
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-bw-danger-500/10 dark:bg-bw-danger-500/20 rounded-sm flex-shrink-0">
                    <Icon 
                      size={18} 
                      className="text-bw-danger-500 dark:text-bw-danger-400 sm:w-5 sm:h-5" 
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-bw-black dark:text-bw-white mb-1.5">
                      {t(error.nameKey)}
                    </h3>
                    <p className="text-xs sm:text-sm text-bw-gray-7 dark:text-bw-gray-6 leading-relaxed mb-4">
                      {t(error.descKey)}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <ErrorThrower type={error.id} t={t} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
