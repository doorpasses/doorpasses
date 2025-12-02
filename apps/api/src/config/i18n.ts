import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as middleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    // Debug mode (disabled in production)
    debug: process.env.NODE_ENV === 'development',

    // Fallback language
    fallbackLng: 'en',

    // Supported languages
    supportedLngs: ['en', 'ar'],

    // Namespace
    ns: ['translation'],
    defaultNS: 'translation',

    // Backend configuration
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },

    // Detection options
    detection: {
      // Order of detection methods
      order: ['header', 'querystring', 'cookie'],

      // Keys to lookup language from
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupHeader: 'accept-language',

      // Cache language
      caches: ['cookie'],

      // Ignore cache for certain languages
      ignoreCase: true,
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // Not needed for non-HTML contexts
    },

    // Preload languages
    preload: ['en', 'ar'],
  });

export default i18next;
export const i18nextMiddleware = middleware.handle(i18next);
