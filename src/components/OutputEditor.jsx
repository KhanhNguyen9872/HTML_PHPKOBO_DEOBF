import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Editor from '@monaco-editor/react'
import { Download, Copy, Trash2, Code, Loader, MoreHorizontal } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'
import { html_beautify, css_beautify, js_beautify } from 'js-beautify'

export default function OutputEditor({ outputHtml, setOutputHtml, fileName, outputEditorRef, darkMode, isProcessing }) {
  const { t } = useI18n()
  const [outputCopySuccess, setOutputCopySuccess] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(null)
  const [beautyDropdownOpen, setBeautyDropdownOpen] = useState(false)
  const [isCompactToolbar, setIsCompactToolbar] = useState(false)
  const [isCompactMenuOpen, setIsCompactMenuOpen] = useState(false)
  const [beautyHTML, setBeautyHTML] = useState(true)
  const [beautyCSS, setBeautyCSS] = useState(false)
  const [beautyJS, setBeautyJS] = useState(false)
  const beautyDropdownRef = useRef(null)
  const compactMenuRef = useRef(null)

  const handleOutputDownload = useCallback(() => {
    const blob = new Blob([outputHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const baseName = fileName
      ? fileName.replace(/\.[^/.]+$/, '')
      : 'output'
    a.download = `${baseName}_deobf.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('toast.downloaded', { name: `${baseName}_deobf.html` }))
  }, [outputHtml, fileName, t])

  const handleOutputCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputHtml)
      setOutputCopySuccess(true)
      toast.success(t('toast.copied'))
      setTimeout(() => setOutputCopySuccess(false), 2000)
    } catch (err) {
      toast.error(t('toast.copyError'))
    }
  }, [outputHtml, t])

  const handleOutputClear = () => {
    toast(t('toast.clearOutputConfirm'), {
      action: {
        label: t('toast.clear'),
        onClick: () => {
          setOutputHtml('')
          toast.success(t('toast.clearOutput'))
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
      if (compactMenuRef.current && !compactMenuRef.current.contains(event.target)) {
        setIsCompactMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const handleFormat = useCallback(() => {
    setBeautyDropdownOpen((prev) => !prev)
  }, [])

  const handleBeauty = useCallback(() => {
    if (!outputHtml || outputHtml.trim() === '') {
      toast.error(t('toast.processError'))
      return
    }

    try {
      let result = outputHtml

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
        result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
          const beautifiedCSS = css_beautify(cssContent, {
            indent_size: 4,
            indent_char: ' ',
            end_with_newline: false
          })
          return match.replace(cssContent, beautifiedCSS)
        })

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
        result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, jsContent) => {
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

      setOutputHtml(result)
      setBeautyDropdownOpen(false)
      toast.success(t('toast.formatted'))
    } catch (error) {
      toast.error('Lỗi khi beautify code')
      console.error(error)
    }
  }, [outputHtml, beautyHTML, beautyCSS, beautyJS, setOutputHtml, t])

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

  const actionDisabled = !outputHtml || isProcessing

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
        ? 'flex flex-col gap-2 w-52 p-3 bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-md shadow-lg'
        : 'flex items-center gap-1 sm:gap-1.5'
      }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''} ${outputCopySuccess ? 'bg-bw-gray-f dark:bg-bw-gray-2' : ''}`}
            onClick={handleOutputDownload}
            title={t('output.downloadTooltip')}
            disabled={actionDisabled}
            onMouseEnter={() => setHoveredButton('download')}
            onMouseLeave={() => setHoveredButton(null)}
            whileTap={outputHtml ? { scale: 0.95 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Download size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('download', t('output.download'))}
          </motion.button>
          <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''} ${outputCopySuccess ? 'bg-bw-gray-f dark:bg-bw-gray-2' : ''}`}
            onClick={handleOutputCopy}
            title={t('output.copyTooltip')}
            disabled={actionDisabled}
            onMouseEnter={() => setHoveredButton('copy')}
            onMouseLeave={() => setHoveredButton(null)}
            whileTap={outputHtml ? { scale: 0.95 } : {}}
            animate={{
              scale: outputCopySuccess ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Copy size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('copy', t('output.copy'))}
          </motion.button>
      <div className={`relative ${isCompactToolbar ? 'w-full' : ''}`} ref={beautyDropdownRef}>
            <motion.button 
          className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
              onClick={handleFormat}
              title={t('output.formatTooltip')}
              disabled={actionDisabled}
              onMouseEnter={() => setHoveredButton('format')}
              onMouseLeave={() => setHoveredButton(null)}
              whileTap={outputHtml ? { scale: 0.95 } : {}}
              transition={{ duration: 0.2 }}
            >
              <Code size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          {renderButtonLabel('format', t('output.format'))}
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
                      {t('output.beautyHTML')}
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm cursor-pointer text-sm text-bw-black dark:text-bw-white">
                      <input
                        type="checkbox"
                        checked={beautyCSS}
                        onChange={(e) => setBeautyCSS(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      {t('output.beautyCSS')}
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm cursor-pointer text-sm text-bw-black dark:text-bw-white">
                      <input
                        type="checkbox"
                        checked={beautyJS}
                        onChange={(e) => setBeautyJS(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      {t('output.beautyJS')}
                    </label>
                    <motion.button
                      className="w-full px-3 py-1.5 bg-bw-black text-bw-white rounded-sm text-sm font-medium hover:bg-bw-gray-7"
                      onClick={handleBeauty}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t('output.beautyButton')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button 
        className={`${baseButtonClass} ${isCompactToolbar ? stackedButtonClass : ''}`}
            onClick={handleOutputClear}
            title={t('output.clear')}
            disabled={actionDisabled}
            onMouseEnter={() => setHoveredButton('clear')}
            onMouseLeave={() => setHoveredButton(null)}
            whileTap={outputHtml ? { scale: 0.95 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Trash2 size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        {renderButtonLabel('clear', t('output.clear'))}
      </motion.button>
    </motion.div>
  )

  return (
    <motion.div 
      className="flex flex-col border border-bw-gray-d dark:border-bw-gray-3 rounded-sm overflow-hidden h-[600px] sm:h-[500px] md:h-[400px] lg:h-[500px] xl:h-[600px] bg-bw-white dark:bg-bw-gray-2 shadow-sm"
      variants={itemVariants}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="px-3 sm:px-5 py-2 sm:py-3 bg-bw-gray-f dark:bg-bw-gray-3 border-b border-bw-gray-d dark:border-bw-gray-3 text-xs sm:text-sm font-medium text-bw-black dark:text-bw-white flex justify-between items-center flex-wrap gap-2">
        <span className="font-bold tracking-wide">{t('output.title')}</span>
        {isCompactToolbar ? (
          <div className="relative" ref={compactMenuRef}>
            <motion.button
              className="px-2 py-1.5 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm cursor-pointer flex items-center gap-1 text-xs font-medium"
              onClick={() => setIsCompactMenuOpen((prev) => !prev)}
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal size={16} />
              <span>{t('common.more') || 'More'}</span>
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
      <div className="relative flex-1 overflow-hidden bg-bw-gray-1 dark:bg-bw-gray-1">
        <Editor
          height="100%"
          language="html"
          value={outputHtml}
          onChange={(value) => setOutputHtml(value || '')}
          theme={darkMode ? 'vs-dark' : 'vs-light'}
          onMount={(editor) => {
            outputEditorRef.current = editor
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            readOnly: isProcessing,
          }}
        />
        {isProcessing && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bw-white/85 dark:bg-bw-gray-2/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader size={28} className="animate-spin text-bw-black dark:text-bw-white" />
            <span className="text-xs sm:text-sm font-medium text-bw-black dark:text-bw-white">Đang xử lý...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}


