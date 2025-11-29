import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { I18nProvider } from './i18n/I18nContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

// Lazy load Toaster để giảm initial bundle size
const Toaster = lazy(() => import('sonner').then(module => ({ default: module.Toaster })))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <App />
        <Suspense fallback={null}>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #dddddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Inter, Helvetica, Poppins, system-ui, sans-serif',
              },
              className: 'toast-custom',
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>,
)

