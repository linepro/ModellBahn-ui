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

    let div = document.createElement("div");
    div.className = "popup-item";

    let lbl = document.createElement("label");
    lbl.appendChild(document.createTextNode(translate(opt.display)));
    lbl.className = "popup-label";
    div.appendChild(lbl);

    let chk = document.createElement("input");
    chk.id = opt.id;
    chk.type = "checkbox";
    chk.className = "popup-control";
    chk.style.order = 2;
    chk.addEventListener("change", (event) => updated(event), false);
    lbl.htmlFor = chk.id;
    div.appendChild(chk);

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

    let inc = chk.map(c => c.filter(fld))
                 .reduce((p, c) => p || c, false);

    return inc;
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

      let opts = document.createElement("div");
      opts.className = "popup-filter";
      vals.forEach(o => opts.appendChild(o.init(updated)));
      row.appendChild(opts);

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

    let frm = document.createElement("div");
    frm.className = "popup-form";
    let h = addHeading(frm, "H3", box.heading);
    h.className = "popup-heading";

    let fil = document.createElement("div");
    fil.className = "popup-filters";
    frm.appendChild(fil);

    let sel = document.createElement("div");
    sel.className = "popup-item";
    frm.appendChild(sel);

    let list = document.createElement("select");
    list.className = "popup-control";
    list.selectedIndex = -1;
    list.size = 10;
    sel.appendChild(list);

    let items = box.dropDown
                   .options
                   .filter(o => box.filter(o), false);

    items.forEach(o => {
          let opt = createOption(o.value, o.display, o.tooltip, o.image);
          list.appendChild(opt);
        });

    if (box.panels.length) {
      box.panels.forEach(p => p.init(fil, items, () => box.filterList(list)));
    }

    let foot = document.createElement("div");
    foot.className="popup-foot";
    frm.appendChild(foot);

    let modal = addModal();

    let add = createButton("add", "add", () => {
      let val = box.selected(list);
      if (val) {
        action(val);
        modal.style.display = "none";
      }
    });
    add.className = "nav-button";
    add.enabled = false;
    foot.appendChild(add);

    list.addEventListener("select", (e, btn) => btn.enabled = e.target.selectedIndex !== -1, false);

    let cancel = createButton("cancel", "cancel", () => modal.style.display = "none");
    cancel.className = "nav-button";
    foot.appendChild(cancel);

    showModal(frm, false);
  }
}

