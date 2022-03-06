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

const boxSize = (length, unit) => Math.ceil(length / unit) * unit;

let _AUTO_CLOSURES = [];
const addAutoClose = (closer) => {
  _AUTO_CLOSURES.push(closer);
};

const closeAutoClose = () => {
  for (let closure of _AUTO_CLOSURES) {
    closure();
  }
  _AUTO_CLOSURES = [];
};

document.addEventListener("click", () => closeAutoClose(), false);

const getRowId = (tableId, i) => [tableId, i].join("_");

const getFieldId = (rowId, fieldName) => [rowId, fieldName].join("_");

const getCellId = (rowId, fieldName) => getFieldId(rowId, fieldName) + "_field";

const isEditable = (column) => (column.editable !== Editable.NEVER);

const shouldDisable = (editable, editMode, entity) => {
  if (entity) {
    return !((editMode == EditMode.ADD && editable !== Editable.NEVER) ||
             (editMode == EditMode.UPDATE && editable == Editable.UPDATE));
  } else {
    return editable == Editable.NEVER || editMode !== EditMode.ADD;
  }
};

const valueAndUnits = (cssSize) => {
  let dims = /^(\d+)([^\d]+)$/.exec(cssSize);
  return { value: dims[1], units: dims[2] };
};

const setHeights = (element, height, minHeight = height, maxHeight = height) => {
  element.style.height = height;
  element.style.maxHeight = minHeight;
  element.style.minHeight = maxHeight;
};

const setWidths = (element, width, minWidth = width, maxWidth = width) => {
  element.style.width = width;
  element.style.maxWidth = minWidth;
  element.style.minWidth = maxWidth;
};

class VirtualColumn {
  constructor(fieldName, heading = "", length = 0) {
    this.heading = heading;
    this.fieldName = fieldName;
    this.length = length;
  }

  inputLength(unit = 1) {
    let column = this;
    return boxSize(column.length, unit);
  }

  labelLength(unit = 1) {
    let column = this;
    return boxSize(translate(column.heading).length, unit);
  }

  fieldLength(unit = 1) {
    let column = this;
    return boxSize(column.labelLength(unit) + column.inputLength(unit) + 1, unit);
  }

  displayLength(unit = 2) {
    let column = this;
    return Math.max(column.labelLength(unit), column.inputLength(unit));
  }

  addHeading(grid, headerRow) {}

  addFormHeading(grid, row, headerRow) {}

  addFormField(row, unit) {
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
    editable,
    required,
    length
  ) {
    super(fieldName, heading, length ? length : heading.length);
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.fieldSetter = fieldSetter;
    this.editable = editable ? editable : Editable.NEVER;
    this.required = required;
  }

  addHeading(grid, headerRow) {
    let column = this;

    let header = createTh(headerRow, grid.classPrefix + "-heading");
    addText(header, column.heading);
  }

  setTooltip(ctl) {
    let column = this;

    let key = column.fieldName + "_tooltip";
    let tooltip = translate(key);
    if (tooltip && tooltip != key) ctl.title = tooltip;
  }

  initialise(ctl) {
    let column = this;

    ctl.autoclose = "off";
    ctl.name = column.name;
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

    let ctl = createInput("text", undefined, className, getFieldId(row.id, column.fieldName));
    ctl = column.initialise(ctl);
    ctl.readOnly = column.editable == Editable.NEVER || row.editMode == EditMode.VIEW;
    ctl.required = column.required;
    ctl.addEventListener("change", (event) => column.updateEntity(event, row), false);
    ctl.disabled = true;
    ctl.style.visibility = "hidden";
    column.setTooltip(ctl);
    return ctl;
  }

  addFormField(row, unit) {
    let column = this;
    let c = column.fieldLength(unit);
    let cell = createDiv(row.element, row.classPrefix + "-item", getCellId(row.id, column.fieldName));
    setWidths(cell, c + "em");

    let label = createTextElement("label", cell, column.heading, row.classPrefix + "-label");
    label.for = row.classPrefix + "-control";
    setWidths(label, (c - column.inputLength(unit)) + "em");

    let ctl = column.createControl(row, row.classPrefix + "-control");
    cell.append(ctl);

    return {
      id: ctl.id,
      column: column,
      element: ctl
    };
  }

  addTableCell(row) {
    let column = this;

    let cell = createTd(row.element, row.classPrefix + "-cell");

    let ctl = column.createControl(row, row.classPrefix + "-cell");
    cell.append(ctl);

    return {
      id: ctl.id,
      column: column,
      element: ctl
    };
  }

  setControlValue(ctl, value) {
    ctl.value = value ? value : "";
    ctl.dispatchEvent(new Event("input"));
  }

  bind(row) {
    let column = this;

    let ctl = document.getElementById(getFieldId(row.id, column.fieldName));
    if (ctl) {
      let value = column.fieldGetter(row.entity);
      if (row.editMode == EditMode.ADD && !value) {
          // apply the default to a new row
          column.fieldSetter(row.entity, column.getControlValue(ctl));
      }
      column.setControlValue(ctl, value);
      ctl.disabled = shouldDisable(column.editable, row.editMode, row.entity);
      ctl.style.visibility = row.entity ? ctl.parentElement.style.visibility : "hidden";
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
    this.type = "checkbox";
  }

  initialise(chk) {
    let column = this;

    chk = super.initialise(chk);
    chk.type = column.type;
    chk.classList.add(column.fieldName);
    return chk;
  }

  getControlValue(chk) {
    return chk.checked;
  }

  setControlValue(chk, value) {
    chk.checked = value;
    chk.dispatchEvent(new Event("input"));
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
    places = 0,
    localize = true
  ) {
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      Math.max((max.toFixed(places).length * 1.5) + (editable ? 2 : 0), 10)
    );
    this.max = max;
    this.min = min;
    this.places = places;
    this.localize = localize;
    this.type = "number";
  }

  initialise(num) {
    let column = this;

    num = super.initialise(num);
    num.type = column.type;
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
    if (value) {
      num.value = column.places ? value.toFixed(column.places) : value;
      //value.toLocaleString(getLanguage(), { minimumFractionDigits: column.places, maximumFractionDigits: column.places, }) :
    } else {
      num.value =  "";
    }
    num.dispatchEvent(new Event("input"));
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
    super(
      heading,
      fieldName,
      fieldGetter,
      fieldSetter,
      editable,
      required,
      10);
    this.type = "tel";
  }

  initialise(tel) {
    tel = super.initialise(tel);
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
    pattern = undefined
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
    this.type = "text";
  }

  initialise(txt) {
    let column = this;

    txt = super.initialise(txt);
    txt.type = column.type;
    txt.maxLength = column.length;
    if (column.pattern) {
      txt.pattern = column.pattern;
    }
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
    this.type = "url";
  }

  initialise(rul) {
    rul = super.initialise(rul);
    rul.type = column.type;
    rul.class = "table-url";
    rul.addEventListener("click", () => {
        if (rul.value) {
          window.open(rul.value, "_blank");
        }
      },
      false);
    return rul;
  }
}

class PopupColumn extends TextColumn {
  constructor(
    heading,
    fieldName,
    fieldGetter,
    fieldSetter,
    editable,
    required,
    length
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
  }

  popup(event, row, ctl) {
    if (!ctl.disabled) {
      event.stopPropagation();
      closeAutoClose();
    }
  }

  createControl(row, className) {
    let column = this;

    let ctl = super.createControl(row, className);
    ctl.classList.add("popup");
    ctl.readOnly = true;
    ctl.addEventListener("click", (event) => column.popup(event, row, ctl), false);
    ctl.addEventListener("input", (event) => column.popup(event, row, ctl), false);
    ctl.addEventListener("keydown", (event) => column.popup(event, row, ctl), false);

    let wrapper = createDiv(undefined, className);
    wrapper.style.order = 2;
    wrapper.appendChild(ctl);
    return wrapper;
  }
}

class DateColumn extends PopupColumn {
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
      14
    );
    this.type = "date";
  }

  popup(event, row, dte) {
    if (!dte.disabled) {
      let column = this;

      let datepicker = new TheDatepicker.Datepicker(dte);
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
      datepicker.options.setInputFormat(_LOCAL_DATE_FORMAT);
      datepicker.options.setMaxDate("2100-12-31");
      datepicker.options.setMinDate("1800-01-01");
      datepicker.options.setMonthAndYearSeparated(true);
      datepicker.options.setMonthAsDropdown(true);
      datepicker.options.setMonthShort(false);
      datepicker.options.setPositionFixing(true);
      datepicker.options.setShowCloseButton(true);
      datepicker.options.setShowDeselectButton(false);
      datepicker.options.setShowResetButton(true);
      datepicker.options.setTitle(translate(column.heading));
      datepicker.options.setToggleSelection(false);
      datepicker.options.setYearAsDropdown(true);

      datepicker.options.setCloseHtml("&times;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.Close, translate("CLOSE"));
      datepicker.options.setDeselectHtml("&times;");
      datepicker.options.setGoBackHtml("&lt;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.GoBack, translate("VORIGE"));
      datepicker.options.setGoForwardHtml("&gt;");
      datepicker.options.translator.setTitleTranslation(TheDatepicker.TitleName.GoForward, translate("NACHSTE"));
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

      datepicker.options.onOpenAndClose((e, isOpening) => {
        if (!isOpening) {
          let date = datepicker.getSelectedDate();
          column.setControlValue(dte, date);
          column.updateEntity(e, row);
          datepicker.destroy();
        }
      });

      let startDate = column.getControlValue(dte);
      if (startDate) {
        let initialDate = startDate.toISOString().substring(0, 10); 
        datepicker.options.setInitialDate(initialDate);
        datepicker.selectDate(initialDate);
      }

      datepicker.render();
    }
  }

  createControl(row, className) {
    return super.createControl(row, className + "-picker");
  }

  getControlValue(dte) {
    return localStringToDate(dte.value);
  }

  setControlValue(dte, value) {
    dte.value = dateToLocalString(value);
    dte.dispatchEvent(new Event("change"));
  }

  bind(row) {
    let column = this;

    let dte = super.bind(row);
    if (dte) {
      let value = column.fieldGetter(row.entity);
      dte.defaultValue = dateToLocalString(value);
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
      11
    );

    this.mask = mask;
    this.minWidth = "11rem";
    this.type = "file";
  }

  createSelector(headerRow) {
    let column = this;

    let selector = createInput("file", undefined, undefined, getFieldId(headerRow.id, column.fieldName));
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
      // button shares class with image so need to sort it out
      let add = createButton(cell, "add", "add", (event) => column.updateFile(event, row), "img-button", img.id + "_add");
      add.className = img.className + "-add";
      add.disabled = true;
      add.style.visibility = "hidden";

      // button shares class with image so need to sort it out
      let del = createButton(cell, "delete", "delete", (event) => column.removeFile(event, row), "img-button", img.id + "_delete");
      del.className = img.className + "-del";
      del.disabled = true;
      del.style.visibility = "hidden";
    }
  }
   
  createControl(row, className) {
    let column = this;

    let img = createImage(undefined, className);
    img.id = getFieldId(row.id, column.fieldName);
    img.addEventListener("click", (event) => column.showContent(event, row), false);
    return img;
  }

  addFormField(row, unit) {
    let column = this;

    let cell = createDiv(row.element, "form-item");
    setWidths(cell, column.fieldLength(unit) + "em");

    let label = createTextElement("label", cell, column.heading, "form-label");
    setWidths(label, column.labelLength(unit) + "em");

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

    let cell = createTd(row.element, row.classPrefix + "-cell");

    let img = column.createControl(row, row.classPrefix + "-cell");
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

    let src = column.fieldGetter(row.entity);

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
    let column = this;

    let href = column.fieldGetter(row.entity);

    if (href) {
      let ref = window.open(href, column.heading, "popup");

      if (ref == null || ref.closed) {
        ref = window.open(href, column.heading);
      }

      if (ref != null) {
        ref.focus();
      }
    }
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

    this.type = "image";
  }

  setControlValue(img, value) {
    img.src = value ? value : imageSource("add-picture");
    img.dispatchEvent(new Event("input"));
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

    this.type = "pdf";
  }

  setControlValue(img, value) {
    img.src = value ? imageSource("pdf") : imageSource("add-document");
    img.dispatchEvent(new Event("input"));
  }
}

const nichtBenotigt = (required, options) => required ? options : [dropOption(undefined, translate("NICHT_BENOTIGT"), translate("NICHT_BENOTIGT"), imageSource("na"))].concat(options);

class DropDownColumn extends Column {
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
      dropDown.length + (editable == Editable.NEVER ? 0 : 3.5)
    );

    this.options = dropDown.options;
    this.grouped = dropDown.grouped;
    this.dropSize = (editable == Editable.NEVER) ? 1 : dropSize;
    this.type = "dropDown";
  }

  initialise(inp) {
    let column = this;

    inp = super.initialise(inp);

    if (column.editable == Editable.NEVER) {
      inp.type = "text";
      return inp;
    }

    let sel = createSelect(undefined, inp.className, 1, inp.id);

    if (column.grouped.length) {
      nichtBenotigt(column.required, [])
        .forEach((opt) => sel.add(createOption(opt.value, opt.display, opt.tooltip, opt.abbildung)));

      for (let group of column.grouped) {
        let grp = createOptGroup(group.name);
        sel.add(grp);
        for (let opt of group.options) {
          sel.add(createOption(opt.value, opt.display, opt.tooltip, opt.abbildung));
        }
      }
    } else {
      nichtBenotigt(column.required, column.options)
        .forEach((opt) => sel.add(createOption(opt.value, opt.display, opt.tooltip, opt.abbildung)));
    }

    return sel;
  }

  createControl(row, className) {
    let sel = super.createControl(row, className);
    if (sel.nodeName == "SELECT") {
        let column = this;

        sel.addEventListener("input", (event) => column.updateEntity(event, row), false);
    }
    return sel;
  }

  getControlValue(sel) {
    if (sel.nodeName == "SELECT") {
      return super.getControlValue(sel);
    } else {
      return sel.selectedOptions ? sel.selectedOptions[0].value : "";
    }
  }

  setControlValue(sel, value) {
    let column = this;

    if (sel.nodeName == "SELECT") {
      let index = column.required ? -1 : 0;
      let options = sel.options;

      for (let i = 0; i < options.length; i++) {
        if (options[i].value == value) {
          index = i;
          options[i].selected = true;
        } else {
          options[i].selected = false;
        }
      }
      sel.selectedIndex = index;
    } else {
      let options = column.options;
      for (let option of options) {
        if (value == option.value) {
          sel.value = option.display;
          return;
        }
      }
      sel.value = "";
      sel.dispatchEvent(new Event("change"));
    }
  }
}

class AutoSelectColumn extends PopupColumn {
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
      editable,
      required,
      dropDown.length
    );

    this.options = dropDown.options; 
    this.dropSize = dropSize;
    this.type = "autoselect";
  }

  getControlValue(sel) {
    return sel.dataset["value"];
  }

  setControlValue(sel, value) {
    if (value) {
      let column = this;
      let options = column.options;

      for (let option of options) {
        if (option.value == value) {
          sel.value = option.display;
          sel.dataset["value"] = value;
          sel.dispatchEvent(new Event("input"));
          return;
        }
      }
    }

    sel.value = "";
    sel.dataset["value"] = "";
    sel.dispatchEvent(new Event("input"));
  }

  selected(event, row, option) {
    event.preventDefault();

    let column = this;

    let inp = document.getElementById(getFieldId(row.id, column.fieldName));
    if (inp && option) {
      inp.value = option.dataset["text"];
      inp.dataset["value"] = option.dataset["value"];
      // event listener should update entity but you never know
      column.fieldSetter(row.entity, option.dataset["value"], column.fieldName);
    }

    closeAutoClose();
  }

  addOptions(row, select, list) {
    let column = this;

    removeChildren(list);

    nichtBenotigt(column.required, column.options)
        .filter((opt) => opt.display.toLowerCase().includes(select.value.toLowerCase()))
          .slice(0, column.dropSize)
          .forEach((opt) => {
            let item = createLi(list, "autoselect");
            item.dataset["text"] = opt.display;
            item.dataset["value"] = opt.value;
            item.addEventListener("click", (event) => column.selected(event, row, item), false);
            if (opt.value == item.dataset["value"]) {
               item.classList.add("selected");
            } else {
               item.classList.remove("selected");
            }

            if (opt.image) {
              createImage(item, "autoselect", opt.image);
            }
            addText(item, opt.display);
            addTooltip(item, opt.tooltip);
          });
  }
  
  input(event, row, select, list) {
    if (!(event.atlKey || event.ctrlKey || event.metaKey || event.isComposing)) {
      if (list) {
        let column = this;
        let items = list.children;

        let selected = undefined;
        for (let item of items) {
          if (item.classList.contains("selected")) {
            selected = item;
          }
          item.classList.remove("selected");
        }

        switch (event.key) {
          case "ArrowUp":
            selected = selected ? selected.previousSibling : list.lastChild;
            if (selected) {
              selected.classList.add("selected");
            }
            break;

          case "ArrowDown":
            selected = selected ? selected.nextSibling : list.firstChild;
            if (selected) {
              selected.classList.add("selected");
            }
            break;

          case "Enter":
            column.selected(event, row, selected);
            return;

          case "Escape":
            event.preventDefault();
            closeAutoClose();
            return;

          default:
            break;
        }
      }
    }
  }

  popup(event, row, inp) {
    if (!inp.disabled) {
      closeAutoClose();

      super.popup(event, row, inp);

      let column = this;

      let container = createDiv(inp.parentElement, "autoclose-container", inp.id + "_popup"); 

      addAutoClose(() => inp.parentElement.removeChild(container));

      let select = createInput("text", container, "autoselect", inp.id + "_select");
      select.value = inp.value;

      let list = createUl(container, "autoselect", select.id + "_list");
      select.addEventListener("keydown", (e) => column.input(e, row, select, list), false);
      select.addEventListener("input", () => column.addOptions(row, select, list), false);

      column.addOptions(row, select, list);
      select.focus();
    }
  }
}

class ImageSelectColumn extends PopupColumn {
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
      editable,
      required,
      12
    );

    this.options = dropDown.options; 
    this.dropSize = dropSize;
    this.minWidth = "14rem";
    this.type = "imageSelect";
  }

  createControl(row, className) {
    let column = this;

    let wrapper = createDiv(row.element, className);
    wrapper.classList.add("image-select");

    let img = createImage(wrapper, className + "-select");
    img.id = getFieldId(row.id, column.fieldName);
    img.classList.add("popup");
    img.readOnly = true;
    img.required = column.required;
    img.dataset["disabled"] = true;
    img.style.visibility = "hidden";
    img.addEventListener("click", (event) => column.popup(event, row, img), false);
    img.addEventListener("input", (event) => column.popup(event, row, img), false);
    img.addEventListener("keydown", (event) => column.popup(event, row, img), false);

    return wrapper;
  }

  getControlValue(img) {
    return img.dataset["value"];
  }

  updateImage(img, option) {
    if (option) {
      // could be a li (dataset[]) or a drop option...
      img.src = option.dataset ? option.dataset["src"] : option.image;
      img.alt = option.dataset ? option.dataset["value"] : option.value;
      img.dataset["value"] = option.dataset ? option.dataset["value"] : option.value;
      addTooltip(img.parentElement, option.dataset ? option.dataset["tool"] : option.tooltip);
    } else {
      img.src = "";
      img.alt = "";
      img.dataset["value"] = undefined;
      addTooltip(img.parentElement, undefined);
    }
  }

  setControlValue(img, value) {
    let column = this;

    if (value) {
      let options = column.options;

      for (let option of options) {
        if (option.value == value) {
          column.updateImage(img, option);
          return;
        }
      }
    }

    column.updateImage(img, undefined);
  }

  selected(event, row, option) {
    event.preventDefault();

    let column = this;

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img && option) {
      column.updateImage(img, option);
      // event listener should update entity but you never know
      column.fieldSetter(row.entity, option.dataset["value"], column.fieldName);
    }

    document.removeEventListener("keydown", (e) => column.input(e, row, list), false);
    closeAutoClose();
  }

  addOptions(row, img, list) {
    let column = this;

    removeChildren(list);

    nichtBenotigt(column.required, column.options) 
        .forEach((opt) => {
          let item = createLi(list, "image-select");
          item.dataset["src"] = opt.image;
          item.dataset["value"] = opt.value;
          item.dataset["tool"] = opt.display;

          item.addEventListener("click", (event) => column.selected(event, row, item), false);
          if (img.dataset["value"] == item.dataset["value"]) {
            item.classList.add("selected");
            item.focus();
           } else {
            item.classList.remove("selected");
           }

          if (opt.image) createImage(item, "image-select", opt.image, opt.value);
        });
  }
  
  input(event, row, list) {
    if (!(event.atlKey || event.ctrlKey || event.metaKey || event.isComposing)) {
      if (list) {
        let column = this;
        let items = list.children;

        let selected = undefined;
        for (let item of items) {
          if (item.classList.contains("selected")) {
            selected = item;
          }
          item.classList.remove("selected");
        }

        switch (event.key) {
          case "ArrowUp":
            selected = selected ? selected.previousSibling : list.lastChild;
            if (selected) {
              selected.classList.add("selected");
              selected.scrollIntoView();
            }
            break;

          case "ArrowDown":
            selected = selected ? selected.nextSibling : list.firstChild;
            if (selected) {
              selected.classList.add("selected");
              selected.scrollIntoView();
            }
            break;

          case "Enter":
            column.selected(event, row, selected);
            return;

          case "Escape":
            event.preventDefault();
            document.removeEventListener("keydown", (e) => column.input(e, row, list), false);
            closeAutoClose();
            return;

          default:
            break;
        }
      }
    }
  }

  popup(event, row, img) {
    if (!img.disabled) {
      closeAutoClose();

      super.popup(event, row, img);

      addTooltip(img.parentElement, undefined);

      let column = this;

      let container = createDiv(img.parentElement, "autoclose-container", img.id + "_popup"); 

      let list = createUl(container, "image-select", img.id + "_list");

      document.addEventListener("keydown", (e) => column.input(e, row, list), false);

      addAutoClose(() => {
        img.parentElement.removeChild(container);
        document.removeEventListener("keydown", (e) => column.input(e, row, list), false);
        });

      column.addOptions(row, img, list);
      list.firstChild.focus();
    }
  }
  
  bind(row) {
    let column = this;

    super.bind(row);

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img) {
      img.dataset["disabled"] = shouldDisable(column.editable, row.editMode, row.entity);
    }
  }
}

class ThumbColumn extends VirtualColumn {
  constructor(thumbLocation, fieldName, fieldGetter, count = 8) {
    super(fieldName);
    this.thumbLocation = thumbLocation;
    this.fieldName = fieldName;
    this.fieldGetter = fieldGetter;
    this.count = count;
    this.thumbWidth = (100 / count) + "%";
    this.type = "thumb";
  }

  addHeading(grid, headerRow) {
    let column = this;
    let parent = document.getElementById(column.thumbLocation);

    if (parent) {
      removeChildren(parent);

      createDiv(parent, "thumb-container", getFieldId(column.thumbLocation, column.fieldName));

      column.finalRow = getRowId(grid.tableId, column.count);
    }
  }

  createThumb(row) {
    let column = this;

    if (row.id < column.finalRow) {
      let container = document.getElementById(getFieldId(column.thumbLocation, column.fieldName));

      let cell = createDiv(container, "thumb-item");
      setWidths(cell, column.thumbWidth);

      let img = createImage(cell, "thumb-display");
      img.id = getFieldId(row.id, column.fieldName);

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
      let src = column.fieldGetter(row.entity);
      img.src = src ? src : "";
    }

    return img;
  }
}

class SearchColumn {
  constructor(
    heading,
    fields
  ) {
    this.heading = heading;
    this.fields = fields;
    this.binders = [];
    this.setters = [];
    this.clearers = [];
  }

  create(cell, id) {
    let column = this;

    let defaultWidth = (95 / column.fields.length) + "%";
    column.fields
          .forEach(f => {
            let ctl;
            let binder;
            let setter;
            let clearer;

            switch(f.type)
            {
            case "checkbox": 
              ctl = createCheckBox(cell, "search-cell", getFieldId(id, f.fieldName), true);

              binder = (params) => params.has(f.fieldName) ? ctl.checked = params.get(f.fieldName) : ctl.checked = false, ctl.indeterminate = true;
              setter = (params) => ctl.indeterminate ? params.delete(f.fieldName) : params.set(f.fieldName, ctl.checked);
              clearer = () => ctl.checked = false, ctl.indeterminate = true;
              break;

            case "select": 
              ctl = createSelect(cell, "search-cell", getFieldId(id, f.fieldName));
              ctl.add(createOption(undefined, ""));
              f.dropDown
               .options
               .forEach(opt => ctl.add(createOption(opt.value, opt.display)));

              binder = (params) => {
                if (params.has(f.fieldName)) {
                  let value = params.get(f.fieldName);
                  for (let i = 0; i < ctl.options.length; i++) {
                    if (ctl.options[i].value == value) {
                      ctl.selectedIndex = i;
                      return;
                    }
                  }
                }
                ctl.selectedIndex = 0;
              };
              setter = (params) => ctl.selectedIndex > 0 ? params.set(f.fieldName, ctl.value) : params.delete(f.fieldName);
              clearer = () => ctl.selectedIndex = 0;
              break;

            default:
              ctl = createInput("text", cell, "search-cell", getFieldId(id, f.fieldName));

              if (f.type == "date") { 
                ctl.pattern = "((?>19|20|21)[0-9]{2}-(?>0[1-9]|1[0-2]){1}-(?>0[1-9]|[1-2][0-9]|3[0-1]))( (?>[0-1][0-9]|2[0-3]){1}:(?>[0-5][0-9]){1}:(?>[0-5][0-9]){1}){0,1}";
              } else if (f.type == "number") { 
                ctl.pattern = "[0-9]+(.[0-9]+){0,1}";
              }

              binder = (params) => params.has(f.fieldName) ? ctl.value = params.get(f.fieldName) : ctl.value = "";
              setter = (params) => ctl.value ?  params.set(f.fieldName, ctl.value) : params.delete(f.fieldName);
              clearer = () => ctl.value = "";
              break;
            }

            ctl.style.width = f.width ? f.width : defaultWidth;

            column.binders.push(binder);
            column.setters.push(setter);
            column.clearers.push(clearer);
          });
  }

  bind(searchParams) {
    let column = this;

    column.binders
          .forEach(b => b(searchParams));
  }

  clear() {
    let column = this;

    column.clearers
          .forEach(c => c());
  }

  apply(searchParams) {
    let column = this;

    column.setters
          .forEach(s => s(searchParams));
  }
}