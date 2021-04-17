// module "i18n.js";
"use strict";

const DEFAULT_LANGUAGE = "de-DE";
const ALTERNATE_LANGUAGE = "en-GB";

const _TRANSLATIONS = {};

const getLanguage = () => {
  return localStorage.getItem("language") ? localStorage.getItem("language") : DEFAULT_LANGUAGE;
};

const _DATE_FORMATTER = new Intl.DateTimeFormat(getLanguage(), { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });

let _TEMPLATE_DATE = _DATE_FORMATTER.format(new Date(Date.parse("2021-04-15")));

const _LOCAL_TO_DATE_EXPRESSION = new RegExp(_TEMPLATE_DATE.replace("2021","(?<year>[0-9]{4})")
    .replace("15","(?<day>[0-9]{2})")
    .replace("04","(?<month>[0-9]{2})"));

const _LOCAL_DATE_FORMAT = _TEMPLATE_DATE.replace("2021","Y")
    .replace("15","d")
    .replace("04","m");

const setLanguage = (language) => {
  localStorage.setItem("language", language);
  console.log("language: %s", language);
};

const primaryLanguage = (language) => {
  return language.split("-")[0];
};

const dateToLocalString = (date) => date ? _DATE_FORMATTER.format(date) : "";

const localStringToDate = (value) => {
  if (!value) return value;
  let match = _LOCAL_TO_DATE_EXPRESSION.exec(value);
  return match ? new Date(Date.UTC(parseInt(match.groups.year), parseInt(match.groups.month), parseInt(match.groups.day))) : value;
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
      return message;
    } else {
      console.log("No translation for: %s", messageKey);
    }
  } catch (error) {
    console.log("Error translating: %s %o", messageKey, error);
  }
  return messageKey;
};
