// module "i18n.js"
// import getRest from "api.js"
"use strict"

const DEFAULT_LANGUAGE = "de-DE"

const TRANSLATIONS = {}

const loadTranslations = async (language) => {
  let code = language.split("-")[0]
  await download(
    window.location.origin + "/ModellBahn/modellbahn-ui/_locales/" + code + "/messages.json",
    (data) => {
      try {
        Object.keys(data)
              .forEach(key => TRANSLATIONS[key] = data[key].message)
      } catch (error) {
        console.log(error)
      }
      TRANSLATIONS[language] = "loaded"
    },
    () => { if (language !== DEFAULT_LANGUAGE) { loadTranslations(DEFAULT_LANGUAGE) } }
  )
}

const getLanguage = () => {
  return sessionStorage.getItem("language")
}

const setLanguage = (code) => { 
  console.log("language: " + code)
  loadTranslations(code)
  sessionStorage.setItem("language", code) 
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

setLanguage(DEFAULT_LANGUAGE);