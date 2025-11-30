import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Globe, ChevronDown, GitHub, AlertTriangle, Layout, Edit2 } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'

export default function Header({ darkMode, toggleDarkMode, onShowErrorTest, onLanguageChange, layoutMode, onLayoutChange, onEditCustomLayout }) {
  const { language, t, changeLanguage, availableLanguages } = useI18n()
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false)
  const languageDropdownRef = useRef(null)
  const layoutDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false)
      }
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(event.target)) {
        setLayoutDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <motion.header 
      className="bg-bw-black text-bw-white py-4 sm:py-6 px-4 sm:px-8 border-b border-bw-gray-3 flex justify-between items-center flex-wrap gap-2"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button 
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-sm border border-bw-gray-3 bg-bw-white shadow-sm p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          onClick={() => window.location.reload()}
          aria-label="KhanhNguyen9872"
        >
          <img
            src="/assets/logo.png"
            alt="KhanhNguyen9872"
            className="w-full h-full object-contain"
            loading="eager"
            fetchpriority="high"
          />
        </motion.button>
        <motion.h1 
          className="text-lg sm:text-2xl font-black tracking-tight m-0 hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {t('header.title')}
        </motion.h1>
        <span className="sr-only">{t('header.title')}</span>
      </motion.div>
      <motion.div 
        className="flex items-center gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {onShowErrorTest && (
          <motion.button
            onClick={onShowErrorTest}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-sm hover:bg-bw-gray-3 transition-colors text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Test Throw Error"
          >
            <AlertTriangle size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Test Error</span>
          </motion.button>
        )}
        {onLayoutChange && (
          <div className="relative hidden lg:block" ref={layoutDropdownRef}>
            <motion.button
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-sm hover:bg-bw-gray-3 transition-colors"
              onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
              title={t('header.layout')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: onShowErrorTest ? 0.4 : 0.35 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            >
              <Layout size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium uppercase hidden sm:inline">{t(`header.layout.${layoutMode}`)}</span>
              <ChevronDown 
                size={14} 
                strokeWidth={2}
                className={`transition-transform sm:w-4 sm:h-4 ${layoutDropdownOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
            <AnimatePresence>
              {layoutDropdownOpen && (
                <motion.div
                  className="absolute right-0 mt-2 bg-bw-white border border-bw-gray-d rounded-sm shadow-lg min-w-[160px] z-[100]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {['default', 'horizontal', 'vertical-split', 'grid', 'custom'].map((layout, index) => (
                    <div
                      key={layout}
                      className={`w-full flex items-center justify-between ${
                        index > 0 ? 'border-t border-bw-gray-d' : ''
                      }`}
                    >
                      <motion.button
                        className="flex-1 px-4 py-2 text-left text-sm text-bw-black hover:bg-bw-gray-f flex items-center justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => {
                          onLayoutChange(layout)
                          setLayoutDropdownOpen(false)
                        }}
                      >
                        <span>{t(`header.layout.${layout}`)}</span>
                        {layoutMode === layout && <span className="text-xs">✓</span>}
                      </motion.button>
                      {layout === 'custom' && onEditCustomLayout && (
                        <motion.button
                          className="px-3 py-2 text-bw-black hover:bg-bw-gray-f flex items-center justify-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 + 0.05 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditCustomLayout()
                            setLayoutDropdownOpen(false)
                          }}
                          title={t('header.layout.customEditor.edit')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit2 size={14} strokeWidth={2} />
                        </motion.button>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="relative" ref={languageDropdownRef}>
          <motion.button
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-sm hover:bg-bw-gray-3 transition-colors"
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            title={t('header.language')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: onShowErrorTest ? 0.42 : 0.37 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium uppercase hidden sm:inline">{language}</span>
            <ChevronDown 
              size={14} 
              strokeWidth={2}
              className={`transition-transform sm:w-4 sm:h-4 ${languageDropdownOpen ? 'rotate-180' : ''}`}
            />
          </motion.button>
          <AnimatePresence>
            {languageDropdownOpen && (
              <motion.div
                  className="absolute right-0 mt-2 bg-bw-white border border-bw-gray-d rounded-sm shadow-lg min-w-[120px] z-[100]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {availableLanguages.map((lang, index) => (
                  <motion.button
                    key={lang.code}
                    className={`w-full px-4 py-2 text-left text-sm text-bw-black hover:bg-bw-gray-f flex items-center justify-between ${
                      index > 0 ? 'border-t border-bw-gray-d' : ''
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => {
                      if (onLanguageChange) {
                        onLanguageChange(lang.code)
                      } else {
                      changeLanguage(lang.code)
                      }
                      setLanguageDropdownOpen(false)
                    }}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="text-xs">✓</span>}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          className="p-2 rounded-sm hover:bg-bw-gray-3 transition-colors"
          onClick={toggleDarkMode}
          title={darkMode ? t('header.lightMode') : t('header.darkMode')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: onShowErrorTest ? 0.45 : 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {darkMode ? <Moon size={18} strokeWidth={2} className="sm:w-5 sm:h-5" /> : <Sun size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />}
        </motion.button>
      </motion.div>
    </motion.header>
  )
}

