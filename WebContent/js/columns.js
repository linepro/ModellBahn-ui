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
    ctl.autoclose = "off";
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
      Math.max(max.toString().length, heading.length)
    );
    this.max = max;
    this.min = min;
    this.places = places;
    this.localize = localize;
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
    if (value) {
      num.value = column.places ? value.toFixed(column.places) : value;
      //value.toLocaleString(getLanguage(), { minimumFractionDigits: column.places, maximumFractionDigits: column.places, }) :
    } else {
      num.value =  "";
    }
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
  }

  initialise(rul) {
    rul = super.initialise(rul);
    rul.type = "url";
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

    let wrapper = document.createElement("div");
    wrapper.className = className;
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
      12
    );
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

      datepicker.options.onOpenAndClose((event, isOpening) => {
        if (!isOpening) {
          let date = datepicker.getSelectedDate();
          column.setControlValue(dte, date);
          column.updateEntity(event, row);
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
  }

  bind(row) {
    let column = this;

    let dte = super.bind(row);
    if (dte) {
      let value = column.fieldGetter(row.entity, column.fieldName);
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
      required
    );

    this.dropDown = dropDown; 
    this.dropSize = dropSize;
  }

  displayLength() {
    let column = this;
    return Math.max(column.dropDown.length, column.headingLength);
  }

  getControlValue(sel) {
    return sel.dataset["value"];
  }

  setControlValue(sel, value) {
    if (value) {
      let column = this;
      let options = column.dropDown.options;

      for (let option of options) {
        if (option.value === value) {
          sel.value = option.display;
          sel.dataset["value"] = value;
          return;
        }
      }
    }

    sel.value = "";
    sel.dataset["value"] = "";
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

    column.dropDown
      .options
        .filter((opt) => opt.display.toLowerCase().includes(select.value.toLowerCase()))
          .slice(0, column.dropSize)
          .forEach((opt) => {
            let item = document.createElement("li");
            item.className = "autoselect";
            item.dataset["text"] = opt.display;
            item.dataset["value"] = opt.value;
            item.addEventListener("click", (event) => column.selected(event, row, item), false);
            if (opt.value === item.dataset["value"]) {
               item.classList.add("selected");
            } else {
               item.classList.remove("selected");
            }
            list.appendChild(item);

            if (opt.image) {
              let ico = createImage(opt.image)
              item.appendChild(ico);
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
      let div = inp.parentElement;

      let container = document.createElement("div");
      container.id = inp.id + "_popup"; 
      container.className = "autoclose-container";
      div.appendChild(container);

      addAutoClose(() => div.removeChild(container));

      let select = document.createElement("input");
      select.id = inp.id + "_select";
      select.className = "autoselect";
      select.value = inp.value;
      select.type = "text";
      container.appendChild(select);

      let list = document.createElement("ul");
      list.id = select.id + "_list";
      list.className = "autoselect";
      container.appendChild(list);
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
      required
    );

    this.dropDown = dropDown; 
    this.dropSize = dropSize;
  }

  displayLength() {
    let column = this;
    return Math.max(5, column.headingLength);
  }

  createControl(row, className) {
    let column = this;

    let img = document.createElement("img");
    img.id = getFieldId(row.id, column.fieldName);
    img.className = className;
    img.classList.add("popup");
    img.readOnly = true;
    img.required = column.required;
    img.disabled = true;
    img.style.visibility = "hidden";
    img.addEventListener("click", (event) => column.popup(event, row, img), false);
    img.addEventListener("input", (event) => column.popup(event, row, img), false);
    img.addEventListener("keydown", (event) => column.popup(event, row, img), false);

    let wrapper = document.createElement("div");
    wrapper.className = className;
    wrapper.classList.add("image-select");
    wrapper.style.order = 2;
    wrapper.appendChild(img);
    return wrapper;
  }

  getControlValue(img) {
    return img.dataset["value"];
  }

  setControlValue(img, value) {
    if (value) {
      let column = this;
      let options = column.dropDown.options;

      for (let option of options) {
        if (option.value === value) {
          img.src = option.image;
          img.dataset["value"] = value;
          return;
        }
      }
    }

    img.src = "";
    img.dataset["value"] = undefined;
  }

  selected(event, row, option) {
    event.preventDefault();

    let column = this;

    let img = document.getElementById(getFieldId(row.id, column.fieldName));
    if (img && option) {
      img.src = option.dataset["src"];
      img.alt = option.dataset["value"];
      img.dataset["value"] = option.dataset["value"];
      // event listener should update entity but you never know
      column.fieldSetter(row.entity, option.dataset["value"], column.fieldName);
    }

    document.removeEventListener("keydown", (event) => column.input(event, row, list), false);
    closeAutoClose();
  }

  addOptions(row, img, list) {
    let column = this;

    removeChildren(list);

    column.dropDown
      .options
        .forEach((opt) => {
          let item = document.createElement("li");
          item.className = "image-select";
          item.dataset["src"] = opt.image;
          item.dataset["value"] = opt.value;
          list.appendChild(item);
          item.addEventListener("click", (event) => column.selected(event, row, item), false);
          if (img.dataset["value"] === item.dataset["value"]) {
            item.classList.add("selected");
            item.focus();
           } else {
            item.classList.remove("selected");
           }

          let ico = createImage(opt.image, "image-select");
          ico.alt = opt.value;
          addTooltip(ico, opt.display);
          item.appendChild(ico);
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
            document.removeEventListener("keydown", (event) => column.input(event, row, list), false);
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

      let column = this;
      let div = img.parentElement;

      let container = document.createElement("div");
      container.id = img.id + "_popup"; 
      container.className = "autoclose-container";
      div.appendChild(container);

      let list = document.createElement("ul");
      list.id = img.id + "_list";
      list.className = "image-select";
      container.appendChild(list);

      document.addEventListener("keydown", (event) => column.input(event, row, list), false);

      addAutoClose(() => {
        div.removeChild(container);
        document.removeEventListener("keydown", (event) => column.input(event, row, list), false);
        });

      column.addOptions(row, img, list);
      list.firstChild.focus();
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
      let src = column.fieldGetter(row.entity, column.fieldName);
      img.src = src ? src : "";
    }

    return img;
  }
}
