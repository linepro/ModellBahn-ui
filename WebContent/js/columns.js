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

const actionLink = (entity, rel) =>
  entity && entity._links && entity._links[rel]
    ? entity._links[rel][0].href
    : undefined;

const boxSize = (length) => Math.ceil(length / 2) * 2;

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

const isEditable = (column) => (column.editable !== Editable.NEVER);

const shouldDisable = (editable, editMode, entity) => {
  if (entity) {
    return !((editMode === EditMode.ADD && editable !== Editable.NEVER) ||
             (editMode === EditMode.UPDATE && editable === Editable.UPDATE));
  } else {
    return editable === Editable.NEVER || editMode !== EditMode.ADD;
  }
};

const valueAndUnits = (cssSize) => {
  let dims = /^(\d+)([^\d]+)$/.exec(cssSize);
  return { value: dims[1], units: dims[2] };
};

const setWidths = (element, width) => {
  element.style.width = width;
  element.style.maxWidth = width;
  element.style.minWidth = width;
};

class VirtualColumn {
  constructor(fieldName) {
    this.fieldName = fieldName;
    this.length = 0;
    this.headingLength = 0;
  }

  displayLength() {
    let column = this;
    return column.length;
  }

  addHeading(grid, headerRow) {}

  addFormHeading(grid, row, headerRow) {}

  addFormField(row, width) {
    let column = this;

    return {
      id: getFieldId(row.id, column.fieldName),
      column: column,
      element: undefined
    };
  }

  addTableCell(row) {
    let column = this;

    return {
      id: getFieldId(row.id, column.fieldName),
      column: column,
      element: undefined
    };
  }

  bind(row) {}
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
    super(fieldName);
    this.heading = heading;
    this.headingLength = heading.length;
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.fieldSetter = fieldSetter;
    this.editable = editable;
    this.required = required;
    this.length = Math.max(length, heading.length + 1);
  }

  addHeading(grid, headerRow) {
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

  updateEntity(event, row) {
    let column = this;

    if (row.entity) {
      if (column.fieldSetter) {
        let ctl = document.getElementById(getFieldId(row.id, column.fieldName));
        if (ctl) {
          column.fieldSetter(row.entity, column.getControlValue(ctl), column.fieldName);
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
    ctl.readOnly = column.editable === Editable.NEVER || row.editMode === EditMode.VIEW;
    ctl.required = column.required;
    ctl.addEventListener("change", (event) => column.updateEntity(event, row), false);
    ctl.disabled = true;
    ctl.style.visibility = "hidden";
    return ctl;
  }

  addFormField(row, labelWidth) {
    let column = this;

    let cell = document.createElement("div");
    cell.className = "form-item";
    row.element.append(cell);

    let label = document.createElement("label");
    label.className = "form-label";
    label.appendChild(document.createTextNode(translate(column.heading)));
    setWidths(label, labelWidth + "ch");
    cell.append(label);

    let ctl = column.createControl(row, "form-control");
    label.for = ctl.id;
    ctl.style.order = 2;
    cell.append(ctl);

    return {
      id: ctl.id,
      column: column,
      element: ctl
    };
  }

  addTableCell(row) {
    let column = this;

    let cell = document.createElement("td");
    cell.className = "table-cell";
    row.element.append(cell);

    let ctl = column.createControl(row, "table-cell");
    cell.append(ctl);

    return {
      id: ctl.id,
      column: column,
      element: ctl
    };
  }

  setControlValue(ctl, value) {
    ctl.value = value ? value : "";
  }

  bind(row) {
    let column = this;

    let ctl = document.getElementById(getFieldId(row.id, column.fieldName));
    if (ctl) {
      let value = column.fieldGetter(row.entity, column.fieldName);
      if (row.editMode === EditMode.ADD && !value) {
          // apply the default to a new row
          column.fieldSetter(row.entity, column.getControlValue(ctl), column.fieldName);
      }
      column.setControlValue(ctl, value);
      ctl.disabled = shouldDisable(column.editable, row.editMode, row.entity);
      ctl.style.visibility = row.entity ? "visible" : "hidden";
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
      2
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
    if (column.pattern) {
      txt.pattern = column.pattern
    };
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

const dateFormatter = () => new Intl.DateTimeFormat(getLanguage(), { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });

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
      12
    );
  }

  datePicker(row, dte) {
    if (!dte.disabled) {
      let column = this;

      let startDate = column.getControlValue(dte);
      let dayFormat = dateFormatter().format(new Date(2021, 4, 15))
        .replace("2021","Y")
        .replace("15","d")
        .replace("4","m");

      let datepicker = new TheDatepicker.Datepicker(dte);

      if (startDate) {
        datepicker.options.setInitialDate(isoDate(startDate));
      }

      datepicker.options.setAllowEmpty(true);
      datepicker.options.setAnimateMonthChange(true);
      datepicker.options.setChangeMonthOnSwipe(true);
      datepicker.options.setDaysOutOfMonthVisible(true);
      datepicker.options.setDropdownItemsLimit(200);
      datepicker.options.setFirstDayOfWeek(TheDatepicker.DayOfWeek.Monday);
      datepicker.options.setFixedRowsCount(false);
      datepicker.options.setHideDropdownWithOneItem(true);
      datepicker.options.setHideOnBlur(true);
      datepicker.options.setHideOnSelect(true);
      datepicker.options.setInitialDatePriority(true);
      datepicker.options.setInputFormat(dayFormat);
      datepicker.options.setMaxDate("2100-12-31");
      datepicker.options.setMinDate("1800-01-01");
      datepicker.options.setMonthAndYearSeparated(true);
      datepicker.options.setMonthAsDropdown(true);
      datepicker.options.setMonthShort(false);
      datepicker.options.setPositionFixing(true);
      datepicker.options.setShowCloseButton(true);
      datepicker.options.setShowDeselectButton(true);
      datepicker.options.setShowResetButton(true);
      datepicker.options.setTitle(translate(column.heading));
      datepicker.options.setToggleSelection(false);
      datepicker.options.setYearAsDropdown(true);

      datepicker.options.setCloseHtml("&times;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.Close, translate("CLOSE"));
      datepicker.options.setDeselectHtml("&times;");
      datepicker.options.setGoBackHtml("&lt;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.GoBack, translate("PREVIOUS"));
      datepicker.options.setGoForwardHtml("&gt;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.GoForward, translate("NEXT"));
      datepicker.options.setResetHtml("&olarr;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.Reset, translate("CLEAR"));

      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Monday, translate("MO"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Tuesday, translate("TU"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Wednesday, translate("WE"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Thursday, translate("TH"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Friday, translate("FR"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Saturday, translate("SA"));
      datepicker.options.translator.setDayOfWeekTranslation(TheDatepicker.DayOfWeek.Sunday, translate("SU"));

      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Monday, translate("MONDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Tuesday, translate("TUESDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Wednesday, translate("WEDNESDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Thursday, translate("THURSDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Friday, translate("FRIDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Saturday, translate("SATURDAY"));
      datepicker.options.translator.setDayOfWeekFullTranslation(TheDatepicker.DayOfWeek.Sunday, translate("SUNDAY"));

      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.January, translate("JANUARY"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.February, translate("FEBRUARY"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.March, translate("MARCH"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.April, translate("APRIL"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.May, translate("MAY"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.June, translate("JUNE"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.July, translate("JULY"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.August, translate("AUGUST"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.September, translate("SEPTEMBER"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.October, translate("OCTOBER"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.November, translate("NOVEMBER"));
      datepicker.options.translator.setMonthTranslation(TheDatepicker.Month.December, translate("DECEMBER"));

      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.January, translate("JAN"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.February, translate("FEB"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.March, translate("MAR"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.April, translate("APR"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.May, translate("MAY"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.June, translate("JUN"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.July, translate("JUL"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.August, translate("AUG"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.September, translate("SEP"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.October, translate("OCT"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.November, translate("NOV"));
      datepicker.options.translator.setMonthShortTranslation(TheDatepicker.Month.December, translate("DEC"));

      datepicker.options.onOpenAndClose((event, isOpening) => {
        if (!isOpening) {
          column.setControlValue(dte, datepicker.getSelectedDate());
          column.updateEntity(event, row);
          datepicker.destroy();
        }
      });

      datepicker.selectDate(isoDate(startDate));

      datepicker.render();
    }
  }

  createControl(row, className) {
    let column = this;

    let dte = super.createControl(row, className);
    dte.readOnly = true;
    dte.addEventListener("click", (event) => column.datePicker(row, dte));
    return dte;
  }

  getControlValue(dte) {
    return isoDate(dte.value);
  }

  setControlValue(dte, value) {
    dte.value = value ? dateFormatter().format(Date.parse(value)) : value;
  }

  bind(row) {
    let column = this;

    let dte = super.bind(row);
    if (dte) {
      let value = column.fieldGetter(row.entity, column.fieldName);
      dte.defaultValue = isoDate(value);
    }
  }
}

class FileColumn extends Column {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    mask,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      undefined,
      editable,
      required,
      10
    );

    this.mask = mask;
  }

  createSelector(headerRow) {
    let column = this;

    let selector = document.createElement("input");
    selector.id = getFieldId(headerRow.id, column.fieldName);
    selector.type = "file";
    selector.style.display = "none";
    selector.accept = column.mask;
    selector.multiple = false;
    headerRow.parentElement.parentElement.append(selector);
    column.selector = selector;
  }

  addHeading(grid, headerRow) {
    let column = this;

    super.addHeading(grid, headerRow);

    column.createSelector(headerRow);
 }

  addFormHeading(grid, row, headerRow) {
    let column = this;

    super.addFormHeading(grid, row, headerRow);

    column.createSelector(headerRow);
  }

  addButtons(row, cell, img) {
    let column = this;

    if (isEditable(column.editable)) {
      let add = createButton("add", "add", undefined, "img-button");
      add.id = img.id + "_add";
      add.className = img.className + "-add";
      add.disabled = true;
      add.style.visibility = "hidden";
      add.addEventListener("click", (event) => column.updateFile(event, row), false);
      cell.appendChild(add);

      let del = createButton("delete", "delete", undefined, "img-button");
      del.id = img.id + "_delete";
      del.className = img.className + "-del";
      del.disabled = true;
      del.style.visibility = "hidden";
      del.addEventListener("click", (event) => column.removeFile(event, row), false);
      cell.appendChild(del);
    }
  }
   
  createControl(row, className) {
    let column = this;

    let img = document.createElement("img");
    img.id = getFieldId(row.id, column.fieldName);
    img.className = className;
    img.addEventListener("click", (event) => column.showContent(event, row), false);
    return img;
  }

  addFormField(row, labelWidth) {
    let column = this;

    let cell = document.createElement("div");
    cell.className = "form-item";
    row.element.append(cell);

    let label = document.createElement("label");
    label.className = "form-label";
    label.appendChild(document.createTextNode(translate(column.heading)));
    setWidths(label, labelWidth + "ch");
    cell.append(label);

    let img = column.createControl(row, "form-control");
    label.for = img.id;
    cell.append(img);

    column.addButtons(row, cell, img);

    return {
      id: img.id,
      element: img,
      column: column
    };
  }

  addTableCell(row) {
    let column = this;

    let cell = document.createElement("td");
    cell.className = "table-cell";
    row.element.append(cell);

    let img = column.createControl(row, "table-cell");
    cell.append(img);

    column.addButtons(row, cell, img);

    return {
      id: img.id,
      element: img,
      column: column
    };
  }

  bind(row) {
    let column = this;

    let src = column.fieldGetter(row.entity, column.fieldName);

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img) {
      column.setControlValue(img, src);
      img.style.visibility = row.entity ? "visible" : "hidden";

      let link = actionLink(row.entity, column.fieldName);

      let add = document.getElementById(img.id + "_add");
      if (add) {
        add.disabled = !link;
        add.style.visibility = add.disabled ? "hidden" :  "visible";
      }

      let del = document.getElementById(img.id + "_delete");
      if (del) {
        del.disabled = !(src && link);
        del.style.visibility = del.disabled ? "hidden" :  "visible";
      }
    }

    return img;
  }

  getControlValue(img) {
    return img.src;
  }

  selected(event, row) {
    let column = this;

    let selector = column.selector;

    if (selector.files[0]) {
      let uploadUrl = actionLink(row.entity, column.fieldName);

      upload(
        uploadUrl,
        column.fieldName,
        selector.files[0],
        selector.files[0].name,
        (jsonData) => row.bind(jsonData, row.editMode),
        (error) => reportError(uploadUrl, error)
      );
    }
  }

  updateFile(event, row) {
    let column = this;

    let uploadUrl = actionLink(row.entity, column.fieldName);
    if (uploadUrl) {
      let img = document.getElementById(getFieldId(row.id, column.fieldName));
      if (img) {
        let selector = column.selector;

        selector.removeEventListener("change", (change) => column.selected(change, row), false);
        selector.addEventListener("change", (change) => column.selected(change, row), false);
        selector.click();
      }
    }
  }
 
  async removeFile(event, row) {
    let column = this;

    let deleteUrl = actionLink(row.entity, column.fieldName);
    if (deleteUrl) {
      await deleteRest(
        deleteUrl,
        (jsonData) => row.bind(jsonData, row.editMode),
        (error) => reportError(deleteUrl, error)
      );
    }
  }

  showContent(event, row) {
    // Do nothimg.
  }
}

class ImageColumn extends FileColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      "image/*",
      editable,
      required
    );
  }

  showContent(event, row) {
    let column = this;

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img && img.src) {
      let xl = document.createElement("img");
      xl.className = "display-img";
      xl.src = img.src;
      showModal(xl);
    }
  }

  setControlValue(img, value) {
    img.src = value ? value : imageSource("add-picture");
  }
}

class PdfColumn extends FileColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    editable,
    required
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      "application/pdf",
      editable,
      required
    );
  }

  setControlValue(img, value) {
    img.src = value ? imageSource("pdf") : imageSource("add-document");
  }

  showContent(event, row) {
    let column = this;

    let pdf = column.fieldGetter(row.entity, column.fieldName);
    if (pdf) {
      let viewer = pdfViewer();

      viewer.load(pdf);

      showModal(viewer.element, true);
    }
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
      required
    );
    this.dropDown = dropDown;
    this.dropSize = dropSize;
  }

  displayLength() {
    let column = this;
    return Math.max(column.dropDown.length, column.headingLength) + 3.5;
  }

  initialise(inp) {
    let column = this;

    inp = super.initialise(inp);

    if (inp.readOnly) {
      inp.type = "text";
      return inp;
    }

    let sel = document.createElement("select");
    sel.id = inp.id;
    sel.className = inp.className;
    sel.multiple = false;
    sel.size = 1;

    if (!column.required) {
      sel.add(createOption(undefined, translate("NICHT_BENOTIGT")));
    }

    if (column.dropDown.grouped.length) {
      for (let group of column.dropDown.grouped) {
        let grp = createOptGroup(group.name);
        sel.add(grp);
        for (let opt of group.options) {
          sel.add(createOption(opt.value, opt.display, opt.tooltip, opt.abbildung));
        }
      }
    } else {
      for (let opt of column.dropDown.options) {
        sel.add(createOption(opt.value, opt.display, opt.tooltip, opt.abbildung));
      }
    }

    return sel;
  }

  setControlValue(sel, value) {
    if (value) {
      let options = sel.options;

      for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
          sel.selectedIndex = i;
          options[i].selected = true;
          break;
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
      dropSize
    );
  }

  bind(row) {
    let sel = super.bind(row);

    if (!sel.disabled) {
      let column = this;

      sel.addEventListener(
        "click",
        (e) => column.open(e, row),
        false
      );
      sel.addEventListener(
        "input",
        (e) => column.open(e, row),
        false
      );
      sel.addEventListener(
        "keydown",
        (e) => column.keydown(e, row),
        false
      );
      sel.classList.add("autocomplete");
    }

    return sel;
  }

  open(event, row) {
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
        autoItem.className = "autocomplete-items";
        autoItem.style.top = dims.value * i + dims.units;
        addText(
          autoItem,
          o.display.replace(/txt/i, "<strong>" + inp.value + "</strong>")
        );
        autoItem.addEventListener(
          "click",
          (e) => column.click(e, row),
          false
        );
        autoComp.appendChild(autoItem);
      });
  }

  keydown(event, row) {
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

  click(event, row) {
    let column = this;

    let inp = div.getElementsById(getFieldId(row.id, column.fieldName));
    if (inp) {
      inp.value = opt.innerText;
    }
    if (row.entity) {
      if (column.fieldSetter) {
        column.fieldSetter(row.entity, opt.innerText, column.fieldName);
      }
    }

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
    dropSize = 5
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      dropDown,
      editable,
      required,
      dropSize
    );
  }
}

class ThumbColumn extends VirtualColumn {
  constructor(thumbLocation, fieldName, fieldGetter, count = 8) {
    super(fieldName);
    this.thumbLocation = thumbLocation;
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.count = count;
  }

  addHeading(grid, headerRow) {
    let column = this;
    let place = document.getElementById(column.thumbLocation);

    if (place) {
      removeChildren(place);

      let container = document.createElement("div");
      container.id = getFieldId(column.thumbLocation, column.fieldName);
      container.className = "thumb-container";
      place.appendChild(container);

      column.thumbWidth = (100 / column.count)+"%";
      column.finalRow = getRowId(grid.tableId, column.count);
    }
  }

  createThumb(row) {
    let column = this;

    if (row.id < column.finalRow) {
      let container = document.getElementById(getFieldId(column.thumbLocation, column.fieldName));

      let cell = document.createElement("div");
      cell.class = "thumb-item";
      setWidths(cell, column.thumbWidth);
      container.appendChild(cell);

      let img = createImage("");
      img.id = getFieldId(row.id, column.fieldName);
      img.className = "thumb-display";
      cell.appendChild(img);

      return img;
    }
    
    return undefined;
  }

  getFormField(row) {
    let column = this;

    let img = column.createThumb(row);
    if (img) {
      return {
        id: img.id,
        column: column,
        element: img
      };
    }

    return undefined;
  }

  addTableCell(row) {
    let column = this;

    let img = column.createThumb(row);
    if (img) {
      return {
        id: img.id,
        column: column,
        element: img
      };
    }

    return undefined;
  }

  bind(row) {
    let column = this;
    let img = document.getElementById(getFieldId(row.id, column.fieldName));

    if (img) {
      img.src = column.fieldGetter(row.entity, column.fieldName);
    }

    return img;
  }
}
