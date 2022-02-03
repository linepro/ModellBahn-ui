// module "dropdown.js";
"use strict";

const utf8decoder = new TextDecoder();
const utf8encoder = new TextEncoder();

const dropOption = (value, display, tooltip, image, group, entity) => {
  return {
    display: utf8decoder.decode(utf8encoder.encode(display)),
    value: value,
    tooltip: utf8decoder.decode(utf8encoder.encode(tooltip)),
    image: image,
    group: group,
    entity: entity
  };
};

const dropDown = (apiQuery, valuesExtractor, rowExtractor) => {
  return {
    apiQuery: apiQuery,
    valuesExtractor: valuesExtractor,
    rowExtractor: rowExtractor,
    length: 10,
    grouped: [],
    options: []
  };
};

const initDropDown = async (drop, force) => {
  if (drop.options.length == 0 || force) {
    await getRest(
      drop.apiQuery,
      (jsonData) => drop.valuesExtractor(jsonData)
        .forEach(o => {
          let opt = drop.rowExtractor(o);
          if (opt.group) {
            let group = drop.grouped.find(g => g.name == opt.group);
            if (!group) {
              group = {
                name: opt.group,
                options: []
              };
              drop.grouped.push(group);
            }
            group.options.push(opt);
          }
          drop.options.push(opt);
          drop.length = Math.max(drop.length, opt.display.length);
        }),
      (error) => reportError("init " + drop.apiQuery, error)
    );
  }
};
