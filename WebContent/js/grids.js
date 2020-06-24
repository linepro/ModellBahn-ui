// module 'grids.js'
'use strict';

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

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2
};

const DATE_PATTERN = '^(18[2-9][0-9]|19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$';

const URL_PATTERN = '^(?:(http[s]?):\\/\\/)?(\\w+(?:\\.\\w+)*)(?::(\\d+))?(?:\\/(\\w+(?:\\/|\\.\\w+)?))?$';

const defaultRowSetter = (rowId, columns) => {
  let data = {};

  if (document.getElementById(getKeyId(rowId))) {
    columns.forEach(column => {
      if (column.setter) {
        let value = column.getValue(document.getElementById(getFieldId(rowId, column.fieldName)));

        if (value !== undefined) {
          column.setter(data, value, column.fieldName);
        }
      }
    });
  }

  return data;
};

const shouldDisable = (editable, editMode) => {
  if (editable === Editable.NEVER || editMode === EditMode.VIEW) {
    return true;
  }

  return (editable > editMode);
};

const getFieldId = (rowId, fieldName) => {
  return rowId + '_' + fieldName;
};

const getKeyId = (rowId) => {
  return getFieldId(rowId, 'key');
};

const getKeyValue = (rowId) => {
  let keyField = document.getElementById(getKeyId(rowId));
  return keyField.value;
};

const getRowId = (tableId, i) => {
  return tableId + '_' + i;
};

const getCellId = (rowId, column) => {
  if (column.fieldName) {
    return getFieldId(rowId, column.fieldName);
  } else {
    return getFieldId(rowId, 'buttons');
  }
};

const getCellRowId = (cell) => {
  return cell.id.substring(0, cell.id.lastIndexOf('_'));
};

const blankControl = (cell) => {
  let ctl = document.createElement('input');

  ctl.type = 'text';
  ctl.disabled = 'true';
  ctl.readOnly = 'true';
  ctl.required = false;

  cell.appendChild(ctl);
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
    let td = document.createElement(isForm ? 'div' : 'th');
    td.className = isForm ? 'flex-label' : 'table-heading';
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
    return this.getLength() + 'ch';
  }

  getHeaderLength() {
    return boxSize(this.heading.length);
  }

  getWidth() {
    return this.width;
  }

  setWidth(width) {
    this.width = width;
  }

  createControl() {
    let inp = document.createElement('input');
    inp.autocomplete = 'off';
    return inp;
  }

  getControl(cell, entity, editMode) {
    let inp = this.createControl();

    let value;

    if (entity) {
      value = this.entityValue(entity);
    }

    if (value) {
      inp.setAttribute('data-value', value);
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
    chk.type = 'checkbox';
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
    num.type = 'number';
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
      num.value = value.toLocaleString(language(), { minimumFractionDigits: this.places, maximumFractionDigits: this.places } );
    }
  }
}

class PhoneColumn extends Column {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 10);
  }

  createControl() {
    let tel = super.createControl();
    tel.type = 'tel';
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
    txt.type = 'text';
    txt.maxLength = this.length;
    txt.pattern = this.pattern;
    return txt;
  }
}

class URLColumn extends TextColumn {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 60, URL_PATTERN);
  }

  createControl() {
    let rul = super.createControl();
    rul.type = 'url';
    rul.class = 'table-url';
    rul.addEventListener('click', () => { if (rul.value) { window.open(rul.value, '_blank'); } }, false);
    return rul;
  }
}

class DateColumn extends TextColumn {
  constructor(heading, fieldName, getter, setter, editable, required) {
    super(heading, fieldName, getter, setter, editable, required, 12, DATE_PATTERN);
  }

  getControl(cell, entity, editMode) {
    let dte = super.getControl(cell, entity, editMode);

    let value = dte.getAttribute('data-value');

    if (!dte.disabled) {
      dte.DatePickerX.init({
        minDate: new Date('1800-01-01'),
        weekDayLabels: [
          getMessage('MO'), getMessage('TU'), getMessage('WE'),
          getMessage('TH'), getMessage('FR'), getMessage('SA'),
          getMessage('SU')
        ],
        shortMonthLabels: [
          getMessage('JAN'), getMessage('FEB'), getMessage('MAR'),
          getMessage('APR'),
          getMessage('MAY'), getMessage('JUN'), getMessage('JUL'),
          getMessage('AUG'),
          getMessage('SEP'), getMessage('OCT'), getMessage('NOV'),
          getMessage('DEC')
        ],
        singleMonthLabels: [
          getMessage('JANUARY'), getMessage('FEBRUARY'), getMessage('MARCH'),
          getMessage('APRIL'), getMessage('MAY'), getMessage('JUNE'),
          getMessage('JULY'), getMessage('AUGUST'), getMessage('SEPTEMBER'),
          getMessage('OCTOBER'), getMessage('NOVEMBER'), getMessage('DECEMBER')
        ],
        todayButton: false,
        clearButton: false
      });
      dte.DatePickerX.setValue(value);
    }

    return dte;
  }

  setValue(inp, value) {
    if (value) {
      inp.value = new Date(value).toLocaleDateString(language());
    }
  }

  getControlValue(dte) {
    let value = dte.value;

    if (dte.DatePickerX) {
      value = dte.DatePickerX.getValue();
    }

    let iso = value ? new Date(value).toISOString().replace(/T.*/,'') : undefined;

    if (iso) dte.setAttribute('data-value', iso);

    return iso;
  }
}

class FileColumn extends Column {
  constructor(heading, fieldName, getter, mask, editable, required) {
    super(heading, fieldName, getter, undefined, editable, required, 20);
    this.mask = mask;
  }

  getControl(cell, entity, editMode) {
    let img = super.getControl(cell, entity, editMode);
    img.className = 'img-display';
    img.id = cell.id + '_img';

    if (entity) {
      img.addEventListener('click', (e) => {
        let img = e.target;
        let file = img.getAttribute('data-value');
        if (file) { this.showContent(file); }
      }, false);

      let bar = document.createElement('div');
      bar.className = 'img-button';
      cell.append(bar);

      let add = getLink(entity.links, 'update-' + this.fieldName);
      let grid = this.grid;
      let rowId = getCellRowId(cell);

      if (add) {
        let btn = getButton('add', 'add', (e) => { this.select(e, grid, rowId, add.href); });
        btn.className = 'img-button';
        btn.id = cell.id + '_add';
        btn.firstChild.className = 'img-button';
        bar.appendChild(btn);
      }

      let remove = getLink(entity.links, 'delete-' + this.fieldName);

      if (remove) {
        let btn = getButton('delete', 'delete', (e) => { this.remove(e, grid, rowId, remove.href); });
        btn.className = 'img-button';
        btn.id = cell.id + '_delete';
        btn.firstChild.className = 'img-button';
        btn.disabled = !img.getAttribute('data-value');
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
    return document.createElement('img');
  }

  getControlValue(img) {
    return img.getAttribute('data-value') ? img.getAttribute('data-value') : undefined;
  }

  getDisplayLength() {
    return 'auto';
  }

  select(e, grid, rowId, href) {
    let btn = e.target;
    if (btn.tagName === 'IMG') {
      btn = btn.parentElement;
    }
    let link = btn.value;
    let bar = btn.parentElement;
    let cell = bar.parentElement;
    let file = document.createElement('input');
    file.type = 'file';
    file.accept = this.mask;
    file.multiple = false;
    file.setAttribute('data-update', link);
    cell.appendChild(file);
    file.style.display = 'none';
    file.click();
    file.addEventListener('change', (e) => { this.update(e, grid, rowId, href); }, false);
    file.addEventListener('click', (e) => { this.update(e, grid, rowId, href); }, false);
    file.addEventListener('blur', (e) => { this.update(e, grid, rowId, href); }, false);
  }

  remove(e, grid, rowId, href) {
    removeFile(href, grid, rowId);
  }

  update(e, grid, rowId, href) {
    let file = e.target;
    let fileData = file.files[0];
    let cell = file.parentElement;
    cell.removeChild(file);
    if (fileData) { readFile(href, fileData, grid, rowId); }
  }

  showContent(arg) {
    // Do nothimg.
  }
}

class IMGColumn extends FileColumn {
  constructor(heading, fieldName, getter, editable, required) {
    super(heading, fieldName, getter, 'image/*', editable, required);
  }

  showContent(file) {
    let img = document.createElement('img');
    img.className = 'display-img';
    img.src = file;
    showModal(img);
  }

  setValue(img, value) {
    img.src = value ? value : siteRoot() + getImgSrc('add-picture');
  }

}

class PDFColumn extends FileColumn {
  constructor(heading, fieldName, getter, editable, required) {
    super(heading, fieldName, getter, 'application/pdf', editable, required);
  }

  setValue(img, value) {
    img.src = siteRoot() + (value ? getImgSrc('pdf') : getImgSrc('add-document'));
  }

  showContent(pdf) {
    let div = document.createElement('div');
    div.className = 'display-pdf-container';

    let canvas = document.createElement('canvas');
    canvas.className = 'display-pdf-canvas';
    div.appendChild(canvas);

    let bar = document.createElement('div');
    bar.className = 'display-pdf-bar';
    div.appendChild(bar);

    let viewer = new PDFViewer(canvas);

    let prev = getButton('vorig', 'previous', () => { viewer.prevPage(); });
    prev.style.cssFloat = 'left';
    bar.appendChild(prev);

    let next = getButton('nachste', 'next', () => { viewer.nextPage(); });
    next.style.cssFloat = 'right';
    bar.appendChild(next);

    viewer.load(pdf);

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
      addOption(select, undefined, getMessage('NICHT_BENOTIGT'));
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

const closeAutoLists = (elmnt = document) => {
  let autoComp = elmnt.getElementsByClassName('autocomplete-list');
  for (let i = 0; i < autoComp.length; i++) {
    removeChildren(autoComp[i]);
    autoComp[i].parentElement.removeChild(autoComp[i]);
  }
};

document.addEventListener('click', () => { closeAutoLists() }, false);

class AutoCompleteColumn extends SelectColumn {
  constructor(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize) {
    super(heading, fieldName, getter, setter, dropDown, editable, required, length, dropSize);
  }

  getControl(cell, entity, editMode) {
    let sel = super.getControl(cell, entity, editMode);

    if (!sel.disabled) {
      sel.addEventListener('click', (e) => { this.open(e); }, false);
      sel.addEventListener('input', (e) => { this.open(e); }, false);
      sel.addEventListener('keydown', (e) => { this.keydown(e); }, false);
      sel.classList.add('autocomplete');
    }

    return sel;
  }

  getControlValue(sel) {
    return sel.getAttribute('data-value') ? sel.getAttribute('data-value') : undefined;
  }

  options(txt) {
    return this.dropDown.getOptions().filter((o) => {
      return o.display.toLowerCase().includes(txt.toLowerCase());
    }).slice(0, this.dropSize);
  }

  caption(txt, o) {
    return o.display.replace(/inp.value/i, '<strong>' + inp.value + '</strong>');
  }

  open(e) {
    let inp = e.target;
    let sel = this;
    let div = inp.parentElement;

    if (!inp.value) { return false; }

    e.stopPropagation();
    closeAutoLists();

    let rect = div.getBoundingClientRect();

    let autoComp = document.createElement('div');
    autoComp.className = 'autocomplete-list';
    autoComp.style.top = rect.y + rect.height;
    div.appendChild(autoComp);
    let dims = valueAndUnits(getComputedStyle(autoComp).lineHeight);

    let i = 0;
    sel.options(inp.value).forEach((o) => {
      let autoItem = document.createElement('div');
      autoItem.setAttribute('data-value', o.value);
      autoItem.className = 'autocomplete-items';
      autoItem.style.top = (dims.value * i) + dims.units;
      addText(autoItem, sel.caption(inp.value, o));
      autoItem.addEventListener('click', (e) => { this.click(e); }, false);
      autoComp.appendChild(autoItem);
      i++;
    });
  }

  keydown(e) {
    let ctl = this;
    let div = e.target.parentElement;

    let autoComps = div.getElementsByClassName('autocomplete-list');

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
    let inp = div.getElementsByClassName('autocomplete')[0];

    inp.value = opt.innerText;
    inp.setAttribute('data-value', opt.getAttribute('data-value'));

    closeAutoLists();
  };

  addActive(ctl, autoComp, up) {
    let items = autoComp.getElementsByClassName('autocomplete-items');
    let curr = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].classList.contains('autocomplete-active')) {
        if (curr === -1) {
          curr = i;
        }
        items[i].classList.remove('autocomplete-active');
      }
    }

    let next = curr + (up ? 1 : -1);
    if (0 <= next && next <= items.length) {
      items[next].classList.add('autocomplete-active');
    }
  }

  selectActive(autoComp) {
    let active = autoComp.getElementsByClassName('autocomplete-active');
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
    let sel = document.createElement('select');
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
      for (let i = 0; i < sel.options.length; i++) {
        let opt = sel.options[i];
        if (opt.value === value) {
          opt.selected = true;
          return;
        }
      }
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
    let td = document.createElement(isForm ? 'div' : 'th');
    td.className = 'table-heading-btn';

    if (this.headLinkage) {
      this.headLinkage.forEach(linkage => {
        let btn = linkage(grid);
        td.appendChild(btn);
      });
    } else {
      addText(td, ' ');
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

    let ctl = document.createElement('div');

    if (editMode && this.btnLinkage) {
      this.btnLinkage.forEach(linkage => {
        if (entity) {
          let btn = linkage(grid, rowId);
          ctl.appendChild(btn);
        }
      });
    } else {
      addText(ctl, ' ');
    }

    cell.appendChild(ctl);

    return ctl;
  }

  isButtons() {
    return true;
  }
}

const addRow = (grid) => {
  return getButton('add', 'add', () => { grid.addRow() });
};

const deleteRow = (grid, rowId) => {
  return getButton('delete', 'delete', () => { grid.deleteRow(rowId) });
};

const editRow = (grid, rowId) => {
  return getButton('update', 'update', () => { grid.editRow(rowId) });
};

const newRow = (grid) => {
  return getButton('new', 'add', () => { grid.newRow() });
};

const updateRow = (grid, rowId) => {
  return getButton('update', 'save', () => { grid.updateRow(rowId) });
};

const gridButtonColumn = () => {
  return new ButtonColumn([addRow], [updateRow, deleteRow]);
};

const initializeForm = (grid, table) => {
  let maxLabel = 10;

  let parent = table.parentElement;
  let h = document.createElement('H3');
  addText(h, grid.tableId);
  parent.insertBefore(h, parent.firstChild);

  grid.columns.forEach(column => {
    column.setContext(grid, table);
    maxLabel = Math.max(column.getHeaderLength(), maxLabel);
  });

  return maxLabel;
};

const initializeFormHeader = (grid, table) => {
  let header = document.createElement('div');
  header.id = table.id + '_thead';
  header.className = 'fhead';
  table.append(header);

  let headRow = document.createElement('div');
  headRow.className = 'form-head';
  headRow.id = table.id + 'Head';
  header.append(headRow);

  grid.columns.forEach(column => {
    if (column.isButtons()) {
      let th = document.createElement('div');
      th.id = getCellId(getRowId(table.id, 0), column);
      th.className = 'form-heading-btn';
      headRow.append(th);
    }
  });
};

const initializeFormBody = (grid, table, maxLabel) => {
  let body = document.createElement('div');
  body.id = table.id + '_tbody';
  body.className = 'flex-container';
  table.append(body);

  let maxRow = Math.max(grid.rowCount, grid.pageSize);
  for (let rowNum = 0; rowNum < maxRow; rowNum++) {
    initializeFormRow(grid, table, maxLabel);
  }
};

const initializeFormRow = (grid, table, maxLabel) => {
  let body = document.getElementById(table.id + '_tbody');

  let tr = document.createElement('div');
  let rowId = getRowId(table.id, 0);
  tr.className = 'flex-container';
  tr.id = rowId;
  body.append(tr);

  let key = document.createElement('input');
  key.type = 'hidden';
  key.id = getKeyId(rowId);
  key.className = 'flex-control';
  tr.append(key);

  grid.columns.forEach(column => {
    let td = document.createElement('div');

    if (!column.isButtons()) {
      td.className = 'flex-item';

      // TODO: change to label
      let th = column.getHeading(true);
      setWidths(th, maxLabel + 'ch');
      td.append(th);

      let tc = document.createElement('div');
      tc.id = getCellId(rowId, column);
      tc.className = 'flex-control';
      setWidths(tc, column.getDisplayLength());

      addText(tc, ' ');

      td.append(tc);
      tr.append(td);
    }
  });
};

const initializeFormFooter = (grid, table) => {
  let footer = document.createElement('div');
  footer.id = table.id + '_tfoot';
  footer.className = 'ffoot';
  table.append(footer);

  let navRow = document.createElement('div');
  navRow.className = 'form-foot';
  navRow.id = table.id + 'Foot';
  footer.append(navRow);

  let tf = document.createElement('div');
  tf.className = 'form-footer';
  setWidths(tf, '100%');

  addText(tf, ' ');

  navRow.append(tf);
};

const initializeTable = (grid, table) => {
  let tab = document.getElementById(table.id+'Link');

  if (tab) {
    tab.innerText = getMessage(tab.id);
  } else {
    let caption = document.createElement('caption');
    addText(caption, grid.tableId);
    table.appendChild(caption);
  }

  setWidths(table, '100%');

  let colGroup = document.createElement('colgroup');
  setWidths(colGroup, '100%');

  let totalLength = 0;
  grid.columns.forEach(column => {
    column.setContext(grid, table);
    totalLength += column.getLength();
  });

  grid.columns.forEach(column => {
    let col = document.createElement('col');
    let colWidth = Math.floor((column.getLength() * 100) / totalLength) + '%';
    column.setWidth(colWidth);
    setWidths(col, column.getWidth());
    colGroup.append(col);
  });

  table.appendChild(colGroup);
};

const initializeTableHeader = (grid, table) => {
  let header = document.createElement('thead');
  header.id = table.id + '_thead';
  header.className = 'thead';
  table.append(header);

  let headRow = document.createElement('tr');
  headRow.id = table.id + 'Head';
  headRow.className = 'table-head';
  header.append(headRow);

  grid.columns.forEach(column => {
    let th = column.getHeading(false);
    setWidths(th, column.getWidth());

    headRow.append(th);
  });
};

const initializeTableBody = (grid, table) => {
  let body = document.createElement('tbody');
  let rect = table.getBoundingClientRect();
  body.id = table.id + '_tbody';
  body.className = 'tbody';
  setWidths(body, rect.width + 'px');
  table.append(body);

  let maxRow = Math.max(grid.rowCount, grid.pageSize);
  for (let rowNum = 0; rowNum < maxRow; rowNum++) {
    initializeTableRow(grid, table);
  }
};

const initializeTableRow = (grid, table) => {
  let body = table.getElementsByTagName('TBODY')[0];
  let rows = body.getElementsByTagName('TR');

  let tr = document.createElement('tr');
  let rowId = getRowId(table.id, rows.length);
  tr.className = 'table-row';
  tr.id = rowId;
  body.append(tr);

  let key = document.createElement('input');
  key.type = 'hidden';
  key.id = getKeyId(rowId);
  key.className = 'table-cell';
  tr.append(key);

  grid.columns.forEach(column => {
    let td = document.createElement('td');
    td.id = getCellId(rowId, column);
    td.className = column.isButtons() ? 'table-cell-btn' : 'table-cell';
    setWidths(td, column.getWidth());

    addText(td, ' ');

    tr.append(td);
  });
};

const initializeTableFooter = (grid, table) => {
  let footer = document.createElement('tfoot');
  footer.id = table.id + '_tfoot';
  footer.className = 'tfoot';
  table.append(footer);

  let navRow = document.createElement('tr');
  navRow.id = table.id + 'Foot';
  navRow.className = 'table-foot';
  footer.append(navRow);

  grid.columns.forEach(column => {
    let tf = document.createElement('td');
    tf.className = 'table-footer';
    tf.width = column.getWidth();
    setWidths(tf, column.getWidth());

    addText(tf, ' ');

    navRow.append(tf);
  });

  navRow.firstChild.className = 'table-prev';
  navRow.firstChild.id = table.id + 'Prev';

  navRow.lastChild.className = 'table-next';
  navRow.lastChild.id = table.id + 'Next';
};

const initializeGrid = (grid, table) => {
  if (grid.paged === Paged.FORM) {
    let maxLabel = initializeForm(grid, table);

    grid.columns.forEach(column => {
      maxLabel = Math.max(column.getHeaderLength(), maxLabel);
    });

    initializeFormHeader(grid, table);

    initializeFormBody(grid, table, maxLabel);

    initializeFormFooter(grid, table);
  } else {
    initializeTable(grid, table);

    initializeTableHeader(grid, table);

    initializeTableBody(grid, table);

    initializeTableFooter(grid, table);
  }
};

class ItemGrid {
  constructor(pageSize, apiUrl, tableId, columns, paged, editMode = EditMode.VIEW, children = undefined, editForm = undefined, rowSetter = defaultRowSetter, updater = null) {
    this.pageSize = pageSize;
    this.rowCount = pageSize;
    this.apiUrl = apiUrl;
    this.apiRoot = apiUrl;
    this.tableId = tableId;
    this.columns = columns;
    this.paged = paged;
    this.editMode = editMode;
    this.children = children;
    this.editForm = editForm;
    this.rowSetter = rowSetter;
    this.updater = updater;

    this.current = this.apiUrl;

    if (this.apiUrl && !this.parent) {
      let search = new URLSearchParams(location.search);

      if (search.has('new')) {
        this.editMode = EditMode.ADD;
        search.delete('new');
      }

      if (search.has('self')) {
        this.current = search.get('self');
        search.delete('self');
      }

      if (paged === Paged.PAGED) {
        search.set('pageNumber', '0');
        search.set('pageSize', pageSize.toString());
      }

      let searchString = search.toString();

      this.current = this.current + (searchString.length ? '?' + searchString : '');
    }

    this.initialized = false;

    let grid = this;
    if (this.children) {
      this.children.forEach(child => { child.setParent(grid); });
    }
  }

  setParent(parent) {
    this.parent = parent;
    this.apiUrl = parent.apiUrl + '/' + this.apiRoot;
    this.editMode = parent.editMode;
  }

  async init() {
    let grid = this;
    grid.loadData();
  }

  initGrid(rowCount) {
    let grid = this;

    if (!grid.initialized || (rowCount > grid.pageSize)) {
      grid.rowCount = rowCount;

      let place = document.getElementById(grid.tableId);
      removeChildren(place);

      let table = document.createElement(grid.paged === Paged.FORM ? 'div' : 'table');
      table.id = grid.tableId;
      table.className = 'table';
      place.appendChild(table);

      initializeGrid(grid, table);

      grid.initialized = true;
    }
  }

  async loadData() {
    let grid = this;
    if (grid.parent) {
      grid.parent.loadData();
    } else if (grid.editMode === EditMode.ADD) {
      grid.initGrid(grid.rowCount);
      grid.addRow();
    } else {
      grid.getData(grid.current);
    }
  }

  renderRow(rowId, entity, columns, editMode) {

    let key = document.getElementById(getKeyId(rowId));
    key.value = entity ? getLink(entity.links, 'self').href : '';

    columns.forEach(column => {
      let cell = document.getElementById(getCellId(rowId, column));

      removeChildren(cell);

      if (!this.parent && editMode === EditMode.ADD) {
        blankControl(cell);
      } else if (entity || column.isButtons()) {
        column.getControl(cell, entity, editMode);
      } else {
        blankControl(cell);
      }
    });
  }

  renderUpdate(jsonData, rowId) {
    let grid = this;

    if (grid.editMode === EditMode.ADD) {
      let self = getLink(jsonData.links, 'self').href;
      grid.current = self;
      grid.apiUrl = self;
      grid.editMode = EditMode.UPDATE;

      history.replaceState({}, null, window.location.href.replace('new=true', 'self='+self));

      if (grid.children) {
        grid.children.forEach(child => {
          child.editMode = grid.editMode;
          child.setParent(grid);
          child.initGrid(child.rowCount);
          child.addRow();
        });
      }
    }

    grid.renderRow(rowId, jsonData, grid.columns, grid.editMode);
  }

  renderData(jsonData) {
    let grid = this;
    let columns = grid.columns;
    let editMode = grid.editMode;
    let entities = (grid.parent ? jsonData[grid.tableId] : jsonData.entities ? jsonData.entities : [jsonData]);
    let tableId = grid.tableId;

    if (!entities) {
      entities = {};
    }

    let rowCount = grid.paged === Paged.PAGED ? grid.pageSize : Math.max(grid.pageSize, entities.length);

    grid.initGrid(rowCount);

    for (let row = 0; row < rowCount; row++) {
      let rowId = getRowId(tableId, row);

      let entity = (entities.length > 0 && row < entities.length) ? entities[row] : undefined;

      this.renderRow(rowId, entity, columns, editMode);
    }

    let prev = document.getElementById(tableId + 'Prev');

    if (prev) {
      removeChildren(prev);

      let prevLnk = getLink(jsonData.links, 'previous');

      if (prevLnk) {
        prev.appendChild(getButton('vorige', 'prev', () => { grid.getData(prevLnk.href) }));
      } else {
        addText(prev, '');
      }
    }

    let next = document.getElementById(tableId + 'Next');

    if (next) {
      removeChildren(next);

      let nextLnk = getLink(jsonData.links, 'next');

      if (nextLnk) {
        next.appendChild(getButton('nachste', 'next', () => { grid.getData(nextLnk.href) }));
      } else {
        addText(next, '');
      }
    }
  }

  renderJson(jsonData, restUrl) {
    let grid = this;
    let children = grid.children;

    grid.renderData(jsonData);

    if (children) {
      children.forEach(child => {
        child.editMode = grid.editMode;
        child.renderData(jsonData);
      });
    }

    grid.current = restUrl;
  }

  async getData(restUrl) {
    let grid = this;

    fetch(restUrl, { method: 'get', headers: {'Content-type': 'application/json'} })
    .then(response => checkResponse(response))
    .then(jsonData => grid.renderJson(jsonData, restUrl))
    .catch(error => reportError(error));
  }

  rowData(rowId) {
    let grid = this;
    let data = grid.rowSetter(rowId, grid.columns);

    if (Object.entries(data).length) {
      grid.childData(grid, data);
    }

    return data;
  }

  childData(grid, data) {
    if (grid.children && grid.editMode !== EditMode.ADD) {
      grid.children.forEach(child => {
        let childData = child.gridData();

        if (Object.entries(childData).length) {
          data[child.tableId] = child.gridData();
        }
      });
    }
  }

  gridData() {
    let grid = this;
    let data = [];

    for (let row = 0; row < grid.rowCount; row++) {
      let rowData = grid.rowData(getRowId(grid.tableId, row));

      if (Object.entries(rowData).length) {
        data.push(rowData);
      }
    }

    return data;
  }

  getFreeRow(tableId, rowCount) {
    for (let row = 0; row < rowCount; row++) {
      let rowId = getRowId(tableId, row);

      if (!getKeyValue(rowId)) {
        return row;
      }
    }

    return rowCount;
  }

  addRow() {
    let grid = this;
    let columns = grid.columns;
    let rowCount = grid.rowCount;
    let paged = grid.paged;
    let tableId = grid.tableId;
    let rowNum = this.getFreeRow(tableId, rowCount);

    if (paged === Paged.EXPAND) {
      if (rowNum === rowCount) {
        // Add a row at end
        grid.rowCount = rowCount + 1;
        rowNum = grid.rowCount;

        let table = document.getElementById(tableId);

        initializeTableRow(this, table);
      }
    } else if (paged === Paged.PAGED) {
      if (rowNum === rowCount) {
        // the page is full, new page and add at start
        rowNum = 0;
        for (let row = 1; row < rowCount; row++) {
          this.renderRow(getRowId(tableId, row), undefined, columns, EditMode.NEVER);
        }

        let prev = document.getElementById(tableId + 'Prev');

        if (prev) {
          removeChildren(prev);

          prev.appendChild(getButton(prev, grid.current, () => { grid.getData(grid.current) }));
        }

        let next = document.getElementById(tableId + 'Next');

        if (next) {
          removeChildren(next);

          addText(next, '');
        }
      }
    } else {
      // Don't care just use first row.
      rowNum = 0;
    }

    let rowId = getRowId(tableId, rowNum);

    let key = document.getElementById(getKeyId(rowId));
    key.value = '';

    let focusCtl = undefined;
    columns.forEach(column => {
      let td = document.getElementById(getCellId(rowId, column));

      removeChildren(td);

      let ctl = column.getControl(td, undefined, EditMode.ADD);
      if (!focusCtl) {
        focusCtl = ctl;
        ctl.focus();
      }
    });

    let td = document.getElementById(getCellId(rowId, 'buttons'));
    let save = getButton('save', 'save', () => { grid.saveRow(rowId) });
    td.appendChild(save);
    let del = getButton('delete', 'delete', () => { grid.removeRow(rowId) });
    td.appendChild(del);

  }

  async deleteRow(rowId) {
    let grid = this;
    let deleteUrl = getKeyValue(rowId);
    if (deleteUrl) {
      await fetch(deleteUrl,{method: 'DELETE', headers: {'Content-type': 'application/json'}})
      .then(response => checkResponse(response))
      .catch(error => reportError(error));

      grid.loadData();
    } else {
      grid.removeRow(rowId);
    }
  }

  editRow(rowId) {
    let grid = this;
    let selfUrl = getKeyValue(rowId);
    if (selfUrl) {
      window.location.href = grid.editForm + '?self=' + selfUrl;
    }
  }

  newRow() {
    let grid = this;
    window.location.href = grid.editForm + '?new=true';
  }

  removeRow(rowId) {
    let grid = this;
    grid.loadData();
  }

  async saveRow(rowId) {
    let grid = this;
    let saveUrl = grid.apiUrl;
    let data = grid.rowData(rowId);
    let jsonData = JSON.stringify(data);
    if (data) {
      await fetch(saveUrl, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: jsonData
      })
      .then(response => checkResponse(response))
      .then(jsonData => grid.renderUpdate(jsonData, rowId))
      .catch(error => reportError(error));
    }
  }

  async updateRow(rowId) {
    let grid = this;
    let updateUrl = getKeyValue(rowId);
    let data = grid.rowData(rowId);
    let jsonData = JSON.stringify(data);

    if (data) {
      await fetch(updateUrl, {
        method: 'PUT',
        headers: {'Content-type': 'application/json'},
        body: jsonData
      })
      .then(response => checkResponse(response))
      .then(jsonData => grid.renderUpdate(jsonData, rowId))
      .catch(error => reportError(error));
    }
  }
}

class ListEditGrid extends ItemGrid {
  constructor(pageSize, dataType, elementName, columns) {
    super(pageSize, fetchUrl(dataType), elementName, columns.concat([gridButtonColumn()]), Paged.PAGED, EditMode.UPDATE, undefined);
    this.dataType = dataType;
  }

  async init() {
    super.init();

    let h1 = document.getElementById('heading');

    if (h1) {
      h1.text = this.dataType;
    }
  }
}

class NamedItemGrid extends ListEditGrid {
  constructor(dataType, elementName) {
    super(10, dataType, elementName, [NAMEN(), BEZEICHNUNG()]);
  }
}

const updateByFieldValue = async (grid, rowId, column) => {
  let updateUrl = new URL(getKeyValue(rowId));
  let cell = document.getElementById(getCellId(rowId, column));
  let data = column.getValue(cell);

  updateUrl.searchParams.append(column.feildname,data);

  if (data) {
    await fetch(updateUrl.toString(), {
      method: 'PUT',
      headers: {'Content-type': 'application/json'}
    })
    .then(response => checkResponse(response))
    .then(jsonData => grid.renderUpdate(jsonData, rowId))
    .catch(error => reportError(error));
  }
};

