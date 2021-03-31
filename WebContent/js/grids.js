// module "grids.js";
"use strict";

const blankControl = (cell) => {
  let ctl = document.createElement("input");
  ctl.type = "text";
  ctl.disabled = "true";
  ctl.readOnly = "true";
  ctl.required = false;
  cell.appendChild(ctl);
};

const defaultRowSetter = (row, columns) => {
  let entity = {};

  if (row.getAttribute("data-attribute")) {
    columns.forEach((column) => {
      if (column.fieldSetter) {
        let value = column.getValue(row);

        if (value !== undefined) {
          column.fieldSetter(entity, value, column.fieldName);
        }
      }
    });
  }

  return entity;
};

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2
};

const addAction = {
    caption: "add",
    image: "add",
    heading: true,
    form: true,
    action: (grid, row, entity) => grid.addRow(actionLink(entity, "add"))
  };


const newAction = {
    caption: "new",
    image: "add",
    heading: true,
    form: true,
    action: (grid, row, entity) => grid.newRow()
  };

const addChildAction = {
    caption: "add",
    image: "add",
    heading: true,
    form: false,
    action: (grid, row, entity, rel) => grid.addRow(actionLink(entity, rel))
  };

const deleteAction = {
    caption: "delete",
    image: "delete",
    heading: false,
    form: false,
    action:(grid, row, entity) => grid.deleteRow(row, actionLink(entity, "delete"))
  };

const editAction = {
    caption: "update",
    image: "update",
    heading: false,
    form: false,
    action: (grid, row, entity) => grid.editRow(actionLink(entity, "self"))
  };

const updateAction = {
    caption: "update",
    image: "save",
    heading: false,
    form: false,
    action: (grid, row, entity) => grid.updateRow(row, actionLink(entity, "update"))
  };

const updateFieldAction = (grid, row, column, updateUrl) =>  {
  return {
    caption: "update",
    image: "save",
    heading: false,
    form: false,
    action: async () => {
      let data = column.getValue(row);
      if (data) {
        updateUrl.searchParams.append(column.feildname,data);

        await putRest(updateUrl.toString(), {}, (jsonData) => grid.renderUpdate(row, jsonData), (error) => reportError("updateFieldAction", error));
      }
    }
  };
};

const initializeFormHeader = (grid) => {
  let form = grid.table
  let header = document.createElement("div");
  header.id = form.id + "_thead";
  header.className = "fhead";
  form.append(header);

  let headRow = document.createElement("div");
  headRow.className = "form-head";
  headRow.id = form.id + "Head";
  header.append(headRow);

  grid.columns.forEach((column) => column.getFormHeading(grid, row));
}

const initializeFormRow = (grid, rowNum, maxLabel) => {
  let form = grid.table
  let body = document.getElementById(form.id + "_tbody");

  let row = {
    grid: grid,
    row: document.createElement("div"),
    controls: [],
    save: null,
    delete: null
  };
  row.row.className = "flex-container";
  row.row.id = getRowId(table.id, rowNum);
  body.append(row.row);

  grid.rows.push(row);

  grid.columns.forEach((column) => row.controls.push(column.getFormField(row.row, maxLabel)));
}

const initializeFormBody = (grid, maxLabel) => {
  let form = grid.table

  let body = document.createElement("div");
  body.id = form.id + "_tbody";
  body.className = "flex-container";
  form.append(body);

  initializeFormRow(grid, 0, maxLabel);
}

const initializeFormFooter = (grid) => {
  let form = grid.table;

  let foot = document.createElement("div");
  foot.id = form.id + "_tfoot";
  foot.className = "ffoot";
  form.append(foot);

  let navRow = document.createElement("div");
  navRow.className = "form-foot";
  navRow.id = form.id + "Foot";
  foot.append(navRow);

  let footer = document.createElement("div");
  footer.className = "form-footer";
  addText(footer, " ");
  navRow.append(footer);
}

const initializeForm = (grid) => {
  let form = grid.table;
 
  grid.maxLabel = grid.columns
                      .reduce((length, column) => Math.max(boxSize(column.headerLength), length), 10);

  let parent = form.parentElement;
  let caption = document.createElement("H3");
  addText(caption, grid.tableId);
  parent.insertBefore(caption, parent.firstChild);

  initializeFormHeader(grid);

  initializeFormBody(grid, maxLabel);

  initializeFormFooter(grid);
}

const initializeTableHeader = (grid) => {
  let table = grid.table;

  let header = document.createElement("thead");
  header.id = table.id + "_thead";
  header.className = "thead";
  table.append(header);

  let headRow = document.createElement("tr");
  headRow.id = table.id + "Head";
  headRow.className = "table-head";
  header.append(headRow);

  grid.columns.forEach((column) => column.getHeading(grid, headRow));
}

const appendTableRow = (grid) => {
  let table = grid.table;
  let body = table.getElementsByTagName("TBODY")[0];
  let rows = body.getElementsByTagName("TR");

  let row = document.createElement("tr");
  row.className = "table-row";
  row.id = getRowId(table.id, rows.length);
  body.append(row);

  grid.columns.forEach((column) => column.getTableCell(grid, row));

  return row;
}

const initializeTableBody = (grid) => {
  let table = grid.table;

  let body = document.createElement("tbody");
  body.id = table.Id + "_tbody";
  body.className = "tbody";
  table.append(body);

  for (let rowNum = 0; rowNum < grid.pageSize; rowNum++) {
    appendTableRow(grid);
  }
}

const initializeTableFooter = (grid) => {
  let table = grid.table;
  let footer = document.createElement("tfoot");
  footer.id = table.id + "_tfoot";
  footer.className = "tfoot";
  table.append(footer);

  let navRow = document.createElement("tr");
  navRow.id = table.id + "Foot";
  navRow.className = "table-foot";
  footer.append(navRow);

  if (grid.paged === Paged.PAGED) {
    let prevCell = document.createElement("td");
    navRow.append(prevCell);

    let prev = createButton("vorige", "prev");
    prev.className = "table-prev";
    prev.id = table.id + "Prev";
    prev.disabled = true;
    prev.addEventListener("click", () => grid.getData---(prevLnk), false);
    prevCell.appendChild(prev);
    grid.prev = prev;
  }

  let tf = document.createElement("td");
  tf.className = "table-footer";
  addText(tf, " ");
  navRow.append(tf);

  if (grid.paged === Paged.PAGED) {
    let nextCell = document.createElement("td");
    navRow.append(nextCell);

    let next = createButton("nachste", "next");
    next.className = "table-next";
    next.id = table.id + "Next";
    next.disabled = true;
    nextCell.appendChild(next);
    grid.next = next;
  }
}

const initializeTable = (grid) => {
  let table = grid.table;

  let tab = document.getElementById(table.id+"Link");
  if (tab) {
    tab.innerText = translate(tab.id);
  } else {
    let caption = document.createElement("caption");
    addText(caption, table.id);
    table.appendChild(caption);
  }

  setWidths(table, "100%");

  let colGroup = document.createElement("colgroup");
  setWidths(colGroup, "100%");

  let totalLength = grid.columns
                        .reduce((length, column) => Math.max(boxSize(column.length), length), 0);

  grid.columns.forEach((column) => {
    let col = document.createElement("col");
    setWidths(col, Math.floor((boxSize(column.length) * 100) / totalLength) + "%");
    colGroup.append(col);
  });

  table.appendChild(colGroup);

  initializeTableHeader(grid);

  initializeTableBody(grid);

  initializeTableFooter(grid);
}

class ItemGrid {
  constructor(pageSize, apiUrl, tableId, columns, paged, editMode = EditMode.VIEW, children = undefined, editForm = undefined, rowSetter = defaultRowSetter, updater = null) {
    this.pageSize = paged === Paged.FORM ? 1 : pageSize;
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
    this.add = undefined;
    this.save = undefined;
    this.rows = [];
    this.next = undefined;
    this.prev = undefined;

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

    if (!grid.initialized) {
      let place = document.getElementById(grid.tableId);
      grid.table = place;
      removeChildren(place);

      if (grid.paged === Paged.FORM) {
        let form = document.createElement("div");
        form.id = grid.tableId;
        form.className = "table";
        place.appendChild(form);
        grid.table = form;

        initializeForm(form);
      } else {
        let table = document.createElement("table");
        table.className = "table";
        table.id = grid.tableId;
        place.appendChild(table);
        grid.table = table;

        initializeTable(grid);
      }

      grid.initialized = true;
    }

    grid.loadData();
  }

  async loadData() {
    let grid = this;
    if (grid.parent) {
      grid.parent.loadData();
    } else if (grid.editMode === EditMode.ADD) {
      grid.initGrid();
      grid.addRow(saveUrl);
    } else {
      grid.getData(grid.current);
    }
  }

  renderRow(row, entity, editMode) {
    let grid = this;

    if (entity) {
      row.setAttribute("data-value", entity);
    } else {
      row.removeAttribute("data-value");
    }

    grid.columns.forEach((column) => column.bind(row, entity, editMode));
  }

  renderUpdate(row, jsonData) {
    let grid = this;

    if (grid.editMode === EditMode.ADD) {
      let self = actionLink(jsonData, "self");
      grid.current = self;
      grid.apiUrl = self;
      grid.editMode = EditMode.UPDATE;

      history.replaceState({}, null, window.location.href.replace("new=true", "self="+self));

      if (grid.children) {
        grid.children.forEach((child) => child.editMode = grid.editMode);
      }
    }

    grid.renderRow(row, jsonData, editMode);
  }

  getEntities(jsonData) {
    let grid = this;
    if (!jsonData) {
      return {};
    } else if (grid.parent) {
      return jsonData[grid.tableId];
    } else if (jsonData._embedded && jsonData._embedded.data) {
      return jsonData._embedded.data;
    }

     return [jsonData];
  }

  render(jsonData) {
    let grid = this;
    let editMode = grid.editMode;
    let entities = grid.getEntities(jsonData);
    let rowCount = grid.paged === Paged.PAGED ? grid.pageSize : Math.max(grid.pageSize, entities.length);

    for (let rowNum = 0; rowNum < rowCount; rowNum++) {
      let row = grid.rows[rowNum];

      let entity = (entities.length > 0 && rowNum < entities.length) ? entities[rowNum] : undefined;

      if (rowNum > grid.pageSize) {
        grid.appendTableRow(grid);
      }

      grid.renderRow(row, entity, editMode);
    }

    if (grid.prev) {
      let prevLnk = actionLink(jsonData, "prev");
      prev.disabled = prevLnk;
    }

    if (grid.next) {
      let nextLnk = actionLink(jsonData, "next");
      next.disabled = nextLnk;
      if (!next.disabled) {
        next.addEventListener("click", () => grid.getData(nextLnk), false);
      } else {
        next.removeEventListener("click", false);
      }
    }
  }

  renderJson(jsonData, restUrl) {
    let grid = this;
    let children = grid.children;

    grid.render(jsonData);

    if (children) {
      children.forEach((child) => {
        child.editMode = grid.editMode;
        child.render(jsonData);
      });
    }

    grid.current = restUrl;
  }

  async getData(restUrl) {
    let grid = this;
    await getRest(restUrl, (jsonData) => grid.renderJson(jsonData, restUrl), (error) => reportError(restUrl, error));
  }

  rowData(row) {
    let grid = this;
    return grid.rowSetter(row);
  }

  getFreeRow() {
    let grid = this;
    let paged = grid.paged;
    let tableId = grid.tableId;
    let table = document.getElementById(tableId);
    let rows = table.getElementsByTagName("TR");

    for (let row of rows) {
      if (!row.getAttribute("data-attribute")) {
        return row;
      }
    }

    if (paged === Paged.EXPAND) {
      // Add a row at end;
      return appendTableRow(grid);
    } else if (paged === Paged.PAGED) {
      // the page is full, new page and add at start
      for (let row = 1; row < rows.length; row++) {
        grid.renderRow(row, undefined, EditMode.NEVER);
      }

      grid.prev.addEventListener("click", () => grid.getData(grid.current), false);
      grid.prev.disabled = false;

      grid.next.removeEventListener("click", false);
      grid.next.disabled = true;
    }

    // Don"t care just use first row.
    return rows[0];
  }

  addRow(saveUrl) {
    let grid = this;
    let row = grid.getFreeRow();

    grid.renderRow(row, undefined, EditMode.NEVER);
    let ctl = document.getElementsByTagName("INPUT");
    ctl[0].focus();

    row.save.addEventListener("click", () => grid.saveRow(row, saveUrl), false);
    row.del.addEventListener("click", () => grid.removeRow(row), false);
  }

  async deleteRow(row, deleteUrl) {
    let grid = this;
    if (deleteUrl) {
      await deleteRest(deleteUrl, () => grid.loadData(), (error) => reportError("deleteRow", error));
    } else {
      grid.removeRow(row);
    }
  }

  editRow(selfUrl) {
    let grid = this;
    if (updateUrl) {
      window.location.href = grid.editForm + "?self=" + selfUrl;
    }
  }

  newRow() {
    let grid = this;
    window.location.href = grid.editForm + "?new=true";
  }

  removeRow(row) {
    let grid = this;
    grid.loadData();
  }

  async saveRow(row, saveUrl) {
    let grid = this;
    let data = grid.rowData(row);
    if (data) {
      await postRest(saveUrl, data, (jsonData) => grid.renderUpdate(row, jsonData), (error) => reportError("saveRow", error));
    }
  }

  async updateRow(row, updateUrl) {
    let grid = this;
    let data = grid.rowData(row);
    if (data) {
      await putRest(updateUrl, data, (jsonData) => grid.renderUpdate(row, jsonData), (error) => reportError("updateRow", error));
    }
  }
}

class ListEditGrid extends ItemGrid {
  constructor(pageSize, dataType, elementName, columns) {
    super(pageSize, fetchUrl(dataType), elementName, columns.concat([new ButtonColumn([addAction], [updateAction, deleteAction])]), Paged.PAGED, EditMode.UPDATE, undefined);
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

