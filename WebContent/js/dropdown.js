// module "dropdown.js"
"use strict";

const utf8decoder = new TextDecoder();
const utf8encoder = new TextEncoder();

class DropOption {
  constructor(value, display, tooltip, image) {
    this.display = utf8decoder.decode(utf8encoder.encode(display));
    this.value = value;
    this.tooltip = utf8decoder.decode(utf8encoder.encode(display));
    this.image = image;
  }

  getDisplay() {
    return this.display;
  }

  getValue() {
    return this.value;
  }

  getTooltip() {
    return this.tooltip;
  }

  getImage() {
    return this.image;
  }

  getLength() {
    return this.getDisplay().length;
  }
}

class DropDown {
  constructor(apiQuery, valuesExtractor, rowExtractor) {
    this.apiQuery = apiQuery;
    this.valuesExtractor = valuesExtractor;
    this.rowExtractor = rowExtractor;
    this.length = 10;
    this.options = [];
    this.initialized = false;
  }

  loadOptions(jsonData) {
    let dropDown = this;
    dropDown.valuesExtractor(jsonData).forEach(o => dropDown.addOption(dropDown.rowExtractor(o)));
  }

  getOptions() {
    return this.options;
  }

  async init(force) {
    let select = this;

    if (!select.initialized || force) {
      await fetch(select.apiQuery, { method: "GET", headers: {"Content-type": "application/json"} })
      .then(response => checkResponse(response))
      .then(jsonData => select.loadOptions(jsonData))
      .catch(error => reportError("init " + apiQuery, error));
    }

    select.initialized = true;
  }

  getLength() {
    return this.length;
  }
  
  addOption(option) {
    this.options.push(option);
    this.length = Math.max(this.length, option.getDisplay().length); 
  }
}