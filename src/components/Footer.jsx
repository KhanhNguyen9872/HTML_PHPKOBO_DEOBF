import { motion } from 'framer-motion'
import { GitHub, Heart, Code, FileText, Book, ExternalLink, AlertCircle, PlusCircle, Tag, Shield } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'

export default function Footer() {
  const { t } = useI18n()

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      className="bg-bw-black text-bw-white border-t border-bw-gray-3"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-bw-white">
              {t('footer.about.title')}
            </h3>
            <p className="text-xs sm:text-sm text-bw-gray-6 mb-4 leading-relaxed">
              {t('footer.about.description')}
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6">
              <span>{t('footer.madeWith')}</span>
              <motion.span
                className="text-bw-danger-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart size={14} fill="currentColor" strokeWidth={2.5} />
              </motion.span>
              <span>{t('footer.by')}</span>
              <motion.a
                href="https://github.com/KhanhNguyen9872"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bw-white hover:text-bw-gray-6 transition-colors font-medium flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GitHub size={14} strokeWidth={2} />
                <span>KhanhNguyen9872</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-bw-white">
              {t('footer.links.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="https://github.com/KhanhNguyen9872/HTML_PHPKOBO_DEOBF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <Code size={14} strokeWidth={2} />
                  <span>{t('footer.links.sourceCode')}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="https://github.com/KhanhNguyen9872"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <GitHub size={14} strokeWidth={2} />
                  <span>{t('footer.links.github')}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <FileText size={14} strokeWidth={2} />
                  <span>{t('footer.links.documentation')}</span>
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-bw-white">
              {t('footer.resources.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="https://github.com/KhanhNguyen9872/HTML_PHPKOBO_DEOBF/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <AlertCircle size={14} strokeWidth={2} />
                  <span>{t('footer.resources.reportBug')}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="https://github.com/KhanhNguyen9872/HTML_PHPKOBO_DEOBF/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <PlusCircle size={14} strokeWidth={2} />
                  <span>{t('footer.resources.requestFeature')}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="https://github.com/KhanhNguyen9872/HTML_PHPKOBO_DEOBF/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6 hover:text-bw-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <Book size={14} strokeWidth={2} />
                  <span>{t('footer.resources.readme')}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-bw-white">
              {t('footer.contact.title')}
            </h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6">
                <Tag size={14} strokeWidth={2} />
                <span>{t('footer.contact.version')}: </span>
                <span className="text-bw-white font-medium">{t('footer.version')}</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6">
                <Shield size={14} strokeWidth={2} />
                <span>{t('footer.contact.license')}</span>
              </li>
            </ul>
            <motion.a
              href="https://github.com/KhanhNguyen9872"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-bw-gray-3 hover:bg-bw-gray-2 rounded-sm text-xs sm:text-sm text-bw-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GitHub size={16} strokeWidth={2} />
              <span>KhanhNguyen9872</span>
            </motion.a>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-bw-gray-3 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-bw-gray-6">
            <span>© {currentYear}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{t('footer.copyright')}</span>
          </div>
          <div className="text-xs sm:text-sm text-bw-gray-6">
            <span>{t('footer.allRightsReserved')}</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
