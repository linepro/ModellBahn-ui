// module "dropdown.js"
"use strict";

const utf8decoder = new TextDecoder();
const utf8encoder = new TextEncoder();

const dropOption = (value, display, image) => {
  return {
    display: utf8decoder.decode(utf8encoder.encode(display)),
    value: value,
    tooltip: utf8decoder.decode(utf8encoder.encode(display)),
    image: image
  };
};

const dropDown = (apiQuery, valuesExtractor, rowExtractor) => {
  return {
    apiQuery: apiQuery,
    valuesExtractor: valuesExtractor,
    rowExtractor: rowExtractor,
    length: 10,
    options: []
  };
};

const loadOptions = (dropDown, jsonData) => {
  dropDown.valuesExtractor(jsonData)
          .forEach(o => {
            let option = dropDown.rowExtractor(o);
            dropDown.options.push(option);
            dropDown.length = Math.max(dropDown.length, option.display.length);
          });
};

const initDropDown = async (dropDown, force) => {
  if (dropDown.options.length === 0 || force) {
    await getRest(
      dropDown.apiQuery,
      (jsonData) => loadOptions(dropDown, jsonData),
      (error) => reportError("init " + dropDown.apiQuery, error)
    );
  }
};
