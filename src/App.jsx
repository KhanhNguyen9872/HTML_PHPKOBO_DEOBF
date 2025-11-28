import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Play, Loader, Sliders } from 'react-feather'
import { useI18n } from './i18n/I18nContext'
import Header from './components/Header'
import InputEditor from './components/InputEditor'
import Preview from './components/Preview'
import OutputEditor from './components/OutputEditor'

const SNAPSHOT_LIMIT = 10
const DEFAULT_CUSTOM_SIZE = { width: 1200, height: 800 }

const loadStoredCustomSize = () => {
  try {
    const saved = localStorage.getItem('custom-preview-size')
    if (!saved) return DEFAULT_CUSTOM_SIZE
    const parsed = JSON.parse(saved)
    if (
      parsed &&
      typeof parsed.width === 'number' &&
      typeof parsed.height === 'number' &&
      parsed.width >= 200 &&
      parsed.height >= 200
    ) {
      return parsed
    }
    return DEFAULT_CUSTOM_SIZE
  } catch {
    return DEFAULT_CUSTOM_SIZE
  }
}

function App() {
  const { t } = useI18n()
  const [html, setHtml] = useState(() => {
    const saved = localStorage.getItem('html-editor-content')
    return saved || ''
  })
  const [viewMode, setViewMode] = useState('desktop')
  const initialCustomSize = loadStoredCustomSize()
  const [customWidth, setCustomWidth] = useState(initialCustomSize.width)
  const [customHeight, setCustomHeight] = useState(initialCustomSize.height)
  const [fileName, setFileName] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [outputHtml, setOutputHtml] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)
  const [previewNonce, setPreviewNonce] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode')
    return saved ? saved === 'true' : false
  })
  const [autoPreview, setAutoPreview] = useState(() => {
    const saved = localStorage.getItem('auto-preview')
    return saved ? saved === 'true' : false
  })
  const [blockNetwork, setBlockNetwork] = useState(() => {
    const saved = localStorage.getItem('block-network')
    return saved ? saved === 'true' : true
  })
  const [debounceDelay, setDebounceDelay] = useState(() => {
    const saved = localStorage.getItem('auto-preview-delay')
    const parsed = saved ? parseInt(saved, 10) : 800
    if (Number.isNaN(parsed)) return 800
    return Math.min(1500, Math.max(300, parsed))
  })
  const [snapshots, setSnapshots] = useState(() => {
    try {
      const saved = localStorage.getItem('html-snapshots')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [snapshotsSize, setSnapshotsSize] = useState(() => {
    try {
      const saved = localStorage.getItem('html-snapshots')
      return saved ? new TextEncoder().encode(saved).length : 0
    } catch {
      return 0
    }
  })
  const editorRef = useRef(null)
  const outputEditorRef = useRef(null)
  const [outputReadOnly, setOutputReadOnly] = useState(true)
  const previewTimerRef = useRef(null)

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('html-editor-content', html)
    }, 500)
    return () => clearTimeout(timer)
  }, [html])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('dark-mode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('auto-preview', autoPreview.toString())
  }, [autoPreview])

  useEffect(() => {
    localStorage.setItem('auto-preview-delay', debounceDelay.toString())
  }, [debounceDelay])

  useEffect(() => {
    const clampedWidth = Math.min(3000, Math.max(200, customWidth))
    const clampedHeight = Math.min(3000, Math.max(200, customHeight))
    localStorage.setItem(
      'custom-preview-size',
      JSON.stringify({ width: clampedWidth, height: clampedHeight })
    )
  }, [customWidth, customHeight])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    localStorage.setItem('block-network', blockNetwork.toString())
    if (!blockNetwork) {
      toast.warning(t('toast.networkUnblocked'))
    }
  }, [blockNetwork, t])

  useEffect(() => {
    try {
      const payload = JSON.stringify(snapshots)
      setSnapshotsSize(new TextEncoder().encode(payload).length)
    } catch {
      setSnapshotsSize(0)
    }
  }, [snapshots])

  useEffect(() => {
    const persistSnapshots = (list) => {
      try {
        localStorage.setItem('html-snapshots', JSON.stringify(list))
        return true
      } catch (error) {
        return false
      }
    }

    if (persistSnapshots(snapshots)) {
      return
    }

    if (!snapshots.length) return

    toast.warning(t('toast.snapshotStorageWarning'))

    let trimmed = snapshots
    while (trimmed.length > 0) {
      trimmed = trimmed.slice(0, -1)
      if (persistSnapshots(trimmed)) {
        if (trimmed.length !== snapshots.length) {
          setSnapshots(trimmed)
        }
        break
      }
    }
  }, [snapshots, setSnapshots, t])

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
      }
    }
  }, [])

  const saveSnapshot = useCallback((content) => {
    const trimmed = (content || '').trim()
    if (!trimmed) return
    setSnapshots((prev) => {
      if (prev.length && prev[0].content === content) {
        return prev
      }
      const next = [
        { id: Date.now(), content, timestamp: new Date().toISOString() },
        ...prev
      ]
      return next.slice(0, SNAPSHOT_LIMIT)
    })
  }, [])

  const triggerPreview = useCallback(({ showToast = false, isAuto = false } = {}) => {
    if (!html || html.trim() === '') {
      if (showToast) {
        toast.error(t('toast.processError'))
      }
      return false
    }

    setIsAutoProcessing(isAuto)
    setPreviewHtml(html)
    setPreviewNonce(prev => prev + 1)
    setOutputHtml('')
    setIsProcessing(true)
    setShowPreview(true)
    saveSnapshot(html)

    if (showToast) {
      toast(t('toast.processing'), {
        icon: <Loader size={16} className="animate-spin" />
      })
    }
    return true
  }, [html, t, saveSnapshot])

  const handleProcess = useCallback(() => {
    triggerPreview({ showToast: true, isAuto: false })
  }, [triggerPreview])

  useEffect(() => {
    if (!autoPreview) {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
      return
    }

    if (!html || html.trim() === '') {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
      return
    }

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
    }

    previewTimerRef.current = setTimeout(() => {
      triggerPreview({ showToast: false, isAuto: true })
      previewTimerRef.current = null
    }, debounceDelay)

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
    }
  }, [html, autoPreview, triggerPreview, debounceDelay])

  const handleQuickDownload = useCallback(() => {
    if (!html || html.trim() === '') {
      toast.error(t('toast.processError'))
      return
    }
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'input.html'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('toast.downloaded', { name: fileName || 'input.html' }))
  }, [html, fileName, t])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        handleProcess()
        return
      }
      if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault()
        handleQuickDownload()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleProcess, handleQuickDownload])

  const handlePreviewLoad = (content) => {
    if (!isProcessing) return
    setOutputHtml(content || '')
    setIsProcessing(false)
    if (!isAutoProcessing) {
      toast.success(t('toast.processSuccess'))
    }
  }


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

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-bw-white dark:bg-bw-gray-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <motion.div 
        className="flex flex-col flex-1 gap-3 sm:gap-4 p-2 sm:p-4"
        variants={containerVariants}
      >
        <InputEditor 
          html={html}
          setHtml={setHtml}
          fileName={fileName}
          setFileName={setFileName}
          editorRef={editorRef}
          darkMode={darkMode}
          snapshots={snapshots}
          setSnapshots={setSnapshots}
          snapshotsSize={snapshotsSize}
          onLoadUrl={async (url) => {
            if (!url) return
            try {
              const response = await fetch(url)
              if (!response.ok) {
                throw new Error('Failed to fetch')
              }
              const text = await response.text()
              setHtml(text)
              toast.success(t('toast.loadedFromUrl', { url }))
            } catch (error) {
              toast.error(t('toast.loadFromUrlError'))
            }
          }}
          onLoadClipboard={async () => {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
              toast.error(t('toast.clipboardUnsupported'))
              return
            }
            try {
              const text = await navigator.clipboard.readText()
              if (!text) {
                toast.error(t('toast.clipboardEmpty'))
                return
              }
              setHtml(text)
              toast.success(t('toast.loadedFromClipboard'))
            } catch (error) {
              toast.error(t('toast.clipboardReadError'))
            }
          }}
        />

        <motion.div
          className="flex flex-col lg:flex-row items-center justify-center gap-2 sm:gap-4 py-2 sm:py-4"
          variants={itemVariants}
        >
          <motion.button
            className="px-4 sm:px-6 py-2 sm:py-3 bg-bw-black text-bw-white border border-bw-black rounded-sm cursor-pointer text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleProcess}
            disabled={isProcessing || !html || html.trim() === ''}
            whileHover={!isProcessing && html && html.trim() !== '' ? { backgroundColor: '#333333', borderColor: '#333333' } : {}}
            whileTap={!isProcessing && html && html.trim() !== '' ? { scale: 0.95 } : {}}
            transition={{ duration: 0.2 }}
          >
            {isProcessing ? (
              <Loader size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Play size={14} strokeWidth={2} className="sm:w-4 sm:h-4" />
            )}
            {isProcessing ? t('process.buttonProcessing') : t('process.button')}
          </motion.button>
          <div className="group flex flex-col items-center gap-1">
            <motion.button
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-sm text-xs sm:text-sm font-medium transition-colors ${
                autoPreview
                  ? 'bg-bw-black text-bw-white border-bw-black'
                  : 'bg-bw-white text-bw-black border-bw-gray-d dark:bg-bw-gray-3 dark:text-bw-white dark:border-bw-gray-3'
              }`}
              onClick={() => setAutoPreview((prev) => !prev)}
              whileTap={{ scale: 0.96 }}
            >
              <span className="relative inline-flex w-8 h-4 rounded-full border border-current transition-colors">
                <span
                  className={`absolute top-[2px] w-3 h-3 rounded-full bg-current transition-transform ${
                    autoPreview ? 'translate-x-[20px]' : 'translate-x-0'
                  }`}
                />
              </span>
              <span>{t('process.autoToggle')}</span>
            </motion.button>
            <span className="text-[10px] uppercase tracking-wide text-bw-gray-6 dark:text-bw-gray-5 opacity-0 group-hover:opacity-100 transition-opacity">
              {autoPreview ? t('process.autoOn') : t('process.autoOff')}
            </span>
          </div>
          {autoPreview && (
            <div className="flex flex-col items-center gap-1 text-[10px] sm:text-xs text-bw-gray-7 dark:text-bw-gray-7">
              <div className="flex items-center gap-2">
                <Sliders size={12} className="text-bw-gray-6 dark:text-bw-gray-5" />
                <input
                  type="range"
                  min="300"
                  max="1500"
                  step="50"
                  value={debounceDelay}
                  onChange={(e) => setDebounceDelay(Number(e.target.value))}
                  className="w-32 sm:w-40 accent-bw-black dark:accent-bw-white"
                />
              </div>
              <span>{t('process.autoDelayLabel', { value: debounceDelay })}</span>
            </div>
          )}
        </motion.div>
        
        <Preview
          html={previewHtml}
          reloadKey={previewNonce}
          viewMode={viewMode}
          setViewMode={setViewMode}
          customWidth={customWidth}
          setCustomWidth={setCustomWidth}
          customHeight={customHeight}
          setCustomHeight={setCustomHeight}
          onLoad={handlePreviewLoad}
          showPreview={showPreview}
          darkMode={darkMode}
          blockNetwork={blockNetwork}
          setBlockNetwork={setBlockNetwork}
        />

        <AnimatePresence>
          {(isProcessing || outputHtml) && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <OutputEditor
                outputHtml={outputHtml}
                setOutputHtml={setOutputHtml}
                fileName={fileName}
                outputEditorRef={outputEditorRef}
                darkMode={darkMode}
                isProcessing={isProcessing}
                readOnly={outputReadOnly}
                onReadOnlyChange={setOutputReadOnly}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default App


