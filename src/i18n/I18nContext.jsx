import { createContext, useContext, useState, useEffect } from 'react'
import { translations, availableLanguages } from './translations'

const I18nContext = createContext()

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    // Check if saved language is available
    const isValidLang = availableLanguages.some(lang => lang.code === saved)
    if (isValidLang) {
      return saved
    }
    // Default to 'en' if available, otherwise use first available language
    const enLang = availableLanguages.find(lang => lang.code === 'en')
    return enLang ? 'en' : (availableLanguages[0]?.code || 'en')
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || key
    
    // Replace params in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param])
    })
    
    return translation
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  )
}

