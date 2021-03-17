// module "columns.js";
"use strict";

const Editable = {
  NEVER: 0,
  UPDATE: 1,
  ADD: 2
};

const EditMode = {
  VIEW: 0,
  UPDATE: 1,
  ADD: 2
};

const shouldDisable = (editable, editMode, value) => {
  if (value) {
    if (editable === Editable.NEVER || editMode === EditMode.VIEW) {
      return true;
    } else {
      return (editable > editMode);
    }
  } else {
    return !(editMode === EditMode.ADD && editable !== Editable.NEVER);
  }
};

const disable = (inp) => {
  inp.disabled = true;
  inp.readOnly = true;
  inp.required = false;
  inp.removeEventListener("changed", false);
};

class Column {
  constructor(heading, fieldName, getter, setter, editable, required, length) {
    this.heading = heading;
    this.fieldName = fieldName;
    this.getter = getter;
    this.setter = setter;
    this.editable = editable ? editable : Editable.NEVER;
    this.required = required ? required : false;
    this.length = Math.max(length ? length : heading.length, heading.length + 1);
    this.width = 0;
  }

  setContext(grid, table) {
    this.grid = grid;
    this.table = table;
  }

  getHeading(isForm) {
    let td = document.createElement(isForm ? "div" : "th");
    td.className = isForm ? "flex-label" : "table-heading";
    addText(td, this.heading);
    return td;
  }

  entityValue(entity) {
    return this.getter(entity, this.fieldName);
  }

  getLength() {
    return boxSize(this.length);
  }

  getDisplayLength() {
    return this.getLength() + "ch";
  }

  getHeaderLength() {
    return boxSize(this.heading.length);
  }

  getWidth() {
    return this.width;
  }

  setWidth(width) {
    this.width = width;
    this.style.width = width;
    this.style.maxWidth = width;
    this.style.minWidth = width;
  }
  
  createControl() {
    let inp = document.createElement("input");
    inp.autocomplete = "off";
    return inp;
  }

  getControl(cell, entity, editMode) {
    let inp = this.createControl();

    let value;

    if (entity) {
      value = this.entityValue(entity);
    }

    if (value) {
      inp.setAttribute("data-value", value);
    }

    this.setValue(inp, value);

    if (value || entity) {
      inp.disabled = shouldDisable(this.editable, editMode);
    } else {
      inp.disabled = !(editMode === EditMode.ADD && this.editable !== Editable.NEVER);
    }

    inp.readOnly = inp.disabled;
    inp.required = this.required;

    cell.appendChild(inp);

    return inp;
  }

  getValue(cell) {
    let ctl = cell.firstChild;
    if (ctl) {
      return this.getControlValue(ctl);
    }
  }

  getControlValue(ctl) {
    return ctl.value ? ctl.value : undefined;
  }

  setValue(ctl, value) {
    if (value) {
      ctl.value = value;
    }
  }

  isButtons() {
    return false;
  }
}

class BoolColumn extends Column {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, heading.length);
  }

  createControl() {
    let chk = super.createControl();
    chk.type = "checkbox";
    return chk;
  }

  getControlValue(chk) {
    return chk.checked;
  }

  setValue(chk, value) {
    chk.checked = value;
  }
}

class NumberColumn extends Column {
  constructor(heading, fieldName, getter, setter, editable, required, max = 255, min = 0, places = 0) {
    super(heading, fieldName, getter, setter, editable, required, Math.max(max.toString().length, heading.length));
    this.max = max;
    this.min = min;
    this.places = places;
  }

  createControl() {
    let num = super.createControl();
    num.type = "number";
    num.min = this.min;
    num.max = this.max;
    num.step = this.places > 0 ? 1 / this.places : 1;
    return num;
  }

  getControlValue(num) {
    return num.value ? Number.parseFloat(num.value) : undefined;
  }

  setValue(num, value) {
    if (value) {
      num.value = value.toLocaleString(getLanguage(), { minimumFractionDigits: this.places, maximumFractionDigits: this.places } );
    }
  }
}

class PhoneColumn extends Column {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 10);
  }

  createControl() {
    let tel = super.createControl();
    tel.type = "tel";
    return tel;
  }
}

class TextColumn extends Column {
  constructor(heading, fieldName, getter, setter, editable, required, length, pattern) {
    super(heading, fieldName, getter, setter, editable, required, length);
    this.pattern = pattern;
  }

  createControl() {
    let txt = super.createControl();
    txt.type = "text";
    txt.maxLength = this.length;
    txt.pattern = this.pattern;
    return txt;
  }
}

const URL_PATTERN = "^(?:(http[s]?):\\/\\/)?(\\w+(?:\\.\\w+)*)(?::(\\d+))?(?:\\/(\\w+(?:\\/|\\.\\w+)?))?$";

class URLColumn extends TextColumn {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 60, URL_PATTERN);
  }

  createControl() {
    let rul = super.createControl();
    rul.type = "url";
    rul.class = "table-url";
    rul.addEventListener("click", () => { if (rul.value) { window.open(rul.value, "_blank") } }, false);
    return rul;
  }
}

const DATE_PATTERN = "^(18[2-9][0-9]|19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$";

const WEEKDAY_LABELS = [
  translate("MO"), translate("TU"), translate("WE"),
  translate("TH"), translate("FR"), translate("SA"),
  translate("SU")
  ];

const MON_LABELS = [
  translate("JAN"), translate("FEB"), translate("MAR"),
  translate("APR"), translate("MAY"), translate("JUN"),
  translate("JUL"), translate("AUG"), translate("SEP"),
  translate("OCT"), translate("NOV"), translate("DEC")
  ];

const MONTH_LABELS = [
  translate("JANUARY"), translate("FEBRUARY"), translate("MARCH"),
  translate("APRIL"), translate("MAY"), translate("JUNE"),
  translate("JULY"), translate("AUGUST"), translate("SEPTEMBER"),
  translate("OCTOBER"), translate("NOVEMBER"), translate("DECEMBER")
  ];

const DATE_OPTIONS = {
  minDate: new Date("1800-01-01"),
  weekDayLabels: WEEKDAY_LABELS,
  shortMonthLabels: MON_LABELS,
  singleMonthLabels: MONTH_LABELS,
  todayButton: false,
  clearButton: false
  };

class DateColumn extends TextColumn {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 12, DATE_PATTERN);
  }

  getControl(cell, entity, editMode) {
    let dte = super.getControl(cell, entity, editMode);

    let value = dte.getAttribute("data-value");

    if (!dte.disabled) {
      dte.DatePickerX.init(DATE_OPTIONS);
      dte.DatePickerX.setValue(value);
    }

    return dte;
  }

  setValue(inp, value) {
    if (value) {
      inp.value = new Date(value).toLocaleDateString(getLanguage());
    }
  }

  getControlValue(dte) {
    let value = dte.value;

    if (dte.DatePickerX) {
      value = dte.DatePickerX.getValue();
    }

    let iso = value ? new Date(value).toISOString().replace(/T.*/, "") : undefined;

    if (iso) dte.setAttribute("data-value", iso);

    return iso;
  }
}

const readFile = (uploadUrl, fileData, grid, rowId) => {
  let reader = new FileReader();
  reader.onload = (e) => uploadFile(uploadUrl, e.target.result, grid.renderUpdate(jsonData, rowId), reportError(uploadUrl, error));
  reader.onerror = (e) => {
    reader.abort();
    reportError("readFile", translate("BADFILE", [fileData, e]));
  };
  reader.readAsDataURL(fileData);
};

const removeFile = async (deleteUrl, grid, rowId) => deleteRest(deleteUrl, grid.renderUpdate(jsonData, rowId), reportError(deleteUrl, error));

const getLink = (links, rel) => {
  if (!links || !links[rel]) {
    return undefined;
  }
  return links[rel][0].href;
};

class FileColumn extends Column {
  constructor(heading, fieldName, getter, mask, editable, required) {
    super(heading, fieldName, getter, undefined, editable, required, 20);
    this.mask = mask;
  }
  
  getControl(cell, entity, editMode) {
    let img = super.getControl(cell, entity, editMode);
    img.className = "img-display";
    img.id = cell.id + "_img";

    if (entity) {
      img.addEventListener("click", (e) => {
        let image = e.target;
        let file = image.getAttribute("data-value");
        if (file) { this.showContent(file) }
      }, false);

      let bar = document.createElement("div");
      bar.className = "img-button";
      cell.append(bar);

      let link = getLink(entity._links, this.fieldName);
      let grid = this.grid;
      let rowId = getCellRowId(cell);

      if (link) {
        let btn = createButton("add", "add", (e) => { this.select(e, grid, rowId, link) });
        btn.className = "img-button";
        btn.id = cell.id + "_add";
        btn.firstChild.className = "img-button";
        bar.appendChild(btn);
      }

      if (link) {
        let btn = createButton("delete", "delete", (e) => { this.remove(e, grid, rowId, link) });
        btn.className = "img-button";
        btn.id = cell.id + "_delete";
        btn.firstChild.className = "img-button";
        btn.disabled = !img.getAttribute("data-value");
        bar.appendChild(btn);
      }

      if (cell.firstChild) {
        cell.removeChild(img);
        cell.insertBefore(img, cell.firstChild);
      }
    }

    return img;
  }

  createControl() {
    return document.createElement("img");
  }

  getControlValue(img) {
    return img.getAttribute("data-value") ? img.getAttribute("data-value") : undefined;
  }

  getDisplayLength() {
    return "auto";
  }

  select(event, grid, rowId, href) {
    let btn = event.target;
    if (btn.tagName === "IMG") {
      btn = btn.parentElement;
    }
    let link = btn.value;
    let bar = btn.parentElement;
    let cell = bar.parentElement;
    let file = document.createElement("input");
    file.type = "file";
    file.accept = this.mask;
    file.multiple = false;
    file.setAttribute("data-update", link);
    cell.appendChild(file);
    file.style.display = "none";
    file.click();
    file.addEventListener("change", (e) => { this.update(e, grid, rowId, href) }, false);
    file.addEventListener("click", (e) => { this.update(e, grid, rowId, href) }, false);
    file.addEventListener("blur", (e) => { this.update(e, grid, rowId, href) }, false);
  }

  remove(e, grid, rowId, href) {
    removeFile(href, grid, rowId);
  }

  update(e, grid, rowId, href) {
    let file = e.target;
    let fileData = file.files[0];
    let cell = file.parentElement;
    cell.removeChild(file);
    if (fileData) {
      readFile(href, fileData, grid, rowId);
    }
  }

  showContent(arg) {
    // Do nothimg.
  }
}

class IMGColumn extends FileColumn {
  constructor(heading, fieldName, getter, editable, required) {
    super(heading, fieldName, getter, "image/*", editable, required);
  }

  showContent(file) {
    let img = document.createElement("img");
    img.className = "display-img";
    img.src = file;
    showModal(img);
  }

  setValue(img, value) {
    img.src = value ? value : imageSource("add-picture");
  }
}

class PDFColumn extends FileColumn {
  constructor(heading, fieldName, getter, editable, required) {
    super(heading, fieldName, getter, "application/pdf", editable, required);
  }

  setValue(img, value) {
    img.src = value ? imageSource("pdf") : imageSource("add-document");
  }

  showContent(pdf) {
    let div = document.createElement("div");
    div.className = "display-pdf-container";

    let canvas = document.createElement("canvas");
    canvas.className = "display-pdf-canvas";
    div.appendChild(canvas);

    let bar = document.createElement("div");
    bar.className = "display-pdf-bar";
    div.appendChild(bar);

    let viewer = pdfViewer(canvas);

    let prev = createButton("vorig", "prev", () => prevPdfPage(viewer));
    prev.style.cssFloat = "left";
    bar.appendChild(prev);

    let next = createButton("nachste", "next", () => nextPdfPage(viewer));
    next.style.cssFloat = "right";
    bar.appendChild(next);

    loadPdf(pdf, viewer);

    showModal(div, true);
  }
}

class SelectColumn extends Column {
  constructor(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize = 5) {
    super(heading, fieldName, getter, setter, editable, required, length);
    this.dropDown = dropDown;
    this.dropSize = dropSize;
  }

  setValue(sel, value) {
    if (value) {
      this.dropDown.options.forEach((o) => {
        if (o.value === value) {
          sel.value = o.display;
        }
      });
    }
  }

  getLength() {
    return Math.max(this.dropDown.getLength(), this.getHeaderLength());
  }

  addOptions(select, dropDown) {
    if (!this.required) {
      addOption(select, undefined, translate("NICHT_BENOTIGT"));
    }

    dropDown.options.forEach(opt => {
      addOption(select, opt.getValue(), opt.getDisplay());
    });
  }

  options() {
    // Filter only for AutoComplete...
    return this.dropDown.options;
  }
}

const closeAutoLists = (elmnt = document) => 
  elmnt.getElementsByClassName("autocomplete-list")
       .forEach((a) => {
         removeChildren(a);
         a.parentElement.removeChild(a);
  });

document.addEventListener("click", () => { closeAutoLists() }, false);

const valueAndUnits = (cssSize) => {
  let dims = /^(\d+)([^\d]+)$/.exec(cssSize);
  return { value: dims[1], units: dims[2] }
}

const boxSize = (length) => Math.ceil(length / 5) * 5;

class AutoCompleteColumn extends SelectColumn {
  constructor(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize) {
    super(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize);
  }

  getControl(cell, entity, editMode) {
    let sel = super.getControl(cell, entity, editMode);

    if (!sel.disabled) {
      sel.addEventListener("click", (e) => { this.open(e) }, false);
      sel.addEventListener("input", (e) => { this.open(e) }, false);
      sel.addEventListener("keydown", (e) => { this.keydown(e) }, false);
      sel.classList.add("autocomplete");
    }

    return sel;
  }

  getControlValue(sel) {
    return sel.getAttribute("data-value") ? sel.getAttribute("data-value") : undefined;
  }

  options(txt) {
    return this.dropDown
               .getOptions()
               .filter((o) => o.display.toLowerCase().includes(txt.toLowerCase()))
               .slice(0, this.dropSize);
  }

  caption(txt, o) {
    return o.display.replace(/inp.value/i, "<strong>" + inp.value + "</strong>");
  }

  open(event) {
    let inp = event.target;
    let sel = this;
    let div = inp.parentElement;

    if (!inp.value) {
      return false;
    }

    e.stopPropagation();
    closeAutoLists();

    let rect = div.getBoundingClientRect();

    let autoComp = document.createElement("div");
    autoComp.className = "autocomplete-list";
    autoComp.style.top = rect.y + rect.height;
    div.appendChild(autoComp);
    let dims = valueAndUnits(getComputedStyle(autoComp).lineHeight);

    let i = 0;
    sel.options(inp.value).forEach((o) => {
      let autoItem = document.createElement("div");
      autoItem.setAttribute("data-value", o.value);
      autoItem.className = "autocomplete-items";
      autoItem.style.top = (dims.value * i) + dims.units;
      addText(autoItem, sel.caption(inp.value, o));
      autoItem.addEventListener("click", (e) => { this.click(e) }, false);
      autoComp.appendChild(autoItem);
      i++;
    });
  }

  keydown(e) {
    let ctl = this;
    let div = e.target.parentElement;

    let autoComps = div.getElementsByClassName("autocomplete-list");

    if (!autoComps || !autoComps.length) {
      return;
    }

    let autoComp = autoComps[0];

    if (e.keyCode === 40) {
      ctl.addActive(ctl, autoComp, true);
    } else if (e.keyCode === 38) {
      ctl.addActive(ctl, autoComp, false);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      ctl.selectActive(autoComp);
    }
  }

  click(e) {
    let opt = e.target;
    let autoComp = opt.parentElement;
    let div = autoComp.parentElement;
    let inp = div.getElementsByClassName("autocomplete")[0];

    inp.value = opt.innerText;
    inp.setAttribute("data-value", opt.getAttribute("data-value"));

    closeAutoLists();
  }

  addActive(ctl, autoComp, up) {
    let items = autoComp.getElementsByClassName("autocomplete-items");
    let curr = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].classList.contains("autocomplete-active")) {
        if (curr === -1) {
          curr = i;
        }
        items[i].classList.remove("autocomplete-active");
      }
    }

    let next = curr + (up ? 1 : -1);
    if (0 <= next && next <= items.length) {
      items[next].classList.add("autocomplete-active");
    }
  }

  selectActive(autoComp) {
    let active = autoComp.getElementsByClassName("autocomplete-active");
    if (active.length) {
      active[0].click();
    }
  }
}

class DropDownColumn extends SelectColumn {
  constructor(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize) {
    super(heading, fieldName, getter, setter, dropDown, editable, required, length + 3.5, dropSize);
  }

  createControl() {
    let sel = document.createElement("select");
    sel.size = 1;
    this.addOptions(sel, this.dropDown);
    sel.selectedIndex = -1;
    return sel;
  }

  getControlValue(select) {
    return select.selectedIndex >= 0 ? select.options[select.selectedIndex].value : undefined;
  }

  getLength() {
    return boxSize(Math.max(this.dropDown.getLength() + 3, this.getHeaderLength()));
  }

  setValue(sel, value) {
    if (value) {
      sel.value = value;
      sel.options
         .filter((o) => o.value === value)
         .forEach((o) => o.selected = true);
    }
  }
}

class ButtonColumn {
  constructor(headLinkage, btnLinkage) {
    this.headLinkage = headLinkage;
    this.btnLinkage = btnLinkage;
    this.length = Math.max(headLinkage.length, btnLinkage.length) * 8;
    this.width = 0;
  }

  setContext(grid, table) {
    this.grid = grid;
    this.table = table;
  }

  getHeading(isForm) {
    let grid = this.grid;
    let td = document.createElement(isForm ? "div" : "th");
    td.className = "table-heading-btn";

    if (this.headLinkage) {
      this.headLinkage.forEach(linkage => {
        let btn = linkage(grid);
        td.appendChild(btn);
      });
    } else {
      addText(td, " ");
    }

    return td;
  }

  getLength() {
    return boxSize(this.length);
  }

  getHeaderLength() {
    return this.length;
  }

  getWidth() {
    return this.width;
  }

  setWidth(width) {
    this.width = width;
  }

  getControl(cell, entity, editMode) {
    let rowId = getCellRowId(cell);
    let grid = this.grid;

    let ctl = document.createElement("div");

    if (editMode && this.btnLinkage) {
      this.btnLinkage.forEach(linkage => {
        if (entity) {
          let btn = linkage(grid, rowId);
          ctl.appendChild(btn);
        }
      });
    } else {
      addText(ctl, " ");
    }

    cell.appendChild(ctl);

    return ctl;
  }

  isButtons() {
    return true;
  }
}

class ThumbColumn extends Column {
  constructor(fieldName, getter) {
    super("", fieldName, getter, undefined, Editable.NEVER, false, 0);
  }

  createControl(cell, editMode) {
    return document.createElement("div");
  }
  
  bind(cell, entity, editMode) {
    let cellId = cell.id.substr(cell.id.indexOf("_"));

    let div = document.getElementById(this.fieldName + cellId);

    if (div) {
      div.className = "thumb-item";
    }

    let img = document.getElementById(this.fieldName + cellId + "_img");

    if (img) {
      img.className = "thumb-display";

      if (entity) {
        img.src = this.entityValue(entity);
      } else {
        img.src = undefined;
      }
    }

    return img;
  }


  getControlValue(img) {
    return undefined;
  }

  getDisplayLength() {
    return 0;
  }
}
