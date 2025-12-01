import { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import LazyMonacoEditor from './LazyMonacoEditor'
import VirtualizedList from './VirtualizedList'
import axios from 'axios'
import { Upload, Download, Copy, Trash2, Code, AlertCircle, CheckCircle, X, Clock, RefreshCw, XCircle, Link2, Clipboard, MoreHorizontal, Maximize2, Minimize2 } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'
import { html_beautify, css_beautify, js_beautify } from 'js-beautify'

const deriveRouteBasedFileName = (targetUrl) => {
  try {
    const { pathname } = new URL(targetUrl)
    if (!pathname || pathname === '/' || pathname.trim() === '') {
      return 'index.html'
    }
    const segments = pathname.split('/').filter(Boolean)
    let lastSegment = segments.pop() || 'index'
    lastSegment = lastSegment.replace(/(\.php|\.html)$/i, '')
    lastSegment = lastSegment.replace(/[^a-zA-Z0-9-_]/g, '_') || 'index'
    return `${lastSegment}.html`
  } catch {
    return 'index.html'
  }
}

export default function InputEditor({ html, setHtml, fileName, setFileName, editorRef, darkMode, snapshots = [], setSnapshots, snapshotsSize = 0, onLoadUrl, onLoadClipboard }) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [isExampleLoading, setIsExampleLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [beautyDropdownOpen, setBeautyDropdownOpen] = useState(false)
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false)
  const [beautyHTML, setBeautyHTML] = useState(true)
  const [beautyCSS, setBeautyCSS] = useState(false)
  const [beautyJS, setBeautyJS] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(null)
  const [isCompactToolbar, setIsCompactToolbar] = useState(false)
  const [isCompactMenuOpen, setIsCompactMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBeautifying, setIsBeautifying] = useState(false)
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [isUrlOverlayOpen, setIsUrlOverlayOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)
  const beautyDropdownRef = useRef(null)
  const historyDropdownRef = useRef(null)
  const compactMenuRef = useRef(null)
  const dragCounter = useRef(0)
  const exampleControllerRef = useRef(null)
  const pendingInputRef = useRef(html)
  const inputUpdateTimerRef = useRef(null)
  const hasLoadedExampleRef = useRef(false)

  const processFile = useCallback((file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('toast.fileTooLarge'), {
        icon: <AlertCircle size={18} strokeWidth={2} />
      })
      return
    }
    setIsLoading(true)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      setHtml(content)
      setIsLoading(false)
      toast.success(t('toast.fileUploaded', { name: file.name }), {
        icon: <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle size={18} strokeWidth={2} />
        </motion.div>
      })
    }
    reader.onerror = () => {
      toast.error(t('toast.fileError'), {
        icon: <X size={18} strokeWidth={2} />
      })
      setIsLoading(false)
    }
    reader.readAsText(file)
  }, [setFileName, setHtml, t])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    processFile(file)
  }

  const handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounter.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)
    const file = event.dataTransfer?.files?.[0]
    processFile(file)
  }

  const handleDownload = useCallback(() => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'input.html'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('toast.downloaded', { name: fileName || 'input.html' }), {
      icon: <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <Download size={18} strokeWidth={2} />
      </motion.div>
    })
  }, [html, fileName, t])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopySuccess(true)
      toast.success(t('toast.copied'), {
        icon: <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle size={18} strokeWidth={2} />
        </motion.div>
      })
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      toast.error(t('toast.copyError'), {
        icon: <X size={18} strokeWidth={2} />
      })
    }
  }, [html, t])

  const handleClear = () => {
    toast(t('toast.clearConfirm'), {
      action: {
        label: t('toast.clear'),
        onClick: () => {
          setHtml('')
          setFileName(null)
          toast.success(t('toast.clearInput'), {
            icon: <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle size={18} strokeWidth={2} />
            </motion.div>
          })
        }
      },
      cancel: {
        label: t('toast.cancel'),
        onClick: () => {}
      },
      duration: 5000,
    })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (beautyDropdownRef.current && !beautyDropdownRef.current.contains(event.target)) {
        setBeautyDropdownOpen(false)
      }
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target)) {
        setHistoryDropdownOpen(false)
      }
      if (compactMenuRef.current && !compactMenuRef.current.contains(event.target)) {
        setIsCompactMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    pendingInputRef.current = html
  }, [html])

  useEffect(() => {
    return () => {
      if (inputUpdateTimerRef.current) {
        clearTimeout(inputUpdateTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleViewportCheck = () => {
      setIsCompactToolbar(window.innerWidth < 480)
    }
    handleViewportCheck()
    window.addEventListener('resize', handleViewportCheck)
    return () => window.removeEventListener('resize', handleViewportCheck)
  }, [])

  useEffect(() => {
    if (!isCompactToolbar) {
      setIsCompactMenuOpen(false)
    }
  }, [isCompactToolbar])

  const handleLoadFromUrl = useCallback(() => {
    setIsUrlOverlayOpen(true)
    setUrlInput('')
    // Focus vào input sau khi overlay mở
    setTimeout(() => {
      const input = document.querySelector('input[type="text"][placeholder*="https://"]')
      if (input) input.focus()
    }, 100)
  }, [])

  const fetchWithProxy = useCallback(async (targetUrl) => {
    // Dùng proxy local (Vercel serverless function)
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      const proxyResponse = await axios.get(proxyUrl)
      
      if (!proxyResponse.data.contents) {
        throw new Error('No content from proxy')
      }
      
      return proxyResponse.data.contents
    } catch (localProxyError) {
      // Fallback về allorigins nếu proxy local fail
      console.warn('Local proxy failed, trying allorigins:', localProxyError)
      const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
      const alloriginsResponse = await axios.get(alloriginsUrl)
      
      if (!alloriginsResponse.data.contents) {
        throw new Error('No content from AllOrigins')
      }
      
      return alloriginsResponse.data.contents
    }
  }, [])

  const handleUrlSubmit = useCallback(async () => {
    let url = urlInput.trim()
    if (!url) {
      toast.error(t('toast.urlEmpty'), {
        icon: <AlertCircle size={18} strokeWidth={2} />
      })
      return
    }

    // Kiểm tra và xử lý scheme
    const schemePattern = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//
    const schemeMatch = url.match(schemePattern)
    
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase()
      // Kiểm tra nếu scheme không phải http hoặc https
      if (scheme !== 'http' && scheme !== 'https') {
        toast.error(t('toast.unsupportedScheme', { scheme: `${scheme}://` }), {
          icon: <AlertCircle size={18} strokeWidth={2} />
        })
        return
      }
    } else {
      // Không có scheme, tự động thêm https://
      url = `https://${url}`
    }

    setIsUrlOverlayOpen(false)
    setIsUrlLoading(true)

    try {
      // Kiểm tra xem URL có phải là file download không (kết thúc bằng .html, .htm, .txt)
      const isFileUrl = /\.(html|htm|txt)(\?.*)?$/i.test(url)
      
      const htmlContent = await fetchWithProxy(url)
      setHtml(htmlContent)
      
      if (isFileUrl) {
        setFileName(url.split('/').pop().split('?')[0] || 'input.html')
        toast.success(t('toast.loadedFromUrlFile'), {
          icon: <CheckCircle size={18} strokeWidth={2} />
        })
      } else {
        setFileName(deriveRouteBasedFileName(url))
        toast.success(t('toast.loadedFromUrlWebsite'), {
          icon: <CheckCircle size={18} strokeWidth={2} />
        })
      }
    } catch (error) {
      console.error('Load URL error:', error)
      toast.error(t('toast.loadFromUrlError'), {
        icon: <XCircle size={18} strokeWidth={2} />
      })
    } finally {
      setIsUrlLoading(false)
      setUrlInput('')
    }
  }, [urlInput, setHtml, setFileName, t, fetchWithProxy])

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isFullscreen])

  useEffect(() => {
    if (!isUrlOverlayOpen) return
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsUrlOverlayOpen(false)
        setUrlInput('')
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleUrlSubmit()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isUrlOverlayOpen, handleUrlSubmit])

  useEffect(() => {
    // Chỉ check và load example 1 lần duy nhất khi component mount
    if (hasLoadedExampleRef.current) return
    
    // Đánh dấu đã check để không check lại
    hasLoadedExampleRef.current = true
    
    // Check localStorage - chỉ load example nếu localStorage chưa từng được set (null)
    // hoặc nếu localStorage có giá trị nhưng chỉ là rỗng/whitespace
    const savedFromStorage = typeof window !== 'undefined' ? localStorage.getItem('html-editor-content') : null
    const currentHtml = (html ?? '').trim()
    
    // Nếu localStorage chưa từng được set (null) hoặc cả localStorage và html prop đều trống
    const savedTrimmed = savedFromStorage ? savedFromStorage.trim() : ''
    const shouldLoadExample = savedFromStorage === null || (!savedTrimmed && !currentHtml)
    
    if (!shouldLoadExample) {
      return
    }

    // Chỉ load example nếu editor trống lúc mount
    const controller = new AbortController()
    exampleControllerRef.current = controller
    setIsExampleLoading(true)

    axios.get('/example_phpkobo.html', { signal: controller.signal })
      .then(({ data }) => {
        if (!data || !data.trim()) {
          setIsExampleLoading(false)
          return
        }
        setHtml(data)
        toast.success(t('toast.exampleLoaded'))
      })
      .catch(error => {
        if (axios.isCancel(error) || error.name === 'CanceledError' || error.name === 'AbortError') return
        console.error('Failed to load example:', error)
        toast.error(t('toast.exampleError'))
      })
      .finally(() => {
        exampleControllerRef.current = null
        setIsExampleLoading(false)
      })

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy 1 lần khi mount

  const handleFormat = useCallback(() => {
    setBeautyDropdownOpen(!beautyDropdownOpen)
  }, [beautyDropdownOpen])

  const handleSnapshotSelect = useCallback((snapshot) => {
    if (!snapshot) return
    setHtml(snapshot.content || '')
    if (setFileName) {
      setFileName(snapshot.fileName || null)
    }
    toast.success(t('toast.snapshotRestored'))
    setHistoryDropdownOpen(false)
  }, [setHtml, setFileName, t])

  const handleSnapshotDelete = useCallback((id) => {
    if (!setSnapshots) return
    setSnapshots((prev) => prev.filter((item) => item.id !== id))
  }, [setSnapshots])

  const handleSnapshotClearAll = useCallback(() => {
    if (!setSnapshots) return
    toast(t('toast.clearConfirm'), {
      action: {
        label: t('toast.clear'),
        onClick: () => {
          setSnapshots([])
          toast.success('History cleared')
        }
      },
      cancel: {
        label: t('toast.cancel'),
        onClick: () => {}
      },
      duration: 5000,
    })
  }, [setSnapshots, t])

  const formatSnapshotTime = useCallback((value) => {
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }, [])

  const formatSnapshotSize = useCallback((bytes) => {
    if (!bytes || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB']
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const size = bytes / Math.pow(1024, power)
    return `${size.toFixed(size >= 10 || power === 0 ? 0 : 1)} ${units[power]}`
  }, [])

  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 4,
    insertSpaces: true,
    detectIndentation: false,
  }), [])

  const handleEditorChange = useCallback((value) => {
    pendingInputRef.current = value || ''
    if (inputUpdateTimerRef.current) {
      clearTimeout(inputUpdateTimerRef.current)
    }
    inputUpdateTimerRef.current = setTimeout(() => {
      setHtml(pendingInputRef.current)
      inputUpdateTimerRef.current = null
    }, 80)
  }, [setHtml])

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  const handleBeauty = useCallback(async () => {
    if (!html || html.trim() === '') {
      toast.error(t('toast.processError'))
      return
    }
    setIsBeautifying(true)
    await new Promise((resolve) => setTimeout(resolve, 0))

    try {
      let result = html

      if (beautyHTML) {
        result = html_beautify(result, {
          indent_size: 4,
          indent_char: ' ',
          max_preserve_newlines: 2,
          preserve_newlines: true,
          wrap_line_length: 0,
          wrap_attributes: 'auto',
          end_with_newline: false
        })
      }

      if (beautyCSS) {
        // Extract and beautify CSS from style tags and inline styles
        result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
          const beautifiedCSS = css_beautify(cssContent, {
            indent_size: 4,
            indent_char: ' ',
            end_with_newline: false
          })
          return match.replace(cssContent, beautifiedCSS)
        })

        // Beautify inline styles
        result = result.replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleContent) => {
          const beautifiedStyle = css_beautify(styleContent, {
            indent_size: 4,
            indent_char: ' ',
            end_with_newline: false
          }).trim()
          return `style="${beautifiedStyle}"`
        })
      }

      if (beautyJS) {
        // Extract and beautify JS from script tags
        result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, jsContent) => {
          // Skip if it's a src script
          if (match.includes('src=')) {
            return match
          }
          const beautifiedJS = js_beautify(jsContent, {
            indent_size: 4,
            indent_char: ' ',
            preserve_newlines: true,
            max_preserve_newlines: 2,
            end_with_newline: false
          })
          return match.replace(jsContent, beautifiedJS)
        })

        // Beautify inline event handlers
        result = result.replace(/(on\w+)\s*=\s*["']([^"']*)["']/gi, (match, eventName, jsContent) => {
          try {
            const beautifiedJS = js_beautify(jsContent, {
              indent_size: 4,
              indent_char: ' ',
              preserve_newlines: false,
              end_with_newline: false
            }).trim()
            return `${eventName}="${beautifiedJS}"`
          } catch (e) {
            return match
          }
        })
      }

      setHtml(result)
      setBeautyDropdownOpen(false)
      toast.success(t('toast.formatted'))
    } catch (error) {
      toast.error(t('toast.beautifyError'))
      console.error(error)
    } finally {
      setIsBeautifying(false)
    }
  }, [html, beautyHTML, beautyCSS, beautyJS, setHtml, t])

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

  const baseButtonClass = 'px-1.5 sm:px-2.5 py-1.5 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm cursor-pointer text-xs font-medium flex items-center gap-1 sm:gap-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 hover:border-bw-gray-3 dark:hover:border-bw-gray-7 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'
  const stackedButtonClass = 'w-full justify-between gap-2'

  const renderButtonLabel = (key, label) => {
    if (isCompactToolbar) {
      return <span className="ml-auto text-xs font-medium whitespace-nowrap">{label}</span>
    }
  return (
              <motion.span 
        className="hidden md:inline whitespace-nowrap"
        initial={{ maxWidth: 0, opacity: 0 }}
        animate={{
          maxWidth: hoveredButton === key ? 200 : 0,
          opacity: hoveredButton === key ? 1 : 0,
        }}
                transition={{ duration: 0.2 }}
        style={{ overflow: 'hidden' }}
              >
        {label}
              </motion.span>
    )
  }

  const renderToolbarActions = () => (
          <motion.div 
      className={`${isCompactToolbar
        ? 'flex flex-col gap-2 w-60 p-3 bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-md shadow-lg'
        : 'flex items-center gap-1 sm:gap-1.5 border-l border-bw-gray-d dark:border-bw-gray-7 pl-1 sm:pl-2 ml-1 sm:ml-2'
      }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Nhóm Load */}
            <div className={`flex ${isCompactToolbar ? 'flex-col gap-2' : 'items-center gap-1 sm:gap-1.5'} ${isCompactToolbar ? '' : 'pr-1 sm:pr-2 border-r border-bw-gray-d dark:border-bw-gray-7'}`}>
              <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
              onClick={() => fileInputRef.current?.click()}
              title={t('input.selectFile')}
              onMouseEnter={() => setHoveredButton('upload')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Upload size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('upload', t('input.upload'))}
            </motion.button>
            <motion.button 
              className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
              onClick={handleLoadFromUrl}
              title={t('input.loadUrlTooltip')}
              onMouseEnter={() => setHoveredButton('url')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              {renderButtonLabel('url', t('input.loadUrl'))}
            </motion.button>
            {onLoadClipboard && (
              <motion.button 
          className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
                onClick={() => onLoadClipboard()}
                title={t('input.loadClipboardTooltip')}
                onMouseEnter={() => setHoveredButton('clipboard')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Clipboard size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          {renderButtonLabel('clipboard', t('input.loadClipboard'))}
              </motion.button>
            )}
            </div>

            {/* Nhóm Export */}
            <div className={`flex ${isCompactToolbar ? 'flex-col gap-2' : 'items-center gap-1 sm:gap-1.5'} ${isCompactToolbar ? '' : 'pr-1 sm:pr-2 border-r border-bw-gray-d dark:border-bw-gray-7'}`}>
            <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
              onClick={handleDownload}
              title={t('input.downloadTooltip')}
              disabled={!html}
              onMouseEnter={() => setHoveredButton('download')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={html ? { scale: 0.95 } : {}}
              transition={{ duration: 0.2 }}
            >
              <Download size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('download', t('input.download'))}
            </motion.button>
            <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''} ${copySuccess ? 'bg-bw-gray-f dark:bg-bw-gray-2' : ''}`}
              onClick={handleCopy}
              title={t('input.copyTooltip')}
              disabled={!html}
              onMouseEnter={() => setHoveredButton('copy')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={html ? { scale: 0.95 } : {}}
              animate={{
                scale: copySuccess ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Copy size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('copy', t('input.copy'))}
            </motion.button>
            </div>

            {/* Nhóm Format */}
            <div className={`flex ${isCompactToolbar ? 'flex-col gap-2' : 'items-center gap-1 sm:gap-1.5'} ${isCompactToolbar ? '' : 'pr-1 sm:pr-2 border-r border-bw-gray-d dark:border-bw-gray-7'}`}>
      <div className={`relative ${isCompactToolbar ? 'w-full' : ''}`} ref={beautyDropdownRef}>
              <motion.button 
          className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
                onClick={handleFormat}
                title={t('input.formatTooltip')}
                disabled={!html}
                onMouseEnter={() => setHoveredButton('format')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={html ? { scale: 0.95 } : {}}
                transition={{ duration: 0.2 }}
              >
                <Code size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          {renderButtonLabel('format', t('input.format'))}
              </motion.button>
              <AnimatePresence>
                {beautyDropdownOpen && (
                  <motion.div
              className={`absolute ${isCompactToolbar ? 'left-0' : 'right-0'} mt-2 bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-lg min-w-[180px] z-50`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 space-y-2">
                      <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm cursor-pointer text-sm text-bw-black dark:text-bw-white">
                        <input
                          type="checkbox"
                          checked={beautyHTML}
                          onChange={(e) => setBeautyHTML(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span>{t('input.beautyHTML')}</span>
                      </label>
                      <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm cursor-pointer text-sm text-bw-black dark:text-bw-white">
                        <input
                          type="checkbox"
                          checked={beautyCSS}
                          onChange={(e) => setBeautyCSS(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span>{t('input.beautyCSS')}</span>
                      </label>
                      <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm cursor-pointer text-sm text-bw-black dark:text-bw-white">
                        <input
                          type="checkbox"
                          checked={beautyJS}
                          onChange={(e) => setBeautyJS(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span>{t('input.beautyJS')}</span>
                      </label>
                      <div className="border-t border-bw-gray-d dark:border-bw-gray-3 pt-2">
                        <motion.button
                      className="w-full px-3 py-2 bg-bw-black text-bw-white rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleBeauty}
                      whileHover={!isBeautifying ? { backgroundColor: '#333333' } : {}}
                      whileTap={!isBeautifying ? { scale: 0.95 } : {}}
                      transition={{ duration: 0.2 }}
                      disabled={isBeautifying}
                    >
                      {isBeautifying ? t('input.formatting') : t('input.beautyButton')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>

            {/* Nhóm History */}
            <div className={`flex ${isCompactToolbar ? 'flex-col gap-2' : 'items-center gap-1 sm:gap-1.5'} ${isCompactToolbar ? '' : 'pr-1 sm:pr-2 border-r border-bw-gray-d dark:border-bw-gray-7'}`}>
      <div className={`relative flex items-center gap-2 ${isCompactToolbar ? 'w-full flex-col items-stretch' : ''}`} ref={historyDropdownRef}>
              <motion.button 
          className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
                onClick={() => setHistoryDropdownOpen((prev) => !prev)}
                title={t('input.historyTooltip')}
                disabled={!snapshots.length}
                onMouseEnter={() => setHoveredButton('history')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={snapshots.length ? { scale: 0.95 } : {}}
                transition={{ duration: 0.2 }}
              >
                <Clock size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          {renderButtonLabel('history', t('input.history'))}
              </motion.button>
              <AnimatePresence>
                {historyDropdownOpen && (
                  <motion.div
              className={`absolute ${isCompactToolbar ? 'left-0' : 'right-0'} top-full mt-2 bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-lg min-w-[440px] z-50 overflow-hidden`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VirtualizedList
                      items={snapshots}
                      emptyMessage={t('input.historyEmpty')}
                      className="bg-bw-white dark:bg-bw-gray-2"
                      maxHeight={260}
                      renderItem={(snapshot) => (
                        <div className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 transition-colors border-b border-bw-gray-d dark:border-bw-gray-3">
                          <button
                            className="flex-1 text-left min-w-0"
                            onClick={() => handleSnapshotSelect(snapshot)}
                          >
                            <p className="text-[11px] font-semibold text-bw-black dark:text-bw-white truncate">
                              {(snapshot.fileName || 'input.html') + ' - ' + formatSnapshotTime(snapshot.timestamp)}
                            </p>
                            <p className="text-[10px] text-bw-gray-7 dark:text-bw-gray-6 truncate">
                              {(snapshot.content || '').replace(/\s+/g, ' ').slice(0, 160)}
                            </p>
                          </button>
                          <button
                            className="text-bw-gray-6 hover:text-bw-black dark:text-bw-gray-5 dark:hover:text-bw-white transition-colors flex-shrink-0 ml-auto"
                            title={t('input.historyDelete')}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSnapshotDelete(snapshot.id)
                            }}
                          >
                            <XCircle size={14} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    />
                    {snapshots.length > 0 && (
                      <div className="flex items-center justify-end gap-2 px-4 py-2 bg-bw-gray-f/80 dark:bg-bw-gray-3/80 border-t border-bw-gray-d dark:border-bw-gray-3">
                        <button
                          className="text-[11px] sm:text-xs font-medium text-bw-danger-500 hover:text-bw-danger-600 dark:text-bw-danger-200 dark:hover:text-bw-danger-100 underline-offset-2 hover:underline disabled:opacity-50"
                          onClick={handleSnapshotClearAll}
                        >
                          Clear all history
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
        <span className={`text-[10px] text-bw-gray-6 dark:text-bw-gray-5 ${isCompactToolbar ? 'self-end' : 'whitespace-nowrap'}`}>
                {formatSnapshotSize(snapshotsSize)}
              </span>
            </div>
            </div>

            {/* Nhóm Clear */}
            <div className={`flex ${isCompactToolbar ? 'flex-col gap-2' : 'items-center gap-1 sm:gap-1.5'}`}>
            <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
              onClick={handleClear}
              title={t('input.clear')}
              disabled={!html}
              onMouseEnter={() => setHoveredButton('clear')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={html ? { scale: 0.95 } : {}}
              transition={{ duration: 0.2 }}
            >
              <Trash2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('clear', t('input.clear'))}
      </motion.button>
            </div>
    </motion.div>
  )

  const showLoadingOverlay = isExampleLoading || isUrlLoading || isBeautifying
  const loadingOverlayText = isBeautifying
    ? t('input.formatting')
    : isExampleLoading
      ? t('input.exampleLoading')
      : t('input.loading')
  const fullscreenButtonLabel = isFullscreen ? t('editor.exitFullscreen') : t('editor.fullscreen')
  const heightClasses = 'h-[600px] sm:h-[500px] md:h-[400px] lg:h-[500px] xl:h-[600px]'
  const baseContainerClasses = 'flex flex-col border border-bw-gray-d dark:border-bw-gray-3 rounded-sm overflow-hidden bg-bw-white dark:bg-bw-gray-2 shadow-sm transition-all'
  const fullscreenWrapperClasses = 'fixed inset-0 z-[60] p-2 sm:p-4 bg-bw-gray-1 dark:bg-bw-gray-1'
  const normalWrapperClasses = 'relative'
  const dragHighlightClasses = isDragging ? 'ring-2 ring-bw-black dark:ring-bw-white border-dashed' : ''
  const containerClass = `${isFullscreen ? fullscreenWrapperClasses : normalWrapperClasses} ${baseContainerClasses} ${isFullscreen ? 'h-auto min-h-screen' : heightClasses} ${dragHighlightClasses}`

  return (
    <motion.div 
      className={containerClass}
      variants={itemVariants}
      whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.3 }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-bw-white/90 dark:bg-bw-gray-2/90 text-center px-4">
          <Upload size={28} strokeWidth={2} className="text-bw-black dark:text-bw-white" />
          <p className="text-sm font-semibold text-bw-black dark:text-bw-white">{t('input.dragDropHint')}</p>
        </div>
      )}
      <div className="px-3 sm:px-5 py-2 sm:py-3 bg-bw-gray-f dark:bg-bw-gray-3 border-b border-bw-gray-d dark:border-bw-gray-3 text-xs sm:text-sm font-medium text-bw-black dark:text-bw-white flex justify-between items-center flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold tracking-wide">{t('input.title')}</span>
          <span className="text-[10px] sm:text-xs text-bw-gray-7 dark:text-bw-gray-6 truncate max-w-[200px] sm:max-w-[260px]" title={fileName || 'input.html'}>
            {fileName || 'input.html'}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.span 
                key="loading"
                className="text-xs text-bw-gray-7 font-light"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {t('input.loading')}
              </motion.span>
            )}
            {!isLoading && isExampleLoading && (
              <motion.span
                key="example-loading"
                className="text-xs text-bw-gray-7 font-light flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <RefreshCw size={12} className="animate-spin" />
                {t('input.exampleLoading')}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            className="px-2 py-1.5 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm cursor-pointer flex items-center gap-1 text-xs font-medium"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={fullscreenButtonLabel}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? (
              <Minimize2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5" />
            ) : (
              <Maximize2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5" />
            )}
            <span className="hidden sm:inline">{fullscreenButtonLabel}</span>
          </motion.button>
          {isCompactToolbar ? (
            <div className="relative" ref={compactMenuRef}>
              <motion.button
                className="px-2 py-1.5 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm cursor-pointer flex items-center gap-1 text-xs font-medium"
                onClick={() => setIsCompactMenuOpen((prev) => !prev)}
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontal size={16} />
                <span>{t('common.more')}</span>
            </motion.button>
              <AnimatePresence>
                {isCompactMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 z-50"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderToolbarActions()}
          </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            renderToolbarActions()
          )}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-bw-gray-1 dark:bg-bw-gray-1">
        <LazyMonacoEditor
          shouldLoad={true}
          height="100%"
          language="html"
          value={html}
          onChange={handleEditorChange}
          theme={darkMode ? 'vs-dark' : 'vs-light'}
          onMount={handleEditorMount}
          options={editorOptions}
        />
        {showLoadingOverlay && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bw-white/85 dark:bg-bw-gray-2/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RefreshCw size={28} className="animate-spin text-bw-black dark:text-bw-white" />
            <span className="text-xs sm:text-sm font-medium text-bw-black dark:text-bw-white">
              {loadingOverlayText}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* URL Input Overlay */}
      <AnimatePresence>
        {isUrlOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-md shadow-xl p-4 sm:p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-bw-black dark:text-bw-white">
                  {t('input.loadUrl')}
                </h3>
                <button
                  onClick={() => {
                    setIsUrlOverlayOpen(false)
                    setUrlInput('')
                  }}
                  className="text-bw-gray-6 hover:text-bw-black dark:text-bw-gray-5 dark:hover:text-bw-white transition-colors"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-bw-black dark:text-bw-white mb-2">
                    {t('input.loadUrlPrompt')}
                  </label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleUrlSubmit()
                      }
                    }}
                    placeholder={t('input.urlPlaceholder')}
                    className="w-full px-3 py-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white text-sm focus:outline-none focus:ring-2 focus:ring-bw-black dark:focus:ring-bw-white"
                    autoFocus
                  />
                </div>
                
                <div className="text-xs text-bw-gray-6 dark:text-bw-gray-5 space-y-1">
                  <p>• {t('input.urlFileHint')}</p>
                  <p>• {t('input.urlWebsiteHint')}</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <motion.button
                    onClick={handleUrlSubmit}
                    disabled={isUrlLoading || !urlInput.trim()}
                    className="flex-1 px-4 py-2 bg-bw-black text-bw-white rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={!isUrlLoading && urlInput.trim() ? { backgroundColor: '#333333' } : {}}
                    whileTap={!isUrlLoading && urlInput.trim() ? { scale: 0.95 } : {}}
                  >
                      {isUrlLoading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>{t('input.loading')}</span>
                        </>
                      ) : (
                        <>
                          <Link2 size={16} strokeWidth={2} />
                          <span>{t('input.load')}</span>
                        </>
                      )}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsUrlOverlayOpen(false)
                      setUrlInput('')
                    }}
                    disabled={isUrlLoading}
                    className="px-4 py-2 bg-bw-gray-f dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isUrlLoading ? { backgroundColor: '#f5f5f5' } : {}}
                    whileTap={!isUrlLoading ? { scale: 0.95 } : {}}
                  >
                    {t('common.cancel')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


