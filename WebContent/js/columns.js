// module "columns.js";
"use strict";

const Editable = {
  NEVER: 0,
  UPDATE: 1,
  ADD: 2,
};

const EditMode = {
  VIEW: 0,
  UPDATE: 1,
  ADD: 2,
};

const actionLink = (entity, rel) =>
  entity && entity._links && entity._links[rel]
    ? entity._links[rel][0].href
    : undefined;

const boxSize = (length) => Math.ceil(length / 5) * 5;

const closeAutoLists = (elmnt = document) => {
  for (let a of elmnt.getElementsByClassName("autocomplete-list")) {
    removeChildren(a);
    a.parentElement.removeChild(a);
  }
};

document.addEventListener(
  "click",
  () => {
    closeAutoLists();
  },
  false
);

const getRowId = (tableId, i) => [tableId, i].join("_");

const getFieldId = (rowId, fieldName) => [rowId, fieldName].join("_");

const shouldDisable = (editable, editMode, value) => {
  if (value) {
    if (editable === Editable.NEVER || editMode === EditMode.VIEW) {
      return true;
    } else {
      return editable > editMode;
    }
  } else {
    return !(editMode === EditMode.ADD && editable !== Editable.NEVER);
  }
};

const valueAndUnits = (cssSize) => {
  let dims = /^(\d+)([^\d]+)$/.exec(cssSize);
  return { value: dims[1], units: dims[2] };
};

const setWidths = (element, width) => {
  element.width = width;
  element.style.width = width;
  element.style.maxWidth = width;
  element.style.minWidth = width;
};

class VirtualColumn {
  constructor() {
    this.length = 0;
  }

  addHeading(headerRow) {}

  addFormField(row, width) {
    return undefined;
  }

  addTableCell(row) {
    return undefined;
  }

  bind(row, entity, editMode) {}
}

class Column extends VirtualColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable = Editable.NEVER,
    required = false,
    length = heading.length
  ) {
    super();
    this.heading = heading;
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.fieldSetter = fieldSetter;
    this.editable = editable;
    this.required = required;
    this.length = Math.max(length, heading.length + 1);
  }

  addHeading(headerRow) {
    let column = this;

    let header = document.createElement("th");
    header.className = "table-heading";
    header.appendChild(document.createTextNode(translate(column.heading)));
    headerRow.append(header);
  }

  initialise(ctl) {
    ctl.autocomplete = "off";
    return ctl;
  }

  getControlValue(ctl) {
    return ctl.value ? ctl.value : undefined;
  }

  updateEntity(event) {
    let ctl = event.target;
    if (ctl) {
      let column = this;
      if (column.fieldSetter) {
        let entity = ctl.setAttribute("data-value", entity);
        if (entity) {
          column.fieldSetter(entity, column.getControlValue(ctl));
        }
      }
    }
  }

  createControl(row, className) {
    let column = this;

    let ctl = document.createElement("input");
    ctl.id = getFieldId(row.id, column.fieldName);
    ctl.className = className;
    ctl = column.initialise(ctl);
    ctl.readOnly =
      column.editable === Editable.NEVER || row.editMode === EditMode.VIEW;
    ctl.required = column.required;
    ctl.addEventListener("change", (event) => updateEntity(event), false);
    ctl.disabled = true;
    ctl.style.visibility = "hidden";
    return ctl;
  }

  addFormField(row, labelWidth) {
    let column = this;

    let cell = document.createElement("div");
    cell.className = "flex-item";
    row.append(cell);

    let label = document.createElement("label");
    label.className = "flex-label";
    label.appendChild(document.createTextNode(translate(column.heading)));
    setWidths(label, labelWidth);
    cell.append(label);

    let ctl = createControl(row, "flex-control");
    setWidths(ctl, column.length + "ch");
    label.for = ctl.id;
    cell.append(ctl);

    return {
      id: ctl.id,
      element: ctl,
      column: column
    };
  }

  addTableCell(row) {
    let column = this;

    let cell = document.createElement("td");
    cell.className = "table-cell";
    row.append(cell);

    let ctl = column.createControl(row, "table-cell");
    cell.append(ctl);

    return {
      id: ctl.id,
      element: ctl,
      column: column
    };
  }

  setControlValue(ctl, value) {
    ctl.value = value ? value : "";
  }

  bind(row, entity, editMode) {
    let column = this;

    let ctl = document.getElementById(getFieldId(row.id, column.fieldName));
    if (ctl) {
      let value = column.fieldGetter(entity, column.fieldName);
      if (value) {
        ctl.setAttribute("data-value", entity);
      } else {
        ctl.removeAttribute("data-value");
      }
      column.setControlValue(ctl, value);
      ctl.disabled = shouldDisable(column.editable, editMode, value);
      ctl.style.visibility = entity ? "visible" : "hidden";
    }
    return ctl;
  }
}

class BoolColumn extends Column {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      heading.length
    );
  }

  initialise(chk) {
    chk = super.initialise(chk);
    chk.type = "checkbox";
    return chk;
  }

  getControlValue(chk) {
    return chk.checked;
  }

  setControlValue(chk, value) {
    chk.checked = value;
  }
}

class NumberColumn extends Column {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required,
    max = 255,
    min = 0,
    places = 0
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      Math.max(max.toString().length, heading.length)
    );
    this.max = max;
    this.min = min;
    this.places = places;
  }

  initialise(num) {
    let column = this;

    num = super.initialise(num);
    num.type = "number";
    num.min = column.min;
    num.max = column.max;
    num.step = column.places > 0 ? 1 / column.places : 1;
    return num;
  }

  getControlValue(num) {
    return num.value ? Number.parseFloat(num.value) : undefined;
  }

  setControlValue(num, value) {
    let column = this;
    num.value = value
      ? value.toLocaleString(getLanguage(), {
          minimumFractionDigits: column.places,
          maximumFractionDigits: column.places,
        })
      : "";
  }
}

class PhoneColumn extends Column {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required
  ) {
    super(heading, fieldName, fieldGetter, fieldSetter, editable, required, 10);
  }

  initialise(tel) {
    tel = super.initialise(txt);
    tel.type = "tel";
    return tel;
  }
}

class TextColumn extends Column {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required,
    length,
    pattern
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      length
    );
    this.pattern = pattern;
  }

  initialise(txt) {
    let column = this;

    txt = super.initialise(txt);
    txt.type = "text";
    txt.maxLength = column.length;
    txt.pattern = column.pattern;
    return txt;
  }
}

const URL_PATTERN =
  "^(?:(http[s]?):\\/\\/)?(\\w+(?:\\.\\w+)*)(?::(\\d+))?(?:\\/(\\w+(?:\\/|\\.\\w+)?))?$";

class UrlColumn extends TextColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      60,
      URL_PATTERN
    );
  }

  initialise(rul) {
    rul = super.initialise(rul);
    rul.type = "url";
    rul.class = "table-url";
    rul.addEventListener(
      "click",
      () => {
        if (rul.value) {
          window.open(rul.value, "_blank");
        }
      },
      false
    );
    return rul;
  }
}

const DATE_PATTERN =
  "^(18[2-9][0-9]|19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$";

const dateOptions = () => {
  return {
    minDate: new Date("1800-01-01"),
    weekDayLabels: [
      translate("MO"),
      translate("TU"),
      translate("WE"),
      translate("TH"),
      translate("FR"),
      translate("SA"),
      translate("SU"),
    ],
    shortMonthLabels: [
      translate("JAN"),
      translate("FEB"),
      translate("MAR"),
      translate("APR"),
      translate("MAY"),
      translate("JUN"),
      translate("JUL"),
      translate("AUG"),
      translate("SEP"),
      translate("OCT"),
      translate("NOV"),
      translate("DEC"),
    ],
    singleMonthLabels: [
      translate("JANUARY"),
      translate("FEBRUARY"),
      translate("MARCH"),
      translate("APRIL"),
      translate("MAY"),
      translate("JUNE"),
      translate("JULY"),
      translate("AUGUST"),
      translate("SEPTEMBER"),
      translate("OCTOBER"),
      translate("NOVEMBER"),
      translate("DECEMBER"),
    ],
    todayButton: false,
    clearButton: false,
  };
};

class DateColumn extends TextColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      12,
      DATE_PATTERN
    );
  }

  initialise(dte) {
    dte = super.initialise(dte);
    if (!dte.readOnly) {
      dte.DatePickerX.init(dateOptions());
    }
    return dte;
  }

  getControlValue(dte) {
    let value = dte.DatePickerX ? dte.DatePickerX.getValue() : dte.value;
    return value ? new Date(value).toISOString().replace(/T.*/, "") : undefined;
  }

  setControlValue(dte, value) {
    if (!dte.disabled) {
      dte.DatePickerX.setValue(value);
    }
    dte.value = value
      ? new Date(value).toLocaleDateString(getLanguage())
      : undefined;
  }
}

class FileColumn extends Column {
  constructor(heading, fieldName, fieldGetter, mask, editable, required) {
    super(heading, fieldName, fieldGetter, undefined, editable, required, 20);
    this.mask = mask;
  }

  createControl(row, className) {
    let column = this;

    let img = document.createElement("img");
    img.id = getFieldId(row.id, column.fieldName);
    img.className = "img-display";
    img.addEventListener("click", (e) => column.showContent(e), false);

    if (column.editable !== Editable.NEVER) {
      let bar = document.createElement("div");
      bar.className = "img-button";
      img.append(bar);

      let add = createButton("add", "add", undefined, "img-button");
      add.id = img.id + "_add";
      add.disabled = true;
      add.addEventListener(
        "click",
        (e) => column.updateFile(e, link, row.refresh),
        false
      );
      add.setAttribute("data-attribute", refresh);
      bar.appendChild(add);

      let del = createButton("delete", "delete", undefined, "img-button");
      del.id = img.id + "_delete";
      del.disabled = true;
      del.addEventListener(
        "click",
        (e) => column.removeFile(e, img, link, row.refresh),
        false
      );
      del.setAttribute("data-attribute", refresh);
      bar.appendChild(del);
    }

    return img;
  }

  bind(row, entity, editMode) {
    let column = this;

    let src = column.fieldGetter(entity, column.fieldName);
    let link = actionLink(entity, column.fieldName);

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img) {
      img.src = src;

      let add = document.getElementById(imgId + "_add");
      if (add) {
        add.disabled =
          shouldDisable(column.editable, editMode, img.src) || !link;
        add.style.visibility = link ? "visible" : "hidden";
      }

      let del = document.getElementById(imgId + "_del");
      if (del) {
        del.disabled =
          shouldDisable(column.editable, editMode, img.src) ||
          !link ||
          !img.src;
        del.style.visibility = link ? "visible" : "hidden";
      }
    }

    return img;
  }

  getControlValue(img) {
    return img.src;
  }

  updateFile(event, img, uploadUrl, refresh) {
    let column = this;
    let cell = img.parentElement;

    let file = document.createElement("input");
    file.type = "file";
    file.style.display = "none";
    file.accept = column.mask;
    file.multiple = false;
    cell.appendChild(file);

    let update = (s) => {
      s.target.parent.removeChild(s.target);
      if (s.target.files[0]) {
        let reader = new FileReader();
        reader.onload = (r) =>
          uploadFile(
            uploadUrl,
            r.target.result,
            refresh,
            reportError(uploadUrl, error)
          );
        reader.onerror = (r) => {
          reader.abort();
          reportError("readFile", translate("BADFILE", [s.target.files[0], r]));
        };
        reader.readAsDataURL(s.target.files[0]);
      }
    };

    file.addEventListener("change", (e) => update(e), false);
    file.addEventListener("blur", (e) => update(e), false);
    file.click();
    file.addEventListener("click", (e) => update(e), false);
  }

  async removeFile(event, deleteUrl, refresh) {
    await deleteRest(deleteUrl, refresh, reportError(deleteUrl, error));
  }

  showContent(arg) {
    // Do nothimg.
  }
}

class ImageColumn extends FileColumn {
  constructor(heading, fieldName, fieldGetter, editable, required) {
    super(heading, fieldName, fieldGetter, "image/*", editable, required);
  }

  showContent(file) {
    let img = document.createElement("img");
    img.className = "display-img";
    img.src = file;
    showModal(img);
  }

  setControlValue(img, value) {
    img.src = value ? value : imageSource("add-picture");
  }
}

class PdfColumn extends FileColumn {
  constructor(heading, fieldName, fieldGetter, editable, required) {
    super(
      heading,
      fieldName,
      fieldGetter,
      "application/pdf",
      editable,
      required
    );
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
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    dropDown,
    editable,
    required,
    dropSize = 5
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      length
    );
    this.dropDown = dropDown;
    this.dropSize = dropSize;
  }

  initialise(sel) {
    sel = super.initialise(sel);

    if (sel.readOnly) {
      sel.type = "text";
    } else {
      sel.type = "select";

      let column = this;

      if (!column.required) {
        addOption(sel, undefined, translate("NICHT_BENOTIGT"));
      }

      for (let opt of dropDown.options) {
        addOption(sel, opt.value, opt.display, opt.tooltip, opt.abbildung);
      }
    }
  }

  setControlValue(sel, value) {
    let column = this;

    if (value) {
      let dropDown = column.dropDown;

      for (let opt of dropDown.options) {
        if (opt.value === value) {
          sel.value = opt.display;
        }
      }
    }
  }
}

class AutoCompleteColumn extends SelectColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    dropDown,
    editable,
    required,
    length,
    dropSize
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      dropDown,
      editable,
      required,
      length,
      dropSize
    );
  }

  bind(row, entity, editMode) {
    let sel = super.bind(row, entity, editMode);

    if (!sel.disabled) {
      let column = this;

      sel.addEventListener(
        "click",
        (e) => {
          column.open(e);
        },
        false
      );
      sel.addEventListener(
        "input",
        (e) => {
          column.open(e);
        },
        false
      );
      sel.addEventListener(
        "keydown",
        (e) => {
          column.keydown(e);
        },
        false
      );
      sel.classList.add("autocomplete");
    }

    return sel;
  }

  getControlValue(sel) {
    return sel.getAttribute("data-value")
      ? sel.getAttribute("data-value")
      : undefined;
  }

  open(event) {
    let column = this;

    let inp = event.target;
    let div = inp.parentElement;

    if (!inp.value) {
      return false;
    }

    event.stopPropagation();
    closeAutoLists();

    let rect = div.getBoundingClientRect();

    let autoComp = document.createElement("div");
    autoComp.className = "autocomplete-list";
    autoComp.style.top = rect.y + rect.height;
    div.appendChild(autoComp); // turn into dialog?

    let dims = valueAndUnits(getComputedStyle(autoComp).lineHeight);

    column.dropDown.options
      .filter((o) => o.display.toLowerCase().includes(inp.value.toLowerCase()))
      .slice(0, column.dropSize)
      .forEach((o) => {
        let autoItem = document.createElement("div");
        autoItem.setAttribute("data-value", o.value);
        autoItem.className = "autocomplete-items";
        autoItem.style.top = dims.value * i + dims.units;
        addText(
          autoItem,
          o.display.replace(/txt/i, "<strong>" + inp.value + "</strong>")
        );
        autoItem.addEventListener(
          "click",
          (e) => {
            column.click(e);
          },
          false
        );
        autoComp.appendChild(autoItem);
      });
  }

  keydown(e) {
    let column = this;

    let autoComps = e.target.parentElement.getElementsByClassName(
      "autocomplete-list"
    );

    if (!autoComps || !autoComps.length) {
      return;
    }

    let autoComp = autoComps[0];

    if (e.keyCode === 40) {
      column.addActive(ctl, autoComp, true);
    } else if (e.keyCode === 38) {
      column.addActive(ctl, autoComp, false);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      column.selectActive(autoComp);
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
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    dropDown,
    editable,
    required,
    length,
    dropSize
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      dropDown,
      editable,
      required,
      length + 3.5,
      dropSize
    );
  }

  initialise(inp) {
    let column = this;

    let sel = document.createElement("select");
    sel.size = 1;
    column.addOptions(sel, column.dropDown);
    sel.selectedIndex = -1;
    return sel;
  }

  getControlValue(select) {
    return select.selectedIndex >= 0
      ? select.options[select.selectedIndex].value
      : undefined;
  }

  setControlValue(sel, value) {
    if (value) {
      sel.value = value;
      for (let opt of sel.options) {
        if (opt.value === value) {
          opt.selected = true;
        }
      }
    }
  }
}

class ThumbColumn extends VirtualColumn {
  constructor(tableName, fieldName, fieldGetter, count = 8) {
    super();
    this.tableName = tableName;
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.count = count;
  }

  addHeading(headerRow) {
    let column = this;
    let place = document.getElementById(column.tableName);

    if (place) {
      removeChildren(place);
      let width = 100 / column.count;
      for (let i = 0; i < count; i++) {
        let cell = document.createElement("div");
        cell.id = getFieldId(getRowId(column.tableName, i), column.fieldName);
        cell.class = "thumb-container";
        setWidths(cell, width + "%");
        table.appendChild(cell);
      }
    }
  }

  bind(row, entity, editMode) {
    let column = this;
    let img = document.getElementById(getFieldId(row.id, this.fieldName));

    if (img) {
      img.src = column.fieldGetter(entity, column.fieldName);
    }

    return img;
  }
}
