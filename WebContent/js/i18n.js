// module "i18n.js";
"use strict";

const DEFAULT_LANGUAGE = "de-DE";
const ALTERNATE_LANGUAGE = "en-GB";
const _LANGUAGES = [ DEFAULT_LANGUAGE, ALTERNATE_LANGUAGE ];

const setLanguage = (language) => {
  language =_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  sessionStorage.setItem("language", language);
  console.log("language set to " + language);
}

const getLanguage = () => {
  if (sessionStorage.getItem("language")) {
    return sessionStorage.getItem("language");
  } else {
    setLanguage(navigator.language);
    return getLanguage();
  }
};

const primaryLanguage = (language) => {
  return language.split("-")[0];
};

const _DATE_FORMATTER = new Intl.DateTimeFormat(getLanguage(), { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });

let _TEMPLATE_DATE = _DATE_FORMATTER.format(new Date(Date.parse("1999-11-22")));

const _LOCAL_TO_DATE_EXPRESSION = new RegExp(_TEMPLATE_DATE
    .replace("22","(?<day>[0-9]{1,2})")
    .replace("11","(?<month>[0-9]{1,2})")
    .replace("1999","(?<year>[0-9]{4})")
  );

const _LOCAL_DATE_FORMAT = _TEMPLATE_DATE
  .replace("22","d")
  .replace("11","m")
  .replace("1999","Y");

const dateToLocalString = (date) => date ? _DATE_FORMATTER.format(date) : "";

const localStringToDate = (value) => {
  if (value) {
    let match = _LOCAL_TO_DATE_EXPRESSION.exec(value);
    if (match) {
      let year = parseInt(match.groups.year);
      let month = parseInt(match.groups.month);
      let day = parseInt(match.groups.day);
      let ts = Date.UTC(year, month, day);
      return new Date(ts);
    }
  }

  return undefined;
};

const _TRANSLATIONS = {};

const loadTranslations = async (language) => {
  await download(
    fileUrl("_locales/" + primaryLanguage(language) + "/messages.json"),
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
  setLanguage(getLanguage() == DEFAULT_LANGUAGE ? ALTERNATE_LANGUAGE : DEFAULT_LANGUAGE);
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
      return message;
    } else {
      console.log("No translation for: %s", messageKey);
    }
  } catch (error) {
    console.log("Error translating: %s %o", messageKey, error);
  }
  return messageKey;
};