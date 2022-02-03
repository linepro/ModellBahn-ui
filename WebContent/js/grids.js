// module "grids.js";
"use strict";

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2,
};

const buttonId = (id, action) => getFieldId(id, action) + "_action";

class ActionButton {
  constructor(form, caption, image, execute, rel, className = "nav-button") {
    this.form = form;
    this.caption = caption;
    this.image = image;
    this.execute = execute;
    this.rel = rel;
    this.className = className;
  }

  addButton(grid, row, cell, id) {
    let action = this;

    return createButton(cell, action.caption, action.image, (event) => action.execute(event, grid, row), action.className, id);
  }
 
  addHeading(grid, headerRow) {
    let action = this;

    let btn = action.addButton(grid, undefined, headerRow, buttonId(grid.tableId, action.caption));
    btn.disabled = false;
    btn.style.visibility = "visible";
  }

  addFormHeading(grid, row, headerRow) {
    let action = this;

    let btn = action.addButton(grid, row, headerRow, buttonId(grid.tableId, action.caption));
    btn.disabled = false;
    btn.style.visibility = "visible";
  }

  addRowButton(grid, row, cell) {
    let action = this;

    let btn = action.addButton(grid, row, cell, buttonId(row.id, action.caption));
    btn.disabled = true;
    btn.style.visibility = "hidden";
  }

  bind(row) {
    let btn = document.getElementById(buttonId(row.id, this.caption));
    if (btn) {
      let action = this;

      let lnk = !action.rel || actionLink(row.entity, action.rel);
      btn.disabled = shouldDisable(row.editMode, row.editMode, row.entity);
      btn.style.visibility = row.entity && lnk ? "visible" : "hidden";
    }
  }
}

const newAction = (editForm) =>
  new ActionButton(
    true,
    "Add",
    "add",
    (event, grid, row) => window.location.href = editForm
  );

const editAction = (editForm) =>
  new ActionButton(
    false,
    "Edit",
    "edit",
    (event, grid, row) => window.location.href = editForm + "?self=" + actionLink(row.entity, "self"),
    "self"
  );

const addAction = (rel = "add", completed = undefined) =>
  new ActionButton(
    true,
    "Add",
    "add",
    (event, grid, row) => completed ? completed(event, grid, row) : grid.addRow()
  );

const deleteAction = (rel = "delete", completed = undefined) =>
  new ActionButton(
    false,
    "Delete",
    "delete",
    async (event, grid, row) => {
      if (row.entity) {
        let deleteUrl = actionLink(row.entity, rel);
        if (deleteUrl) {
          await deleteRest(
            deleteUrl,
            (jsonData) => completed ? completed(event, grid, row, jsonData) : grid.removeRow(row),
            (error) => reportError("deleteRow", error)
          );
        } else {
          grid.removeRow(row);
        }
      }
    },
    rel
  );

const saveAction = (rel = "update", completed = undefined) =>
  new ActionButton(
    false,
    "Save",
    "save",
    async (event, grid, row) => {
      if (row.entity) {
        let updateUrl = actionLink(row.entity, rel);
        if (updateUrl && row.editMode !== EditMode.ADD) {
          await putRest(
            updateUrl,
            row.entity,
            (jsonData) => completed ? completed(event, grid, row, jsonData) : row.bind(jsonData, row.editMode),
            (error) => reportError("updateRow", error)
          );
        } else {
          await postRest(
            grid.addUrl,
            row.entity,
            (jsonData) => completed ? completed(event, grid, row, jsonData) : row.bind(jsonData, EditMode.UPDATE),
            (error) => reportError("saveRow", error)
          );
        }
      }
    },
    "update"
  );

const setAction = (fieldName, rel = "update") =>
  new ActionButton(
    false,
    "Save",
    "save",
    async (event, grid, row) => {
      if (row.entity) {
        let updateUrl = actionLink(row.entity, rel);
        if (updateUrl && row.editMode !== EditMode.ADD) {
          await setRest(
            updateUrl,
            fieldName,
            row.entity[fieldName],
            (jsonData) => row.bind(jsonData, EditMode.UPDATE),
            (error) => reportError("updateRow", error)
          );
        } else {
          await postRest(
            grid.addUrl,
            row.entity,
            (jsonData) => row.bind(jsonData, EditMode.UPDATE),
            (error) => reportError("saveRow", error)
          );
        }
      }
    },
    "update"
  );

const uploadActions = (entities, complete) =>
  new ActionButton(
    true,
    "Upload",
    "upload",
    () => IMPORT_DATA(entities, complete)
  );

const downloadActions = (entities, complete) =>
  new ActionButton(
    true,
    "Download",
    "download",
    () => EXPORT_DATA(entities, complete)
  );

const searchAction = () =>
  new ActionButton(
    true,
    "Search",
    "search",
    async (event, grid, row) => grid.search()
  );

class ButtonColumn extends VirtualColumn {
  constructor(actions = []) {
    super();
    this.actions = actions;
    this.headingCount = this.actions
      .reduce(
        (count, action) => (action.form ? count + 1 : count),
        0
      );
    this.rowCount = this.actions.length - this.headingCount;
    this.length = Math.max(this.headingCount, this.rowCount) * 2.75;
    this.grid = undefined;
    this.minWidth = this.length+"em";
    this.type = "button";
  }

  addHeading(grid, headerRow) {
    let column = this;

    column.grid = grid;

    let bar = createTh(headerRow, "table-heading-btn");

    if (column.displayLength()) {
      column.actions
        .filter((action) => action.form)
        .forEach((action) => action.addHeading(grid, bar));
    }
  }

  addFormHeading(grid, row, headerRow) {
    let column = this;

    column.grid = grid;

    let header = createDiv(headerRow, "form-heading-btn");

    if (column.displayLength()) {
      column.actions
        .forEach((action) => action.addFormHeading(grid, row, header));

      return header;
    }
  }

  addTableCell(row) {
    let column = this;

    let cell = createTd(row.element, row.classPrefix + "-cell-btn", row.id + "_buttons");

    if (column.displayLength()) {
      column.actions
        .filter((action) => !action.form)
        .forEach((action) => action.addRowButton(column.grid, row, cell));

      return {
        id: cell.id,
        column: column,
        element: cell,
      };
    }
  }

  addFormField(row, unit) {
    let column = this;

    return {
      id: row.id + "_buttons",
      column: column,
      element: undefined
    };
  }

  bind(row) {
    let column = this;

    if (column.displayLength()) {
      column.actions
        .filter((action) => !action.form)
        .forEach((action) =>  action.bind(row))
    }
  }
}

class ChildColumn extends VirtualColumn {
  constructor(child) {
    super();

    this.child = child;
    // requirement: div.id for location == entity fieldName
    this.fieldName = child.tableId;
    this.type = "child";
  }

  addHeading(grid, headingRow) {
    this.child.initialize();
    this.child.refresh = grid.refresh;
  }

  addFormHeading(grid, row, headingRow) {
    this.child.initialize();
    this.child.refresh = grid.refresh;
  }

  createControl(row) {
    let column = this;

    let fieldId = getFieldId(row.id, column.fieldName);
    let childTable = document.getElementById(fieldId);

    return {
      id: fieldId,
      column: column,
      element: childTable
    };
  }

  addTableCell(row) {
    let column = this;

    return column.createControl(row);
  }

  addFormField(row, unit) {
    let column = this;

    return column.createControl(row);
  }

  bind(row) {
    let column = this;

    let parentUrl = actionLink(row.entity, "self");
    let addUrl = actionLink(row.entity, column.fieldName);
    column.child.bind(row.entity, parentUrl);
    column.child.addUrl = addUrl;
    column.child.refresh = row.refresh;
  }
}

class RowEntry {
  constructor(row, editMode, refresh, classPrefix) {
   this.id = row.id;
   this.element = row;
   this.columns =  undefined;
   this.editMode = editMode;
   this.entity = undefined;
   this.refresh = refresh;
   this.classPrefix = classPrefix;
  }

  bind(entity, edtMode) {
    this.entity = entity;
    this.editMode = edtMode;
    this.columns
      .forEach((column) => column.column.bind(this));
  }
}

class ItemGrid {
  constructor(
    fetchUrl,
    tableId,
    columns,
    actions,
    editMode = EditMode.VIEW,
    children = undefined,
    classPrefix = ""
  ) {
    this.currentUrl = fetchUrl;
    this.refresh = async () => this.fetch(this.currentUrl);
    this.addUrl = fetchUrl.split("?")[0]; // true for parents
    this.tableId = tableId;
    this.columns = columns
      .concat(actions ? [new ButtonColumn(actions)] : [])
      .concat(children ? children.map((child) => new ChildColumn(child)) : []);
    this.children = children;
    if (this.children) {
      this.children.forEach((child) => child.parent = this);
    }
    this.actions = actions;
    this.editMode = editMode;
    this.initialized = false;
    this.classPrefix = classPrefix;
  }

  createCaption() {
    return createTextElement("h3");
  }

  initialize() {
    let grid = this;

    if (!grid.initialized) {
      let h1 = document.getElementById("heading");
      if (h1) {
        h1.text = this.dataType;
      }

      let place = document.getElementById(grid.tableId);
      removeChildren(place);

      let tab = document.getElementById(grid.tableId + "Link");
      if (tab) {
        tab.innerText = translate(tab.id);
      } else {
        let caption = grid.createCaption();
        addText(caption, translate(grid.tableId));
        place.append(caption);
      }

      grid.draw(place);

      if (grid.children) {
        grid.children.forEach((child) => child.initialize(grid));
      }
    }

    grid.initialized = true;
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    grid.currentUrl = fetchUrl ? fetchUrl : grid.currentUrl;
    grid.refresh = async () => grid.fetch(grid.currentUrl);
  }

  async fetch(fetchUrl) {
    let grid = this;
    let place = document.getElementById(grid.tableId);

    if (fetchUrl) {
      await getRest(
        fetchUrl,
        (jsonData) => {
          grid.bind(jsonData, fetchUrl);
          place.dispatchEvent(new CustomEvent("refresh", {data: jsonData, url: fetchUrl}));
        },
        (error) => reportError(fetchUrl, error)
      );
    } else {
      grid.bind(undefined, undefined);
      place.dispatchEvent(new CustomEvent("refresh", {data: undefined, url: undefined}));
    }
  }

  async init() {
    let grid = this;

    grid.initialize();

    await grid.fetch(grid.currentUrl);
  }

  async search() {
    return Promise.resolve();
  }
}

const formUrl = (dataType) =>
      location.search.includes("self=")
        ? new URLSearchParams(location.search).get("self")
        : fetchUrl(dataType);

const formMode = (editMode) =>
      location.search.includes("self=") ? editMode : EditMode.ADD;

class Form extends ItemGrid {
  constructor(dataUrl, tableId, columns, actions, editMode, children) {
    super(
      dataUrl,
      tableId,
      columns,
      actions,
      editMode,
      children,
      "form"
    );
  }

  draw(place) {
    let grid = this;

    let form = createDiv(place, grid.classPrefix + "-table", grid.tableId);

    grid.table = form;

    let header = createDiv(form, grid.classPrefix + "-thead", grid.tableId + "_thead");

    createDiv(header, grid.classPrefix +"-head", grid.tableId + "_head");

    let body = createDiv(form, grid.classPrefix +"-tbody", grid.tableId + "_tbody");

    let row = createDiv(body, grid.classPrefix +"-row", getRowId(grid.tableId, 0));

    let rowEntry = new RowEntry(row, grid.editMode, grid.refresh, grid.classPrefix);

    rowEntry.columns = grid.columns
      .map((column) => column.addFormField(rowEntry, 1))
      .filter((column) => column);

    grid.row = rowEntry;

    grid.columns.forEach((column) => column.addFormHeading(grid, grid.row, header));

    let foot = createDiv(form, grid.classPrefix +"-tfoot", grid.tableId + "_tfoot");

    let navRow = createDiv(foot, grid.classPrefix +"-foot", grid.tableId + "_foot");

    let footer = createDiv(navRow, grid.classPrefix + "-footer");
    addText(footer, " ");
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entity = jsonData ? jsonData : {};
    let self = actionLink(entity, "self");

    grid.editMode = self ? EditMode.UPDATE : EditMode.ADD;

    grid.row.bind(entity, grid.editMode);
  }

  async fetch(fetchUrl) {
    let grid = this;

    fetchUrl = fetchUrl ? fetchUrl : grid.currentUrl;
    super.fetch(grid.editMode == EditMode.ADD ? undefined : fetchUrl);
  }
}

const addableColumn = (column) => (column.editable != Editable.NEVER) && column.type && (column.type != "file" && column.type != "image" && column.type != "pdf");

const popupAddForm = (columns, grid, row) => {
  let frm = createDiv(undefined, "popup-form");

  let tableId = grid.tableId + "PopUpAdd";

  let addForm = new Form(grid.addUrl, tableId, columns.filter(c => addableColumn(c)), [], EditMode.ADD);

  addForm.draw(frm);

  let head = frm.querySelector("#" + tableId + "_head");

  removeChildren(head);
  createTextElement("h3", head, "ADD", "form-head");

  let foot = frm.querySelector("#" + tableId + "_foot");

  removeChildren(foot);

  createButton(
    foot,
    "Save",
    "save",
    () =>
      postRest(
        grid.addUrl,
        addForm.row.entity,
        (jsonData) => {
          let newRow = grid.addRow();
          newRow.bind(jsonData, EditMode.UPDATE);
          modal.style.display = "none";
        },
        (error) => reportError("saveRow", error)
      )
  );

  createButton(foot, "Close", "close", () => modal.style.display = "none");

  showModal(frm, false, () => addForm.bind({}, EditMode.ADD));
}

const popupAddAction = (columns) => 
  new ActionButton(
    true,
    "Add",
    "add",
    async (event, grid, row) => popupAddForm(columns, grid, row)
  );

class Table extends ItemGrid {
  constructor(pageSize, apiUrl, tableId, columns, actions, editMode, children, classPrefix = "table") {
    super(apiUrl, tableId, columns, actions, editMode, children, classPrefix);

    this.pageSize = pageSize;
    this.rows = [];
  }

  removeRow(row) {
    let grid = this;

    grid.refresh();
  }

  appendTableRow() {
    let grid = this;

    let body = document.getElementById(grid.tableId + "_tbody");
    let rows = body.getElementsByTagName("TR");

    let row = createTr(body, grid.classPrefix +"-row", getRowId(grid.tableId, rows.length));

    let rowEntry = new RowEntry(row, grid.editMode, grid.refresh, grid.classPrefix);

    rowEntry.columns = grid.columns
      .map((column) => column.addTableCell(rowEntry))
      .filter((column) => column);

    grid.rows.push(rowEntry);

    return rowEntry;
  }

  addHeader(table) {
    let grid = this;

    let header = createThead(table, grid.classPrefix + "-thead", grid.tableId + "_thead");

    let headings = createTr(header, grid.classPrefix +"-head", grid.tableId + "_head");

    grid.columns.forEach((column) => column.addHeading(grid, headings));
  }

  addBody(table) {
    let grid = this;

    createTbody(table, grid.classPrefix + "-tbody", grid.tableId + "_tbody");

    for (let rowNum = 0; rowNum < grid.pageSize; rowNum++) {
      grid.appendTableRow();
    }
  }

  addFooter(table) {
    let grid = this;

    let footer = createTfoot(table, grid.classPrefix + "-tfoot", grid.tableId + "_tfoot");

    let navRow = createTr(footer, grid.classPrefix +"-foot", grid.tableId + "_foot");

    grid.columns.forEach((column) => {
      createTd(navRow, grid.classPrefix +"-footer");
    });
  }

  draw(place) {
    let grid = this;

    let totalLength = grid.columns
      .reduce(
        (length, column) => length + column.displayLength(2),
        0
      );

    let table = createTable(place, grid.classPrefix + "-table", grid.tableId);
    setWidths(table, "100%");
    grid.table = table;

    let group = createColgroup(table, grid.classPrefix + "-colgroup");
    setWidths(group, "100%");

    grid.columns.forEach((column) => {
      let col = createCol(group, grid.classPrefix + "-col");
      let width = Math.floor((column.displayLength(2) * 100) / totalLength) + "%";
      setWidths(col, column.minWidth ? column.minWidth : width);
    });

    grid.addHeader(table);

    grid.addBody(table);

    grid.addFooter(table);
  }

  freeRow() {
    let grid = this;

    let free = grid.rows.filter(
      (row) => !row.entity || row.editMode == EditMode.ADD
    );

    return free.length ? free[0] : grid.rows[0];
  }

  addRow(entity = {}, editMode = EditMode.ADD) {
    let grid = this;

    let row = grid.freeRow();

    row.bind(entity, editMode);
    row.element.getElementsByTagName("INPUT")[0].focus();

    return row;
  }

  async removeRow(row) {
    let grid = this;

    await grid.refresh();
  }

  getData(jsonData) {
    let grid = this;

    if (jsonData) {
      if (jsonData[grid.tableId]) {
        return jsonData[grid.tableId];
      }

      if (jsonData._embedded && jsonData._embedded.data) {
        return jsonData._embedded.data;
      }
    }

    return [];
  }
}

class ExpandingTable extends Table {
  constructor(
    pageSize,
    dataType,
    tableId,
    columns,
    actions,
    editMode,
    children = undefined
  ) {
    super(
      pageSize,
      fetchUrl(dataType),
      tableId,
      columns,
      actions,
      editMode,
      children,
      "expanding"
    );
  }

  addHeader(table) {
    super.addHeader(table);
  }

  addBody(table) {
    super.addBody(table);
  }

  addFooter(table) {
    super.addFooter(table);
  }

  removeRow(row) {
    let grid = this;

    if (grid.rows.length > grid.pageSize) {
      let body = row.element.parent;
      let last = grid.rows[grid.rows.length - 1];
      body.removeChild(last.element);
      grid.rows = grid.rows.filter((r) => r !== last);
    }

    super.removeRow(row);
  }

  freeRow() {
    let grid = this;

    let free = grid.rows.filter(
      (row) => !row.entity || row.editMode == EditMode.ADD
    );

    return free.length ? free[0] : grid.appendTableRow();
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entities = grid.getData(jsonData);

    for (
      let rowNum = 0;
      rowNum < Math.max(entities.length, grid.rows.length);
      rowNum++
    ) {
      let row =
        rowNum < grid.rows.length ? grid.rows[rowNum] : grid.appendTableRow();
      let entity =
        entities.length > 0 && rowNum < entities.length
          ? entities[rowNum]
          : undefined;
      row.bind(entity, grid.editMode);
    }
  }
}

class PagedTable extends Table {
  constructor(
    pageSize,
    dataType,
    tableId,
    columns,
    actions,
    editMode,
    children = undefined
  ) {
    super(
      pageSize,
      fetchUrl(dataType) + "?page=0&size=" + pageSize.toString(),
      tableId,
      columns,
      actions,
      editMode,
      children,
      "table"
    );

    this.prev = undefined;
    this.prevLink = undefined;
    this.next = undefined;
    this.nextLink = undefined;
  }

  async fetchPrev() {
    let grid = this;

    await grid.fetch(grid.prevLink);
  }

  async fetchNext() {
    let grid = this;

    await grid.fetch(grid.nextLink);
  }

  addPrev(navRow) {
    let grid = this;

    let prevCell = createTd(navRow, "table-prev");

    let prev = createButton(prevCell, "vorige", "prev", () => grid.fetchPrev(), "nav-button", grid.tableId + "Prev");
    prev.disabled = true;
    prev.style.visibility = "hidden";
    return prev;
  }

  addNext(navRow) {
    let grid = this;

    let nextCell = createTd(navRow, "table-next");

    let next = createButton(nextCell, "nachste", "next", () => grid.fetchNext(), "nav-button", grid.tableId + "Next");
    next.disabled = true;
    next.style.visibility = "hidden";
    return next;
  }

  addFooter(table) {
    let grid = this;

    let footer = createTfoot(table, grid.classPrefix + "-tfoot", grid.tableId + "_tfoot");

    let navRow = createTr(footer, grid.classPrefix +"-foot",  grid.tableId + "_foot");

    grid.prev = grid.addPrev(navRow);

    for (let i = 0 ; i < grid.columns.length - 2; i++) {
      createTd(navRow, grid.classPrefix +"-footer");
    }

    grid.next = grid.addNext(navRow);
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entities = grid.getData(jsonData);

    let prevLink = actionLink(jsonData, "prev");
    grid.prevLink = prevLink;
    grid.prev.disabled = !prevLink;
    grid.prev.style.visibility = prevLink ? "visible" : "hidden";

    let nextLink = actionLink(jsonData, "next");
    grid.nextLink = nextLink;
    grid.next.disabled = !nextLink;
    grid.next.style.visibility = nextLink ? "visible" : "hidden";

    for (let rowNum = 0; rowNum < grid.pageSize; rowNum++) {
      let row = grid.rows[rowNum];
      let entity =
        entities.length > 0 && rowNum < entities.length
          ? entities[rowNum]
          : undefined;
      row.bind(entity, grid.editMode);
    }
  }
}

class ListEditTable extends PagedTable {
  constructor(pageSize, dataType, elementName, columns) {
    super(
      pageSize,
      dataType,
      elementName,
      columns,
      [
        uploadActions([dataType]),
        downloadActions([dataType]),
        searchAction(),
        popupAddAction(columns),
        saveAction(),
        deleteAction()
      ],
      EditMode.UPDATE
    );
    this.dataType = dataType;
  }
}

class NamedItemTable extends ListEditTable {
  constructor(
    dataType,
    elementName
  ) {
    super(
      10,
      dataType,
      elementName,
      [
        NAMEN(),
        BEZEICHNUNG()
      ]
    );
  }
}