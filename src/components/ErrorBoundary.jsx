import React from 'react'
import { AlertCircle, RefreshCw } from 'react-feather'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-bw-white dark:bg-bw-gray-1 p-4">
      <div className="max-w-2xl w-full bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-lg p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={24} className="text-bw-danger-500 dark:text-bw-danger-400 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-bw-black dark:text-bw-white">
            {t('error.title')}
          </h1>
        </div>
        
        <p className="text-sm sm:text-base text-bw-gray-7 dark:text-bw-gray-6 mb-6">
          {t('error.description')}
        </p>

        {error && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-bw-black dark:text-bw-white mb-2">
              {t('error.message')}:
            </h2>
            <div className="bg-bw-gray-f dark:bg-bw-gray-3 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm p-3 overflow-auto max-h-32">
              <code className="text-xs text-bw-danger-600 dark:text-bw-danger-400 break-all">
                {error.toString()}
              </code>
            </div>
          </div>
        )}

        {errorInfo && process.env.NODE_ENV === 'development' && (
          <details className="mb-6">
            <summary className="text-sm font-semibold text-bw-black dark:text-bw-white cursor-pointer mb-2">
              {t('error.stackTrace')}:
            </summary>
            <div className="bg-bw-gray-f dark:bg-bw-gray-3 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm p-3 overflow-auto max-h-64">
              <pre className="text-xs text-bw-gray-7 dark:text-bw-gray-6 whitespace-pre-wrap break-all">
                {errorInfo.componentStack}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-bw-black dark:bg-bw-gray-1 text-bw-white dark:text-bw-white rounded-sm text-sm font-medium hover:bg-bw-gray-7 dark:hover:bg-bw-gray-2 transition-colors"
          >
            <RefreshCw size={16} strokeWidth={2} />
            {t('error.reload')}
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-sm font-medium hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 transition-colors"
          >
            {t('error.goHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary

