// module "dropdown.js";
"use strict";

const utf8decoder = new TextDecoder();
const utf8encoder = new TextEncoder();

const dropOption = (value, display, image, group) => {
  return {
    display: utf8decoder.decode(utf8encoder.encode(display)),
    value: value,
    tooltip: utf8decoder.decode(utf8encoder.encode(display)),
    image: image,
    group: group
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

const initDropDown = async (drop, force) => {
  if (drop.options.length === 0 || force) {
    await getRest(
      drop.apiQuery,
      (jsonData) => drop.valuesExtractor(jsonData)
          .forEach(o => {
            let opt = drop.rowExtractor(o);
            drop.options.push(opt);
            drop.length = Math.max(drop.length, opt.display.length);
          }),
      (error) => reportError("init " + dropDown.apiQuery, error)
    );
  }
};
