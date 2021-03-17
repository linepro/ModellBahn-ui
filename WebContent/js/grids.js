// module "grids.js";
"use strict";

const setWidths = (element, width) => {
  element.width = width;
  element.style.width = width;
  element.style.maxWidth = width;
  element.style.minWidth = width;
};

const blankControl = (cell) => {
  let ctl = document.createElement("input");
  ctl.type = "text";
  ctl.disabled = "true";
  ctl.readOnly = "true";
  ctl.required = false;
  cell.appendChild(ctl);
};

const actionLink = (entity, rel) => {
  if (!entity || !entity.links || !entity.links[rel]) {
    return undefined;
  }
  return links[rel][0].href;
};

const defaultRowSetter = (rowId, columns) => {
  let data = {};

  if (document.getElementById(getKeyId(rowId))) {
    columns.forEach((column) => {
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

const getKeyValue = (rowId) => document.getElementById(getKeyId(rowId)).value;

const getRowId = (tableId, i) => tableId + "_" + i;

const getFieldId = (rowId, fieldName) => rowId + "_" + fieldName;

const getKeyId = (rowId) => getFieldId(rowId, "key");

const getCellId = (rowId, column) => {
  if (column.fieldName) {
    return getFieldId(rowId, column.fieldName);
  } else {
    return getFieldId(rowId, "buttons");
  }
};

const getCellRowId = (cell) => cell.id.substring(0, cell.id.lastIndexOf("_"));

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2
};

const addRow = (grid) => createButton("add", "add", () => grid.addRow());

const deleteRow = (grid, rowId) =>  createButton("delete", "delete", () => grid.deleteRow(rowId));

const editRow = (grid, rowId) =>  createButton("update", "update", () => grid.editRow(rowId));

const newRow = (grid) => createButton("new", "add", () => grid.newRow());

const updateRow = (grid, rowId) => createButton("update", "save", () => grid.updateRow(rowId));

const updateValue = (grid, rowId, column) => createButton("update", "update", () => grid.updateRow(rowId, column));

const gridButtonColumn = () => new ButtonColumn([addRow], [updateRow, deleteRow]);


const initializeForm = (grid, table) => {
  let maxLabel = 10;

  let parent = table.parentElement;
  let h = document.createElement("H3");
  addText(h, grid.tableId);
  parent.insertBefore(h, parent.firstChild);

  grid.columns.forEach(column => {
    column.setContext(grid, table);
    maxLabel = Math.max(column.getHeaderLength(), maxLabel);
  });

  return maxLabel;
}

const initializeFormHeader = (grid, table) => {
  let header = document.createElement("div");
  header.id = table.id + "_thead";
  header.className = "fhead";
  table.append(header);

  let headRow = document.createElement("div");
  headRow.className = "form-head";
  headRow.id = table.id + "Head";
  header.append(headRow);

  grid.columns.forEach(column => {
    if (column.isButtons()) {
      let th = document.createElement("div");
      th.id = getCellId(getRowId(table.id, 0), column);
      th.className = "form-heading-btn";
      headRow.append(th);
    }
  });
}

const initializeFormBody = (grid, table, maxLabel) => {
  let body = document.createElement("div");
  body.id = table.id + "_tbody";
  body.className = "flex-container";
  table.append(body);

  let maxRow = Math.max(grid.rowCount, grid.pageSize);
  for (let rowNum = 0; rowNum < maxRow; rowNum++) {
    initializeFormRow(grid, table, maxLabel);
  }
}

const initializeFormRow = (grid, table, maxLabel) => {
  let body = document.getElementById(table.id + "_tbody");

  let tr = document.createElement("div");
  let rowId = getRowId(table.id, 0);
  tr.className = "flex-container";
  tr.id = rowId;
  body.append(tr);

  let key = document.createElement("input");
  key.type = "hidden";
  key.id = getKeyId(rowId);
  key.className = "flex-control";
  tr.append(key);

  grid.columns.forEach(column => {
    let td = document.createElement("div");

    if (!column.isButtons()) {
      td.className = "flex-item";

      // TODO: change to label;
      let th = column.getHeading(true);
      setWidths(th, maxLabel + "ch");
      td.append(th);

      let tc = document.createElement("div");
      tc.id = getCellId(rowId, column);
      tc.className = "flex-control";
      setWidths(tc, column.getDisplayLength());

      addText(tc, " ");

      td.append(tc);
      tr.append(td);
    }
  });
}

const initializeFormFooter = (grid, table) => {
  let footer = document.createElement("div");
  footer.id = table.id + "_tfoot";
  footer.className = "ffoot";
  table.append(footer);

  let navRow = document.createElement("div");
  navRow.className = "form-foot";
  navRow.id = table.id + "Foot";
  footer.append(navRow);

  let tf = document.createElement("div");
  tf.className = "form-footer";
  setWidths(tf, "100%");

  addText(tf, " ");

  navRow.append(tf);
}

const initializeTable = (grid, table) => {
  let tab = document.getElementById(table.id+"Link");

  if (tab) {
    tab.innerText = translate(tab.id);
  } else {
    let caption = document.createElement("caption");
    addText(caption, grid.tableId);
    table.appendChild(caption);
  }

  setWidths(table, "100%");

  let colGroup = document.createElement("colgroup");
  setWidths(colGroup, "100%");

  let totalLength = 0;
  grid.columns.forEach(column => {
    column.setContext(grid, table);
    totalLength += column.getLength();
  });
  grid.columns.forEach(column => {
    let col = document.createElement("col");
    let colWidth = Math.floor((column.getLength() * 100) / totalLength) + "%";
    column.setWidth(colWidth);
    setWidths(col, column.getWidth());
    colGroup.append(col);
  });

  table.appendChild(colGroup);
}

const initializeTableHeader = (grid, table) => {
  let header = document.createElement("thead");
  header.id = table.id + "_thead";
  header.className = "thead";
  table.append(header);

  let headRow = document.createElement("tr");
  headRow.id = table.id + "Head";
  headRow.className = "table-head";
  header.append(headRow);

  grid.columns.forEach(column => {
    let th = column.getHeading(false);
    setWidths(th, column.getWidth());

    headRow.append(th);
  });
}

const initializeTableBody = (grid, table) => {
  let body = document.createElement("tbody");
  let rect = table.getBoundingClientRect();
  body.id = table.id + "_tbody";
  body.className = "tbody";
  setWidths(body, rect.width + "px");
  table.append(body);

  let maxRow = Math.max(grid.rowCount, grid.pageSize);
  for (let rowNum = 0; rowNum < maxRow; rowNum++) {
    initializeTableRow(grid, table);
  }
}

const initializeTableRow = (grid, table) => {
  let body = table.getElementsByTagName("TBODY")[0];
  let rows = body.getElementsByTagName("TR");

  let tr = document.createElement("tr");
  let rowId = getRowId(table.id, rows.length);
  tr.className = "table-row";
  tr.id = rowId;
  body.append(tr);

  let key = document.createElement("input");
  key.type = "hidden";
  key.id = getKeyId(rowId);
  key.className = "table-cell";
  tr.append(key);

  grid.columns.forEach(column => {
    let td = document.createElement("td");
    td.id = getCellId(rowId, column);
    td.className = column.isButtons() ? "table-cell-btn" : "table-cell";
    setWidths(td, column.getWidth());

    addText(td, " ");

    tr.append(td);
  });
}

const initializeTableFooter = (grid, table) => {
  let footer = document.createElement("tfoot");
  footer.id = table.id + "_tfoot";
  footer.className = "tfoot";
  table.append(footer);

  let navRow = document.createElement("tr");
  navRow.id = table.id + "Foot";
  navRow.className = "table-foot";
  footer.append(navRow);

  grid.columns.forEach(column => {
    let tf = document.createElement("td");
    tf.className = "table-footer";
    tf.width = column.getWidth();
    setWidths(tf, column.getWidth());

    addText(tf, " ");

    navRow.append(tf);
  });

  navRow.firstChild.className = "table-prev";
  navRow.firstChild.id = table.id + "Prev";

  navRow.lastChild.className = "table-next";
  navRow.lastChild.id = table.id + "Next";
}

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
}

class ItemGrid {
  constructor(pageSize, apiUrl, tableId, columns, paged, editMode = EditMode.VIEW, children = undefined, editForm = undefined, rowSetter = defaultRowSetter, updater = null) {
    this.pageSize = pageSize;
    this.rowCount = pageSize;
    this.apiUrl = apiUrl;
    this.apiUrl = apiUrl;
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

      if (search.has("new")) {
        this.editMode = EditMode.ADD;
        search.delete("new");
      }

      if (search.has("self")) {
        this.current = search.get("self");
        search.delete("self");
      }

      if (paged === Paged.PAGED) {
        search.set("page", "0");
        search.set("size", pageSize.toString());
      }

      let searchString = search.toString();

      this.current = this.current + (searchString.length ? "?" + searchString : "");
    }

    this.initialized = false;

    let grid = this;
    if (this.children) {
      this.children.forEach(child => { child.setParent(grid) });
    }
  }

  setParent(parent) {
    this.parent = parent;
    this.apiUrl = parent.apiUrl + "/" + this.apiUrl;
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

      let table = document.createElement(grid.paged === Paged.FORM ? "div" : "table");
      table.id = grid.tableId;
      table.className = "table";
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
    key.value = entity ? getLink(entity._links, "self") : "";

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
      let self = getLink(jsonData._links, "self");
      grid.current = self;
      grid.apiUrl = self;
      grid.editMode = EditMode.UPDATE;

      history.replaceState({}, null, window.location.href.replace("new=true", "self="+self));

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

  getEntities(jsonData) {
    let grid = this;
    if (!jsonData) {
      return {}
    } else if (grid.parent) {
      return jsonData[grid.tableId];
    } else if (jsonData._embedded && jsonData._embedded.data) {
      return jsonData._embedded.data 
    }

     return [jsonData];
  }

  renderData(jsonData) {
    let grid = this;
    let columns = grid.columns;
    let editMode = grid.editMode;
    let entities = grid.getEntities(jsonData);
    let tableId = grid.tableId;

    let rowCount = grid.paged === Paged.PAGED ? grid.pageSize : Math.max(grid.pageSize, entities.length);

    grid.initGrid(rowCount);

    for (let row = 0; row < rowCount; row++) {
      let rowId = getRowId(tableId, row);

      let entity = (entities.length > 0 && row < entities.length) ? entities[row] : undefined;

      this.renderRow(rowId, entity, columns, editMode);
    }

    let prev = document.getElementById(tableId + "Prev");

    if (prev) {
      removeChildren(prev);

      let prevLnk = getLink(jsonData._links, "prev");

      if (prevLnk) {
        prev.appendChild(createButton("vorige", "prev", () =>  grid.getData(prevLnk)));
      } else {
        addText(prev, "");
      }
    }

    let next = document.getElementById(tableId + "Next");

    if (next) {
      removeChildren(next);

      let nextLnk = getLink(jsonData._links, "next");

      if (nextLnk) {
        next.appendChild(createButton("nachste", "next", () => grid.getData(nextLnk)));
      } else {
        addText(next, "");
      }
    }
  }

  renderJson(jsonData, restUrl) {
    let grid = this;
    let children = grid.children;

    grid.renderData(jsonData);

    if (children) {
      children.forEach((child) => {
        child.editMode = grid.editMode;
        child.renderData(jsonData);
      });
    }

    grid.current = restUrl;
  }

  async getData(restUrl) {
    let grid = this;
    await getRest(restUrl, (jsonData) => grid.renderJson(jsonData, restUrl), (error) => reportError(restUrl, error));
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
        // Add a row at end;
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

        let prev = document.getElementById(tableId + "Prev");

        if (prev) {
          removeChildren(prev);

          prev.appendChild(createButton("vorige", "prev", () => grid.getData(grid.current)));
        }

        let next = document.getElementById(tableId + "Next");

        if (next) {
          removeChildren(next);

          addText(next, "");
        }
      }
    } else {
      // Don"t care just use first row.
      rowNum = 0;
    }

    let rowId = getRowId(tableId, rowNum);

    let key = document.getElementById(getKeyId(rowId));
    key.value = "";

    let focusCtl = undefined;
    columns.forEach((column) => {
      let td = document.getElementById(getCellId(rowId, column));

      removeChildren(td);

      let ctl = column.getControl(td, undefined, EditMode.ADD);
      if (!focusCtl) {
        focusCtl = ctl;
        ctl.focus();
      }
    });

    let td = document.getElementById(getCellId(rowId, "buttons"));
    let save = createButton("update", "save", () => grid.saveRow(rowId));
    td.appendChild(save);
    let del = createButton("delete", "delete", () => grid.removeRow(rowId));
    td.appendChild(del);
  }

  async deleteRow(rowId) {
    let grid = this;
    let deleteUrl = getKeyValue(rowId);
    if (deleteUrl) {
      await deleteRest(deleteUrl, () => grid.loadData(), (error) => reportError("deleteRow", error));
    } else {
      grid.removeRow(rowId);
    }
  }

  editRow(rowId) {
    let grid = this;
    let selfUrl = getKeyValue(rowId);
    if (selfUrl) {
      window.location.href = grid.editForm + "?self=" + selfUrl;
    }
  }

  newRow() {
    let grid = this;
    window.location.href = grid.editForm + "?new=true";
  }

  removeRow(rowId) {
    let grid = this;
    grid.loadData();
  }

  async saveRow(rowId) {
    let grid = this;
    let saveUrl = grid.apiUrl;
    let data = grid.rowData(rowId);
    if (data) {
      await postRest(saveUrl, data, (jsonData) => grid.renderUpdate(jsonData, rowId), (error) => reportError("saveRow", error));
    }
  }

  async updateRow(rowId) {
    let grid = this;
    let updateUrl = getKeyValue(rowId);
    let data = grid.rowData(rowId);
    if (data) {
      await putRest(updateUrl, data, (jsonData) => grid.renderUpdate(jsonData, rowId), (error) => reportError("updateRow", error));
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

    let h1 = document.getElementById("heading");

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
    await putRest(updateUrl.toString(), {}, (jsonData) => grid.renderUpdate(jsonData, rowId), (error) => reportError("updateByFieldValue", error));
  }
}
