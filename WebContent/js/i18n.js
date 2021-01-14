// module 'i18n.js'
'use strict';

const TRANSLATIONS = {};

const language = () => {
  return navigator.language.split('-')[0];
};

const setTranslations = (language, data) => {
  try {
    Object.keys(data).forEach(key => TRANSLATIONS[key] = data[key].message);
  } catch (error) {
    console.log(error);
  }
  TRANSLATIONS[language] = 'loaded';
};

const loadTranslations = async (siteRoot, language) => {
  if (TRANSLATIONS[language] !== 'loaded') {
    let translations = siteRoot + '_locales/' + language + '/messages.json';

    await fetch(translations)
      .then(response => response.json())
      .then(json => setTranslations(language, json))
      .catch(async () => { if (language !== 'de') { loadTranslations('de'); }
    });
  }
};

const getMessage = (messageKey, substitutions) => {
  if (/^\s*$/.test(messageKey)) return messageKey;

  try {
    const key = messageKey.toUpperCase();
    if (!TRANSLATIONS[key]) {
      console.log("No translation : '" + messageKey + '"\n' + new Error().stack);
    }
    let message = TRANSLATIONS[key] ? TRANSLATIONS[key] : messageKey;
    if (substitutions) {
      Object.keys(substitutions).forEach(substitute => {
        let token = new RegExp('\\$\\{' + substitute + '\\}');
        let substitution = substitutions[substitute];
        message = message.replace(token, substitution);
      });
    }

    return message;
  } catch (err) {
    return messageKey;
  }
};