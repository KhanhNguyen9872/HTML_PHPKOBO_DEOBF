import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import { I18nProvider } from './i18n/I18nContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
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
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

