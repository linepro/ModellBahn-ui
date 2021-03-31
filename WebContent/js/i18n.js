// module "i18n.js";
"use strict";

const DEFAULT_LANGUAGE = "de-DE";
const ALTERNATE_LANGUAGE = "en-US";

const _TRANSLATIONS = {};

const getLanguage = () => {
  return localStorage.getItem("language") ? localStorage.getItem("language") : DEFAULT_LANGUAGE;
};

const setLanguage = (language) => {
  localStorage.setItem("language", language);
  console.log("language: %s", language);
};

const primaryLanguage = (language) => {
  return language.split("-")[0];
};

const loadTranslations = async (language) => {
  await download(
    window.location.origin + "/ModellBahn/modellbahn-ui/_locales/" + primaryLanguage(language) + "/messages.json",
    (data) => {
      try {
        Object.keys(data)
              .forEach(key => (_TRANSLATIONS[key] = data[key].message));
        _TRANSLATIONS[language] = "loaded";
        console.log("language: %s loaded", language);
      } catch (error) {
        console.log("language: %s load failed: %s", language, error);
      }
    },
    () => {
      if (language !== DEFAULT_LANGUAGE) {
        loadTranslations(DEFAULT_LANGUAGE);
      }
    }
  );
};

const toggleLanguage = async () => {
  setLanguage(getLanguage() === DEFAULT_LANGUAGE ? ALTERNATE_LANGUAGE : DEFAULT_LANGUAGE);
  location.reload();
};

const translate = (messageKey, substitutions) => {
  if (/^\s*$/.test(messageKey)) return messageKey;
  try {
    let message = _TRANSLATIONS[messageKey.toUpperCase()];
    if (message) {
      if (substitutions) {
        Object.keys(substitutions)
              .forEach(substitute => {
          let token = new RegExp("\\$\\{" + substitute + "\\}");
          message = message.replace(token, substitutions[substitute]);
        });
      }
    } else {
      console.log("No translation for: %s", messageKey);
    }
    return message;
  } catch (error) {
    console.log("Error translating: %s %o", messageKey, error);
  }
  return messageKey;
};
