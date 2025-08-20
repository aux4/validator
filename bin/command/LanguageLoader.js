// Cache for loaded language messages
const langMessagesCache = new Map();

// Language mapping for dynamic imports
const langMapping = {
  'ar': () => import("validatorjs/src/lang/ar.js"),
  'az': () => import("validatorjs/src/lang/az.js"),
  'be': () => import("validatorjs/src/lang/be.js"),
  'bg': () => import("validatorjs/src/lang/bg.js"),
  'bs': () => import("validatorjs/src/lang/bs.js"),
  'ca': () => import("validatorjs/src/lang/ca.js"),
  'cs': () => import("validatorjs/src/lang/cs.js"),
  'cy': () => import("validatorjs/src/lang/cy.js"),
  'da': () => import("validatorjs/src/lang/da.js"),
  'de': () => import("validatorjs/src/lang/de.js"),
  'el': () => import("validatorjs/src/lang/el.js"),
  'en': () => import("validatorjs/src/lang/en.js"),
  'es': () => import("validatorjs/src/lang/es.js"),
  'et': () => import("validatorjs/src/lang/et.js"),
  'eu': () => import("validatorjs/src/lang/eu.js"),
  'fa': () => import("validatorjs/src/lang/fa.js"),
  'fi': () => import("validatorjs/src/lang/fi.js"),
  'fr': () => import("validatorjs/src/lang/fr.js"),
  'hr': () => import("validatorjs/src/lang/hr.js"),
  'hu': () => import("validatorjs/src/lang/hu.js"),
  'id': () => import("validatorjs/src/lang/id.js"),
  'it': () => import("validatorjs/src/lang/it.js"),
  'ja': () => import("validatorjs/src/lang/ja.js"),
  'ka': () => import("validatorjs/src/lang/ka.js"),
  'ko': () => import("validatorjs/src/lang/ko.js"),
  'lt': () => import("validatorjs/src/lang/lt.js"),
  'lv': () => import("validatorjs/src/lang/lv.js"),
  'mk': () => import("validatorjs/src/lang/mk.js"),
  'mn': () => import("validatorjs/src/lang/mn.js"),
  'ms': () => import("validatorjs/src/lang/ms.js"),
  'nb_NO': () => import("validatorjs/src/lang/nb_NO.js"),
  'nl': () => import("validatorjs/src/lang/nl.js"),
  'pl': () => import("validatorjs/src/lang/pl.js"),
  'pt': () => import("validatorjs/src/lang/pt.js"),
  'pt_BR': () => import("validatorjs/src/lang/pt_BR.js"),
  'ro': () => import("validatorjs/src/lang/ro.js"),
  'ru': () => import("validatorjs/src/lang/ru.js"),
  'se': () => import("validatorjs/src/lang/se.js"),
  'sl': () => import("validatorjs/src/lang/sl.js"),
  'sq': () => import("validatorjs/src/lang/sq.js"),
  'sr': () => import("validatorjs/src/lang/sr.js"),
  'sv': () => import("validatorjs/src/lang/sv.js"),
  'tr': () => import("validatorjs/src/lang/tr.js"),
  'ua': () => import("validatorjs/src/lang/ua.js"),
  'uk': () => import("validatorjs/src/lang/uk.js"),
  'vi': () => import("validatorjs/src/lang/vi.js"),
  'zh': () => import("validatorjs/src/lang/zh.js"),
  'zh_TW': () => import("validatorjs/src/lang/zh_TW.js")
};

/**
 * Get language messages for a specific language (async with caching)
 * @param {string} lang - Language code (e.g., 'en', 'es', 'fr')
 * @returns {Promise<Object|null>} Language messages object or null if not found
 */
export async function getLanguageMessages(lang) {
  // Check cache first
  if (langMessagesCache.has(lang)) {
    return langMessagesCache.get(lang);
  }

  // Check if language is supported
  if (!langMapping[lang]) {
    return null;
  }

  try {
    // Dynamically import only the needed language
    const module = await langMapping[lang]();
    const messages = module.default || module;
    
    // Cache the result
    langMessagesCache.set(lang, messages);
    return messages;
  } catch (error) {
    console.warn(`Failed to load language '${lang}':`, error.message);
    return null;
  }
}

/**
 * Get all available language codes
 * @returns {string[]} Array of available language codes
 */
export function getAvailableLanguages() {
  return Object.keys(langMapping);
}

/**
 * Check if a language is supported
 * @param {string} lang - Language code to check
 * @returns {boolean} True if language is supported
 */
export function isLanguageSupported(lang) {
  return lang in langMapping;
}