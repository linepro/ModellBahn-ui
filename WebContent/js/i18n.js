// module "i18n.js"
// import getRest from "api.js"
"use strict"

const DEFAULT_LANGUAGE = "de-DE"
const ALTERNATE_LANGUAGE = "en-US"

const TRANSLATIONS = {}

const getLanguage = () => {
  return localStorage.getItem("language") ? localStorage.getItem("language") : DEFAULT_LANGUAGE
}

const setLanguage = (language) => {
  localStorage.setItem("language", language) 
  console.log("language: " + language)
}

const primaryLanguage = (language) => {
  return language.split("-")[0]
}

const loadTranslations = async (language) => {
  await download(
    window.location.origin + "/ModellBahn/modellbahn-ui/_locales/" + primaryLanguage(language) + "/messages.json",
    (data) => {
      try {
        Object.keys(data)
              .forEach(key => TRANSLATIONS[key] = data[key].message)
        TRANSLATIONS[language] = "loaded"
        console.log(language +  " loaded")
      } catch (error) {
        console.log(language + " load failed: " + error)
      }
    },
    () => { if (language !== DEFAULT_LANGUAGE) { loadTranslations(DEFAULT_LANGUAGE) } }
  )
}

const toggleLanguage = async () => {
  setLanguage(getLanguage() === DEFAULT_LANGUAGE ? ALTERNATE_LANGUAGE : DEFAULT_LANGUAGE)
  location.reload()
}

const translate = (messageKey, substitutions) => {
  if (/^\s*$/.test(messageKey)) return messageKey
  try {
    let key = messageKey.toUpperCase()
    if (!TRANSLATIONS[key]) {
      console.log("No translation : \"" + messageKey + "\"\n" + new Error().stack)
    }
    let message = TRANSLATIONS[key] ? TRANSLATIONS[key] : messageKey
    if (substitutions) {
      Object.keys(substitutions).forEach(substitute => {
        let token = new RegExp("\\$\\{" + substitute + "\\}")
        let substitution = substitutions[substitute]
        message = message.replace(token, substitution)
      });
    }
    return message
  } catch (err) {
    return messageKey
  }
}
