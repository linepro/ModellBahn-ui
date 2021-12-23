// module "filters.js";
"use strict";

class FilterOption {
  constructor(fieldName, option, className) {
    this.option = option;
    this.fieldName = fieldName;
    this.className = className;
    this.checked = () => false;
    this.filter = (val) => this.checked && val[this.fieldName] === option.value;
  }

  init(updated) {
    let opt = this;

    let div = document.createElement("div");
    if (opt.className) div.className = opt.className;

    let chk = document.createElement("input");
    chk.id = opt.option.display;
    chk.type = "checkbox";
    chk.addEventListener("change", (event) => updated(event, opt.option.value), false);
    div.appendChild(chk);
    opt.checked = () => chk.checked;

    let lbl = document.createElement("label");
    lbl.title = opt.option.display;
    lbl.htmlFor = chk.id;
    div.appendChild(lbl);

    return div;
  }
}

const checkBoxPanel = (fieldName, caption) => new FilterPanel(caption, [ new FilterOption(fieldName, { display: caption, value: true }) ]);
const dropDownPanel = (fieldName, caption, dropDown) => new FilterPanel(caption, dropDown.options.map(o => new FilterOption(fieldName, o)));

class FilterPanel {
  constructor (caption, options, className) {
    this.caption = caption;
    this.options = options;
    this.className = className;
    this.filter = (val) => !options.reduce((p, c) => p || c.checked, false) || options.reduce((p, c) => p || c.filter(val), false);
  }

  init(updated) {
    let pnl = this;

    let panel = document.createElement("div");
    panel.id = pnl.caption;
    if (pnl.className) panel.className = pnl.className;

    if (pnl.caption) {
        addHeading(panel, "H3", pnl.caption);
    }

    let opts = document.createElement("div");
    pnl.options.forEach(o => opts.appendChild(o.init(updated)));
    panel.appendChild(opts);

    return panel;
 }
}

class FilterBox {
  constructor(
    heading,
    dropDown,
    panels,
    filters,
    className
  ) {
    this.heading = heading;
    this.dropDown = dropDown;
    this.panels = panels;
    this.filters = filters;
    this.className = className;
  }

  filter(val) {
    let box = this;

    if (box.filters && !box.filters.reduce((p, c) => p || c.filter(val), false)) return "none";

    if (box.panels && !box.panels.reduce((p, c) => p || c.filter(val), false)) return "none";

    return "block";
  }

  filterList(list) {
    let box = this;

    list.options.forEach(o => o.style.display = box.filter(o.entity));
  }

  show(action) {
    let box = this;

    let frm = document.createElement("div");
    addHeading(frm, "H1", box.heading);
    if (box.className) frm.className = box.className;

    let fil = document.createElement("div");
    frm.appendChild(fil);

    let list = document.createElement("select");
    frm.appendChild(list);
    box.dropDown.options.forEach(o => {
      let opt = createOption(o.value, o.display, o.tooltip, o.image);
      opt.entity = o.entity;
      list.appendChild(opt);
    });
    list.selectedIndex = -1;
    list.size = 10;

    if (box.panels.length) {
      box.panels.forEach(p => fil.appendChild(p.init(box.filterList)));
    }

    let modal = addModal();

    let add = createButton("add", "add", () => {
      action(list.options[list.selectedIndex].entity);
      modal.style.display = "none";
    });
    add.enabled = false;

    frm.appendChild(add);
    list.addEventListener("select", (e) => add.enabled = e.target.selectedIndex != -1, false);
    
    let cancel = createButton("cancel", "cancel", () => modal.style.display = "none");
    frm.appendChild(cancel);

    showModal(frm);
  }
}

