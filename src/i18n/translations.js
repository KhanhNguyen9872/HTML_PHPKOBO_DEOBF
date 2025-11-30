// Auto-import all language files (exclude index.js)
const langModules = import.meta.glob('./lang/*.js', { eager: true })

const translations = {}
const availableLanguages = []

// Extract language code from filename and build translations object
Object.keys(langModules).forEach((path) => {
  const langCode = path.replace('./lang/', '').replace('.js', '')
  // Skip index.js file
  if (langCode === 'index') return
  
  const langData = langModules[path].default
  
  if (langData) {
    translations[langCode] = langData
    availableLanguages.push({
      code: langCode,
      name: getLanguageName(langCode)
    })
  }
})

// Helper function to get language display name
function getLanguageName(code) {
  const names = {
    // European languages
    'en': 'English',
    'vi': 'Tiếng Việt',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'it': 'Italiano',
    'pt': 'Português',
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português (Portugal)',
    'ru': 'Русский',
    'pl': 'Polski',
    'nl': 'Nederlands',
    'tr': 'Türkçe',
    'el': 'Ελληνικά',
    'cs': 'Čeština',
    'sv': 'Svenska',
    'no': 'Norsk',
    'da': 'Dansk',
    'fi': 'Suomi',
    'hu': 'Magyar',
    'ro': 'Română',
    'bg': 'Български',
    'hr': 'Hrvatski',
    'sk': 'Slovenčina',
    'sl': 'Slovenščina',
    'uk': 'Українська',
    'sr': 'Српски',
    'ca': 'Català',
    'eu': 'Euskara',
    'ga': 'Gaeilge',
    'mt': 'Malti',
    'lv': 'Latviešu',
    'lt': 'Lietuvių',
    'et': 'Eesti',
    'is': 'Íslenska',
    'mk': 'Македонски',
    'sq': 'Shqip',
    'be': 'Беларуская',
    'hy': 'Հայերեն',
    'ka': 'ქართული',
    'az': 'Azərbaycan',
    'kk': 'Қазақ',
    'uz': 'Oʻzbek',
    'ky': 'Кыргызча',
    'mn': 'Монгол',
    
    // Asian languages
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'zh-CN': '中文 (简体)',
    'zh-TW': '中文 (繁體)',
    'zh-HK': '中文 (香港)',
    'th': 'ไทย',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'tl': 'Filipino',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'pa': 'ਪੰਜਾਬੀ',
    'ur': 'اردو',
    'ne': 'नेपाली',
    'si': 'සිංහල',
    'my': 'မြန်မာ',
    'km': 'ខ្មែរ',
    'lo': 'ລາວ',
    'am': 'አማርኛ',
    'sw': 'Kiswahili',
    
    // Middle Eastern languages
    'ar': 'العربية',
    'fa': 'فارسی',
    'he': 'עברית',
    'yi': 'ייִדיש',
    'ku': 'Kurdî',
    
    // African languages
    'af': 'Afrikaans',
    'zu': 'isiZulu',
    'xh': 'isiXhosa',
    'yo': 'Yorùbá',
    'ig': 'Igbo',
    'ha': 'Hausa',
    'sn': 'chiShona',
    'st': 'Sesotho',
    'tn': 'Setswana',
    've': 'Tshivenḓa',
    'ts': 'Xitsonga',
    'ss': 'siSwati',
    'nr': 'isiNdebele',
    'nso': 'Sesotho sa Leboa',
  }
  return names[code] || code.toUpperCase()
}

export { translations, availableLanguages }

