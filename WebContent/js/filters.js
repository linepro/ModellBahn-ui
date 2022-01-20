// module "filters.js";
"use strict";

class FilterOption {
  constructor(
    id,
    option
  ) {
    this.id = id;
    this.display = option.display;
    this.value = option.value;
    this.chk = undefined;
  }

  isChecked() {
    let opt = this;

    return opt.chk.checked;
  }

  filter(val) {
    let opt = this;
    let inc = opt.value === val;
    console.log({ opt: opt.value, inc: inc, val: val});
    return inc;
  }

  init(updated) {
    let opt = this;

    let div = createDiv(undefined, "popup-field");
    let lbl = createTextElement("label", div, opt.display,  "popup-label");
    lbl.htmlFor = opt.id;

    let chk = createInput("checkbox", div, opt.id, "popup-control");
    chk.addEventListener("change", (event) => updated(event), false);

    opt.chk = chk;

    return div;
  }
}

const checkBoxPanel = (fieldName, caption) => new FilterPanel(fieldName, caption, [ new FilterOption(getFieldId(fieldName, caption), { display: caption, value: true })]);
const dropDownPanel = (fieldName, caption, dropDown) => new FilterPanel(fieldName, caption, dropDown.options.map(o => new FilterOption(getFieldId(fieldName, o.display), o)));

class FilterPanel {
  constructor (
    fieldName,
    caption,
    options
  ) {
    this.fieldName = fieldName;
    this.caption = caption;
    this.options = options;
    this.displayed = [];
  }

  filter(val) {
    let pnl = this;
    let chk = pnl.displayed
                 .filter(o => o.isChecked());

    if (!chk.length) return true;

    let fld = val[pnl.fieldName];

    return chk.map(c => c.filter(fld))
              .reduce((p, c) => p || c, false);
  }

  init(row, items, updated) {
    let pnl = this;
    let fldVals = items.map(i => i.entity[pnl.fieldName])
                       .filter((v, i, a) => a.indexOf(v) === i);

    if (fldVals.length > 1) {
      let vals = pnl.options;

      if (pnl.options.length > 1) {
        vals = pnl.options
                  .filter(o => fldVals.find(i => i === o.value));

        if (vals.length <= 1) return;
      }

      let opts = createDiv(row, "popup-filter");
      vals.forEach(o => opts.appendChild(o.init(updated)));

      pnl.displayed = vals;
    }

    return row;
 }
}

class FilterBox {
  constructor(
    heading,
    dropDown,
    panels,
    filters
  ) {
    this.heading = heading;
    this.dropDown = dropDown;
    this.panels = panels;
    this.filters = filters;
  }

  entity(val) {
    let box = this;

    return box.dropDown.options.find(o => o.value === val).entity;
  }

  visible(val) {
    let box = this;

    let vis = box.panels
                 .map(p => p.filter(val))
                 .reduce((p,c) => p && c, true);

    return vis ? "block" : "none";
  }

  filterList(list) {
    let box = this;

    Array.from(list.options)
         .forEach(o => o.style.display = box.visible(box.entity(o.value)));
  }

  filter(item) {
    let filters = this.filters;

    if (!filters || filters.length == 0) return true;

    return filters.reduce((p, c) => p || c(item.entity), false);
  }

  selected(list) {
    let box = this;
    let selected = list.selectedIndex;
    
    if (selected === -1) return;

    return box.entity(list.options[list.selectedIndex].value);
  }

  show(action) {
    let box = this;

    let frm = createDiv(undefined, "popup-form");
    createTextElement("h3", frm, box.heading, "popup-heading");

    let fil = createDiv(frm, "popup-section");

    let sel = createDiv(frm, "popup-control");

    let items = box.dropDown
                   .options
                   .filter(o => box.filter(o), false);

    let list = createSelect(sel, "popup-control", 10);
    items.forEach(o => list.appendChild(createOption(o.value, o.display, o.tooltip, o.image)));
    list.selectedIndex = -1;

    if (box.panels.length) {
      box.panels.forEach(p => p.init(fil, items, () => box.filterList(list)));
    }

    let foot = createDiv(frm, "popup-foot");

    let modal = addModal();

    let add = createButton(foot, "add", "add", () => {
      let val = box.selected(list);
      if (val) {
        action(val);
        modal.style.display = "none";
      }
    });
    add.enabled = false;

    list.addEventListener("select", (e, btn) => btn.enabled = e.target.selectedIndex !== -1, false);

    createButton(foot, "cancel", "cancel", () => modal.style.display = "none");

    showModal(frm, false);
  }
}

