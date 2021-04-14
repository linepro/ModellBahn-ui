// module "grids.js";
"use strict";

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2,
};

class ActionButton {
  constructor(form, caption, image, execute, className = "nav-button") {
    this.form = form;
    this.caption = caption;
    this.image = image;
    this.execute = execute;
    this.className = className;
  }

  addButton(grid, row, cell) {
    let action = this;

    let btn = createButton(
      action.caption,
      action.image,
      (event) => action.execute(event, grid, row),
      action.className
    );
    cell.append(btn);
    return btn;
  }
 
  addHeading(grid, headerRow) {
    let action = this;

    let btn = action.addButton(grid, undefined, headerRow);
    btn.id = getFieldId(grid.tableId, action.caption);
    btn.disabled = false;
    btn.style.visibility = "visible";
  }

  addFormHeading(grid, row, headerRow) {
    let action = this;

    let btn = action.addButton(grid, row, headerRow);
    btn.id = getFieldId(row.id, action.caption);
    btn.disabled = false;
    btn.style.visibility = "visible";
  }

  addRowButton(grid, row, cell) {
    let action = this;

    let btn = action.addButton(grid, row, cell);
    btn.id = getFieldId(row.id, action.caption);
    btn.disabled = true;
    btn.style.visibility = "hidden";
  }

  bind(row) {
    let btn = document.getElementById(getFieldId(row.id, this.caption));
    if (btn) {
      btn.disabled = shouldDisable(row.editMode, row.editMode, row.entity);
      btn.style.visibility = row.entity ? "visible" : "hidden";
    }
  }
}

const newAction = (editForm) =>
  new ActionButton(
    true,
    "add",
    "add",
    (event, grid, row) => window.location.href = editForm
  );

const editAction = (editForm) =>
  new ActionButton(
    false,
    "edit",
    "edit",
    (event, grid, row) => window.location.href = editForm + "?self=" + actionLink(row.entity, "self")
  );

const addAction = (rel = "add") =>
  new ActionButton(
    true,
    "add",
    "add",
    (event, grid, row) => grid.addRow()
  );

const deleteAction = (rel = "delete") =>
  new ActionButton(
    false,
    "delete",
    "delete",
    async (event, grid, row) => {
      if (row.entity) {
        let deleteUrl = actionLink(row.entity, rel);
        if (deleteUrl) {
          await deleteRest(
            deleteUrl,
            () => grid.removeRow(),
            (error) => reportError("deleteRow", error)
          );
        } else {
          row.remove();
        }
      }
    }
  );

const saveAction = (rel = "update") =>
  new ActionButton(
    false,
    "save",
    "save",
    async (event, grid, row) => {
      if (row.entity) {
        let updateUrl = actionLink(row.entity, rel);
        if (updateUrl) {
          await putRest(
            updateUrl,
            row.entity,
            (jsonData) => row.bind(jsonData, row.editMode),
            (error) => reportError("updateRow", error)
          );
        } else {
          await postRest(
            grid.currentUrl.split("?")[0],
            row.entity,
            (jsonData) => row.bind(jsonData, EditMode.UPDATE),
            (error) => reportError("saveRow", error)
          );
        }
      }
    }
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
  }

  addHeading(grid, headerRow) {
    let column = this;

    column.grid = grid;

    let bar = document.createElement("th");
    bar.className = "table-heading-btn";
    headerRow.append(bar);

    if (column.displayLength()) {
      column.actions
        .filter((action) => action.form)
        .forEach((action) => action.addHeading(grid, bar));
    }
  }

  addFormHeading(grid, row, headerRow) {
    let column = this;

    column.grid = grid;

    let header = document.createElement("div");
    header.className = "form-heading-btn";
    headerRow.append(header);

    if (column.displayLength()) {
      column.actions
        .forEach((action) => action.addFormHeading(grid, row, header));

      return header;
    }
  }

  addTableCell(row) {
    let column = this;

    let cell = document.createElement("td");
    cell.id = row.id + "_buttons";
    cell.className = "table-cell-btn";
    row.element.append(cell);

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

  addFormField(row, width) {
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
  }

  addHeading(grid, headingRow) {
    this.child.initialize();
    this.child.refresh = grid.refresh;
  }

  addFormHeading(grid, row, headingRow) {
    this.child.initialize();
    this.child.refresh = grid.refresh;
  }

  addTableCell(row) {
    let column = this;

    return {
      id: column.child.tableId,
      column: column,
      element: undefined
    };
  }

  addFormField(row, width) {
    let column = this;

    return {
      id: column.child.tableId,
      column: column,
      element: undefined
    };
  }

  bind(row) {
    let column = this;
    column.child.bind(row.entity, actionLink(row.entity, column.child.tableId));
  }
}

class RowEntry {
  constructor(row, editMode, refresh, remove = undefined) {
   this.id = row.id;
   this.element = row;
   this.columns =  undefined;
   this.editMode = editMode;
   this.entity = undefined;
   this.refresh = refresh;
   this.remove = remove;
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
    children = undefined
  ) {
    this.currentUrl = fetchUrl;
    this.tableId = tableId;
    this.columns = columns
      .concat(actions ? [new ButtonColumn(actions)] : [])
      .concat(children ? children.map((child) => new ChildColumn(child)) : []);
    this.actions = actions;
    this.editMode = editMode;
    this.initialized = false;
  }

  createCaption() {
    return document.createElement("h3");
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
        addText(caption, grid.tableId);
        place.append(caption);
      }

      grid.draw(place);

      if (grid.children) {
        grid.children.forEach((child) => child.initialize());
      }
    }

    grid.initialized = true;
  }

  async fetch(fetchUrl) {
    let grid = this;

    if (fetchUrl) {
      await getRest(
        fetchUrl,
        (jsonData) => grid.bind(jsonData, fetchUrl),
        (error) => reportError(fetchUrl, error)
      );
    } else {
      grid.bind(undefined, undefined);
    }
  }

  async init() {
    let grid = this;

    grid.initialize();

    await grid.fetch(grid.currentUrl);
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    grid.currentUrl = fetchUrl ? fetchUrl : grid.currentUrl;
  }
}

class Form extends ItemGrid {
  constructor(dataType, tableId, columns, actions, editMode, children) {
    super(
      location.search.includes("self=")
        ? new URLSearchParams(location.search).get("self")
        : fetchUrl(dataType),
      tableId,
      columns,
      actions,
      location.search.includes("self=") ? editMode : EditMode.ADD,
      children
    );
  }

  draw(place) {
    let grid = this;

    let maxLabel = grid.columns
      .reduce(
        (length, column) => Math.max(boxSize(column.headingLength), length),
        10
      );

    let form = document.createElement("div");
    form.id = grid.tableId;
    form.className = "table";
    place.append(form);

    grid.table = form;

    let header = document.createElement("div");
    header.id = grid.tableId + "_thead";
    header.className = "fhead";
    form.append(header);

    let headRow = document.createElement("div");
    headRow.className = "form-head";
    headRow.id = grid.tableId + "Head";
    header.append(headRow);

    let body = document.createElement("div");
    body.id = grid.tableId + "_tbody";
    body.className = "form-body";
    form.append(body);

    let row = document.createElement("div");
    row.id = getRowId(grid.tableId, 0);
    row.className = "form-row";
    body.append(row);

    let rowEntry = new RowEntry(row, grid.editMode, grid.fetch);

    rowEntry.columns = grid.columns
      .map((column) => column.addFormField(rowEntry, maxLabel))
      .filter((column) => column);

    grid.row = rowEntry;

    grid.columns.forEach((column) => column.addFormHeading(grid, grid.row, header));

    let foot = document.createElement("div");
    foot.id = grid.tableId + "_tfoot";
    foot.className = "ffoot";
    form.append(foot);

    let navRow = document.createElement("div");
    navRow.className = "form-foot";
    navRow.id = grid.tableId + "Foot";
    foot.append(navRow);

    let footer = document.createElement("div");
    footer.className = "form-footer";
    addText(footer, " ");
    navRow.append(footer);
  }

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entity = jsonData ? jsonData : {};
    let self = actionLink(entity, "self");

    grid.editMode = self ? EditMode.UPDATE : EditMode.ADD;
    //history.replaceState({}, null, window.location.href.replace("new=true", "self="+self));

    grid.row.bind(entity, grid.editMode);
  }

  async fetch(fetchUrl) {
    let grid = this;

    fetchUrl = fetchUrl ? fetchUrl : grid.currentUrl;
    super.fetch(grid.editMode === EditMode.ADD ? undefined : fetchUrl);
  }
}

class Table extends ItemGrid {
  constructor(pageSize, apiUrl, tableId, columns, actions, editMode, children) {
    super(apiUrl, tableId, columns, actions, editMode, children);

    this.pageSize = pageSize;
    this.rows = [];
  }

  removeRow(row) {
    let grid = this;

    grid.fetch(grid.currentUrl);
  }

  appendTableRow() {
    let grid = this;

    let body = document.getElementById(grid.tableId + "_tbody");
    let rows = body.getElementsByTagName("TR");

    let row = document.createElement("tr");
    row.id = getRowId(grid.tableId, rows.length);
    row.className = "table-row";
    body.append(row);

    let rowEntry = new RowEntry(row, grid.editMode, grid.fetch, grid.removeRow);

    rowEntry.columns = grid.columns
      .map((column) => column.addTableCell(rowEntry))
      .filter((column) => column);

    grid.rows.push(rowEntry);

    return rowEntry;
  }

  addHeader(table) {
    let grid = this;

    let header = document.createElement("thead");
    header.id = grid.tableId + "_thead";
    header.className = "thead";
    table.append(header);

    let headings = document.createElement("tr");
    headings.id = grid.tableId + "Head";
    headings.className = "table-head";
    header.append(headings);

    grid.columns.forEach((column) => column.addHeading(grid, headings));
  }

  addBody(table, className = "tbody") {
    let grid = this;

    let body = document.createElement("tbody");
    body.id = grid.tableId + "_tbody";
    body.className = className;
    table.append(body);

    for (let rowNum = 0; rowNum < grid.pageSize; rowNum++) {
      grid.appendTableRow();
    }
  }

  addFooter(table, className = "table-footer") {
    let grid = this;

    let footer = document.createElement("tfoot");
    footer.id = grid.tableId + "_tfoot";
    footer.className = "tfoot";
    table.append(footer);

    let navRow = document.createElement("tr");
    navRow.id = grid.tableId + "Foot";
    navRow.className = "table-foot";
    footer.append(navRow);

    grid.columns.forEach((column) => {
      let tf = document.createElement("td");
      tf.className = className;
      navRow.append(tf)
    });
  }

  draw(place) {
    let grid = this;

    let table = document.createElement("table");
    grid.table = table;
    table.id = grid.tableId;
    table.class = "table";
    setWidths(table, "100%");
    place.append(table);

    let group = document.createElement("colgroup");
    setWidths(group, "100%");

    let totalLength = grid.columns
      .reduce(
        (length, column) => length + boxSize(column.displayLength()),
        0
      );

    grid.columns.forEach((column) => {
      let col = document.createElement("col");
      let width = Math.floor((boxSize(column.displayLength()) * 100) / totalLength) + "%";
      console.log({ total: totalLength, column: column.fieldName, length: column.displayLength(), width: width });
      setWidths(col, width);
      group.append(col);
    });

    table.appendChild(group);

    grid.addHeader(table);

    grid.addBody(table);

    grid.addFooter(table);
  }

  freeRow() {
    let grid = this;

    let free = grid.rows.filter(
      (row) => !row.entity || row.editMode === EditMode.ADD
    );

    return free.length ? free[0] : grid.appendTableRow();
  }

  addRow() {
    let grid = this;

    let row = grid.freeRow();

    let entity = {};
    row.bind(entity, EditMode.ADD);
    row.element.getElementsByTagName("INPUT")[0].focus();
  }

  async removeRow(row) {
    let grid = this;

    await grid.fetch(grid.currentUrl);
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
      children
    );
  }

  addFooter(tableName) {
    super.addFooter(tableName, "table-footer-thin");
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

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entities = grid.getData(jsonData);

    for (
      let rowNum = 0;
      rowNum < Math.max(entities.length, grid.pageSize);
      rowNum++
    ) {
      let row =
        rowNum < grid.pageSize ? grid.rows[rowNum] : grid.appendTableRow(grid);
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
      children
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

    let prevCell = document.createElement("td");
    prevCell.className = "table-prev";
    navRow.append(prevCell);

    let prev = createButton("vorige", "prev");
    prev.id = grid.tableId + "Prev";
    prev.disabled = true;
    prev.style.visibility = "hidden";
    prev.addEventListener("click", () => grid.fetchPrev(), false);
    prevCell.appendChild(prev);
    return prev;
  }

  addNext(navRow) {
    let grid = this;

    let nextCell = document.createElement("td");
    nextCell.className = "table-next";
    navRow.append(nextCell);

    let next = createButton("nachste", "next");
    next.id = grid.tableId + "Next";
    next.disabled = true;
    next.style.visibility = "hidden";
    next.addEventListener("click", () => grid.fetchNext(), false);
    nextCell.appendChild(next);
    return next;
  }

  addFooter(table) {
    let grid = this;

    let footer = document.createElement("tfoot");
    footer.id = grid.tableId + "_tfoot";
    footer.className = "tfoot";
    table.append(footer);

    let navRow = document.createElement("tr");
    navRow.id = grid.tableId + "Foot";
    navRow.className = "table-foot";
    footer.append(navRow);

    grid.prev = grid.addPrev(navRow);

    for (let i = 0 ; i < grid.columns.length -2; i++) {
      let tf = document.createElement("td");
      tf.className = "table-footer";
      navRow.append(tf)
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

  freeRow() {
    let grid = this;

    let free = grid.rows.filter(
      (row) => !row.entity || row.editMode === EditMode.ADD
    );

    return free.length ? free[0] : super.freeRow();
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
        addAction(),
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