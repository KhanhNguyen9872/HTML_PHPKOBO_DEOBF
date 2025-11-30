import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, Home, AlertTriangle, Code } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

function ErrorFallback({ error, errorInfo, onReset }) {
  const { t } = useI18n()

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99],
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

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-bw-white dark:bg-bw-gray-1 p-3 sm:p-4 md:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-2xl w-full bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-xl p-4 sm:p-6 md:p-8"
        variants={itemVariants}
      >
        {/* Header với icon */}
        <motion.div
          className="flex items-center gap-3 mb-4 sm:mb-6"
          variants={itemVariants}
        >
          <motion.div
            className="p-2.5 bg-bw-danger-500/10 dark:bg-bw-danger-500/20 rounded-sm"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          >
            <AlertTriangle
              size={28}
              className="text-bw-danger-500 dark:text-bw-danger-400 sm:w-8 sm:h-8"
              strokeWidth={2.5}
            />
          </motion.div>
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl font-bold text-bw-black dark:text-bw-white"
            variants={itemVariants}
          >
            {t('error.title')}
          </motion.h1>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base text-bw-gray-7 dark:text-bw-gray-6 mb-6 leading-relaxed"
          variants={itemVariants}
        >
          {t('error.description')}
        </motion.p>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-4 sm:mb-6"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <AlertCircle size={16} className="text-bw-danger-500 dark:text-bw-danger-400" />
              <h2 className="text-sm font-semibold text-bw-black dark:text-bw-white">
                {t('error.message')}:
              </h2>
            </motion.div>
            <motion.div
              className="bg-bw-gray-f dark:bg-bw-gray-3 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm p-3 sm:p-4 overflow-auto max-h-32 sm:max-h-40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <code className="text-xs sm:text-sm text-bw-danger-600 dark:text-bw-danger-400 break-all font-mono">
                {error.toString()}
              </code>
            </motion.div>
          </motion.div>
        )}

        {/* Stack Trace (Development only) */}
        {errorInfo && process.env.NODE_ENV === 'development' && (
          <motion.details
            className="mb-4 sm:mb-6"
            variants={itemVariants}
          >
            <motion.summary
              className="text-sm font-semibold text-bw-black dark:text-bw-white cursor-pointer mb-2 flex items-center gap-2 hover:text-bw-danger-500 dark:hover:text-bw-danger-400 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Code size={16} />
              {t('error.stackTrace')}:
            </motion.summary>
            <motion.div
              className="bg-bw-gray-f dark:bg-bw-gray-3 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm p-3 sm:p-4 overflow-auto max-h-48 sm:max-h-64 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <pre className="text-xs sm:text-sm text-bw-gray-7 dark:text-bw-gray-6 whitespace-pre-wrap break-all font-mono">
                {errorInfo.componentStack}
              </pre>
            </motion.div>
          </motion.details>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          variants={itemVariants}
        >
          <motion.button
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-bw-black dark:bg-bw-gray-1 text-bw-white rounded-sm text-sm font-medium hover:bg-bw-gray-7 dark:hover:bg-bw-gray-2 active:bg-bw-gray-6 dark:active:bg-bw-gray-3 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} strokeWidth={2.5} />
            {t('error.reload')}
          </motion.button>
          <motion.button
            onClick={() => (window.location.href = '/')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-sm font-medium hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 active:bg-bw-gray-d dark:active:bg-bw-gray-1 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home size={16} strokeWidth={2.5} />
            {t('error.goHome')}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default ErrorBoundary
