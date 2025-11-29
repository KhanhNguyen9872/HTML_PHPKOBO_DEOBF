import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Monitor, Settings } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'
import HTMLExecutor from './HTMLExecutor'

export default function Preview({ 
  html, 
  reloadKey,
  viewMode, 
  setViewMode, 
  customWidth, 
  setCustomWidth, 
  customHeight, 
  setCustomHeight, 
  onLoad,
  showPreview,
  darkMode,
  blockNetwork,
  setBlockNetwork
}) {
  const { t } = useI18n()
  const [hoveredButton, setHoveredButton] = useState(null)

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
    <AnimatePresence>
      {showPreview && (
        <motion.div 
          className={`flex flex-col border border-bw-gray-d dark:border-bw-gray-3 rounded-sm bg-bw-white dark:bg-bw-gray-2 shadow-sm ${
            viewMode === 'desktop' 
              ? 'flex-1 min-h-0' 
              : 'flex-1 min-h-[300px] sm:min-h-[400px] md:min-h-[520px] overflow-hidden'
          }`}
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1
          }}
          exit={{ opacity: 0 }}
          whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          style={viewMode === 'desktop' ? { 
            display: 'flex', 
            flexDirection: 'column',
            flex: '1 1 0%',
            minHeight: 0,
            height: '100%'
          } : {}}
        >
          <div className="px-3 sm:px-5 py-2 sm:py-3 bg-bw-gray-f dark:bg-bw-gray-3 border-b border-bw-gray-d dark:border-bw-gray-3 text-xs sm:text-sm font-medium text-bw-black dark:text-bw-gray-d flex flex-col gap-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="font-bold tracking-wide">{t('preview.title')}</span>
              <motion.div 
                className="flex gap-1 sm:gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
              <motion.button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm cursor-pointer text-xs font-medium border flex items-center gap-1 sm:gap-1.5 overflow-hidden transition-colors ${
                  viewMode === 'desktop' 
                    ? 'bg-bw-black dark:bg-bw-gray-1 text-bw-white dark:text-bw-white border-bw-black dark:border-bw-gray-d' 
                    : 'bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-gray-d border-bw-gray-d dark:border-bw-gray-3 hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 hover:border-bw-gray-3 dark:hover:border-bw-gray-d dark:hover:text-bw-white'
                }`}
                onClick={() => setViewMode('desktop')}
                title={t('preview.desktopTooltip')}
                onMouseEnter={() => setHoveredButton('desktop')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Monitor size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden">{t('preview.desktop')}</span>
                <motion.span
                  className="hidden md:block whitespace-nowrap"
                  initial={{ maxWidth: 0, opacity: 0 }}
                  animate={{
                    maxWidth: hoveredButton === 'desktop' ? 200 : 0,
                    opacity: hoveredButton === 'desktop' ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {t('preview.desktop')}
                </motion.span>
              </motion.button>
              <motion.button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm cursor-pointer text-xs font-medium border flex items-center gap-1 sm:gap-1.5 overflow-hidden transition-colors ${
                  viewMode === 'tablet' 
                    ? 'bg-bw-black dark:bg-bw-gray-1 text-bw-white dark:text-bw-white border-bw-black dark:border-bw-gray-d' 
                    : 'bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-gray-d border-bw-gray-d dark:border-bw-gray-3 hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 hover:border-bw-gray-3 dark:hover:border-bw-gray-d dark:hover:text-bw-white'
                }`}
                onClick={() => setViewMode('tablet')}
                title={t('preview.tabletTooltip')}
                onMouseEnter={() => setHoveredButton('tablet')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Monitor size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0 rotate-90" />
                <span className="hidden sm:inline md:hidden">{t('preview.tablet')}</span>
                <motion.span
                  className="hidden md:block whitespace-nowrap"
                  initial={{ maxWidth: 0, opacity: 0 }}
                  animate={{
                    maxWidth: hoveredButton === 'tablet' ? 200 : 0,
                    opacity: hoveredButton === 'tablet' ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {t('preview.tablet')}
                </motion.span>
              </motion.button>
              <motion.button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm cursor-pointer text-xs font-medium border flex items-center gap-1 sm:gap-1.5 overflow-hidden transition-colors ${
                  viewMode === 'mobile' 
                    ? 'bg-bw-black dark:bg-bw-gray-1 text-bw-white dark:text-bw-white border-bw-black dark:border-bw-gray-d' 
                    : 'bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-gray-d border-bw-gray-d dark:border-bw-gray-3 hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 hover:border-bw-gray-3 dark:hover:border-bw-gray-d dark:hover:text-bw-white'
                }`}
                onClick={() => setViewMode('mobile')}
                title={t('preview.mobileTooltip')}
                onMouseEnter={() => setHoveredButton('mobile')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Smartphone size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden">{t('preview.mobile')}</span>
                <motion.span
                  className="hidden md:block whitespace-nowrap"
                  initial={{ maxWidth: 0, opacity: 0 }}
                  animate={{
                    maxWidth: hoveredButton === 'mobile' ? 200 : 0,
                    opacity: hoveredButton === 'mobile' ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {t('preview.mobile')}
                </motion.span>
              </motion.button>
              <motion.button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm cursor-pointer text-xs font-medium border flex items-center gap-1 sm:gap-1.5 overflow-hidden transition-colors ${
                  viewMode === 'custom' 
                    ? 'bg-bw-black dark:bg-bw-gray-1 text-bw-white dark:text-bw-white border-bw-black dark:border-bw-gray-d' 
                    : 'bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-gray-d border-bw-gray-d dark:border-bw-gray-3 hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 hover:border-bw-gray-3 dark:hover:border-bw-gray-d dark:hover:text-bw-white'
                }`}
                onClick={() => setViewMode('custom')}
                title={t('preview.customTooltip')}
                onMouseEnter={() => setHoveredButton('custom')}
                onMouseLeave={() => setHoveredButton(null)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Settings size={12} strokeWidth={2} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden">{t('preview.custom')}</span>
                <motion.span
                  className="hidden md:block whitespace-nowrap"
                  initial={{ maxWidth: 0, opacity: 0 }}
                  animate={{
                    maxWidth: hoveredButton === 'custom' ? 200 : 0,
                    opacity: hoveredButton === 'custom' ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {t('preview.custom')}
                </motion.span>
              </motion.button>
              </motion.div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] sm:text-xs text-bw-gray-8 dark:text-bw-gray-d">
              <label className="inline-flex items-center gap-2 font-medium text-bw-black dark:text-bw-gray-d">
                <input
                  type="checkbox"
                  checked={blockNetwork}
                  onChange={(e) => setBlockNetwork(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                {t('preview.networkToggle')}
              </label>
              <span className={`text-[10px] sm:text-xs font-semibold ${blockNetwork ? 'text-bw-black dark:text-bw-warning-200' : 'text-bw-black dark:text-bw-danger-200'}`}>
                {blockNetwork ? t('preview.networkWarningOn') : t('preview.networkWarningOff')}
              </span>
            </div>
          </div>
          <AnimatePresence>
            {viewMode === 'custom' && (
              <motion.div 
                className="px-3 sm:px-5 py-2 sm:py-3 bg-bw-gray-f dark:bg-bw-gray-3 border-b border-bw-gray-d dark:border-bw-gray-3 flex flex-wrap gap-3 sm:gap-5 items-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
              >
                <label className="flex items-center gap-2 text-xs text-bw-black dark:text-bw-gray-d font-light">
                  {t('preview.width')}: 
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => {
                      const parsed = Number(e.target.value)
                      if (Number.isNaN(parsed)) return
                      setCustomWidth(Math.min(3000, Math.max(200, parsed)))
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setCustomWidth((prev) => Math.min(3000, Math.max(200, prev || 1200)))
                      }
                    }}
                    min="200"
                    max="3000"
                    className="w-16 sm:w-20 px-2 py-1 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-xs bg-bw-white dark:bg-bw-gray-2 text-bw-black dark:text-bw-white focus:outline-none focus:border-bw-gray-3"
                  />
                  px
                </label>
                <label className="flex items-center gap-2 text-xs text-bw-black dark:text-bw-gray-d font-light">
                  {t('preview.height')}: 
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => {
                      const parsed = Number(e.target.value)
                      if (Number.isNaN(parsed)) return
                      setCustomHeight(Math.min(3000, Math.max(200, parsed)))
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setCustomHeight((prev) => Math.min(3000, Math.max(200, prev || 800)))
                      }
                    }}
                    min="200"
                    max="3000"
                    className="w-16 sm:w-20 px-2 py-1 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-xs bg-bw-white dark:bg-bw-gray-2 text-bw-black dark:text-bw-white focus:outline-none focus:border-bw-gray-3"
                  />
                  px
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          <HTMLExecutor
            html={html} 
            reloadKey={reloadKey}
            viewMode={viewMode}
            customWidth={customWidth}
            customHeight={customHeight}
            onWidthChange={setCustomWidth}
            onHeightChange={setCustomHeight}
            onLoad={onLoad}
            shouldLoad={showPreview}
            darkMode={darkMode}
            blockNetwork={blockNetwork}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

