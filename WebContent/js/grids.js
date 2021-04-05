// module "grids.js";
"use strict";

const Paged = {
  FORM: 0,
  PAGED: 1,
  EXPAND: 2,
};

class ActionButton {
  constructor(form, caption, image, action, className = "nav-button") {
    this.form = form;
    this.caption = caption;
    this.image = image;
    this.action = action;
    this.className = className;
  }

  addButton(cell) {
    let btn = createButton(
      this.caption,
      this.image,
      this.execute,
      this.className
    );
    this.element = btn;
    cell.append(btn);
    btn.disabled = !this.form;
    btn.style.visibility = this.form ? "visible" : "hidden";
    return btn;
  }

  execute(event) {
    this.execution(event);
  }

  bind(row, entity, editMode) {
    this.execution = this.action(row, entity);
    this.element.disabled = shouldDisable(column.editable, editMode, value);
    this.element.style.visibility = entity ? "visible" : "hidden";
  }
}

const newAction = (editForm) =>
  new ActionButton(
    true,
    "add",
    "add",
    (row, entity) => (window.location.href = editForm)
  );

const editAction = (editForm) =>
  new ActionButton(
    false,
    "edit",
    "edit",
    (row, entity) =>
      (window.location.href = editForm + "?self=" + actionLink(entity, "self"))
  );

const addAction = (grid, rel = "add") =>
  new ActionButton(
    true, 
    "add", 
    "add", 
    (row, entity) => (grid.addRow(actionLink(entity, rel)))
  );

const deleteAction = (rel = "delete") =>
  new ActionButton(
    false, 
    "delete", 
    "delete", 
    async (row, entity) => {
      if (entity) {
        let deleteUrl = actionLink(entity, rel);
        if (deleteUrl) {
          await deleteRest(
            deleteUrl,
            () => row.refresh(),
            (error) => reportError("deleteRow", error)
          );
        } else {
          row.remove();
        }
      }
    }
  );

const saveAction = (addUrl, rel = "add") =>
  new ActionButton(
    false, 
    "save", 
    "save", 
    async (row, entity) => {
      if (entity) {
        let updateUrl = actionLink(entity, rel);
        if (updateUrl) {
          await putRest(
            updateUrl,
            entity,
            (jsonData) => row.bind(jsonData, row.editMode),
            (error) => reportError("updateRow", error)
          );
        } else {
          await postRest(
            addUrl,
            entity,
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
    this.headingCount = this.actions.reduce(
      (count, action) => (action.form ? count + 1 : count),
      0
    );
    this.rowCount = this.actions.length - this.headingCount;
    this.length = Math.max(this.headingCount, this.rowCount) * 8;
  }

  addHeading(headerRow) {
    let column = this;

    let header = document.createElement("th");
    header.className = "table-heading-btn";
    headerRow.append(header);

    if (column.length) {
      column.actions
        .filter((action) => action.form)
        .forEach((action) => action.addButton(header));

      return header;
    }
  }

  addFormHeading(headerRow) {
    let column = this;

    let header = document.createElement("div");
    header.className = "form-heading-btn";
    headerRow.append(header);

    if (column.length) {
      column.actions
        .forEach((action) => action.addButton(header));

      return header;
    }
  }

  addTableCell(row) {
    let column = this;

    let cell = document.createElement("td");
    cell.id = row.id + "_buttons";
    cell.className = "table-cell";
    row.append(cell);

    if (column.length) {
      column.actions
        .filter((action) => !action.form)
        .forEach((action) => action.addButton(cell));

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

  bind(row, entity, editMode) {
    let column = this;

    if (column.length) {
      column.actions
        .filter((action) => !action.form)
        .forEach((action) =>  action.bind(row, entity, editMode))
    }
  }
}

class ChildColumn extends VirtualColumn {
  constructor(child) {
    super();

    this.child = child;
  }

  addHeading(headingRow) {
    this.child.initialize();
  }

  addFormHeading(headingRow) {
    this.child.initialize();
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

  bind(row, entity, editMode) {
    let column = this;
    column.child.bind(entity, editMode);
    child.refresh = row.refresh;
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
    this.refresh = this.fetch;
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
  constructor(apiUrl, tableId, columns, actions, editMode, children) {
    super(
      location.search.includes("self=")
        ? new URLSearchParams(location.search).get("self")
        : apiUrl,
      tableId,
      columns,
      actions,
      location.search.includes("self=") ? editMode : EditMode.ADD,
      children
    );
  }

  draw(place) {
    let grid = this;

    let maxLabel = grid.columns.reduce(
      (length, column) => Math.max(boxSize(column.headerLength), length),
      10
    );

    let form = document.createElement("div");
    form.id = grid.tableId;
    form.className = "table";
    place.append(form);

    grid.table = form;

    let header = document.createElement("div");
    header.id = form.id + "_thead";
    header.className = "fhead";
    form.append(header);

    let headRow = document.createElement("div");
    headRow.className = "form-head";
    headRow.id = form.id + "Head";
    header.append(headRow);

    grid.columns.forEach((column) => column.addFormHeading(row));

    let body = document.createElement("div");
    body.id = form.id + "_tbody";
    body.className = "flex-container";
    form.append(body);

    let row = document.createElement("div");
    row.id = getRowId(form.id, 0);
    row.className = "flex-container";
    body.append(row);

    let columns = form.columns
      .map((column) => column.addFormField(row, maxLabel))
      .filter((column) => column);

    grid.row = {
      id: row.id,
      element: row,
      columns: columns,
      editMode: grid.editMode,
      bind: (entity, edtMode) => {
        columns.forEach((column) => column.column.bind(row, entity, edtMode));
      },
      refresh: grid.refresh,
    };

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

  bind(jsonData, fetchUrl) {
    let grid = this;

    super.bind(jsonData, fetchUrl);

    let entity = jsonData ? jsonData : {}; 
    let self = actionLink(entity, "self");

    grid.editMode = self ? EditMode.UPDATE : EditMode.ADD;
    //history.replaceState({}, null, window.location.href.replace("new=true", "self="+self));

    grid.row.bind(entity, grid.editMode);
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

    let columns = grid.columns
      .map((column) => column.addTableCell(row))
      .filter((column) => column);

    let rowEntry = {
      id: row.id,
      element: row,
      columns: columns,
      editMode: grid.editMode,
      bind: (entity, edtMode) => {
        columns.forEach((column) => column.column.bind(row, entity, edtMode));
      },
      remove: grid.remove,
      refresh: grid.refresh,
    };

    grid.rows.push(rowEntry);

    return rowEntry;
  }

  addHeader(table) {
    let grid = this;

    let header = document.createElement("thead");
    header.id = grid.tableId + "_thead";
    header.className = "thead";
    table.append(header);

    let headRow = document.createElement("tr");
    headRow.id = grid.tableId + "Head";
    headRow.className = "table-head";
    header.append(headRow);

    grid.columns.forEach((column) => column.addHeading(headRow));
  }

  addBody(table) {
    let grid = this;

    let body = document.createElement("tbody");
    body.id = grid.tableId + "_tbody";
    body.className = "tbody";
    table.append(body);

    for (let rowNum = 0; rowNum < grid.pageSize; rowNum++) {
      grid.appendTableRow();
    }
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

    let tf = document.createElement("td");
    tf.className = "table-footer";
    addText(tf, " ");
    navRow.append(tf);
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

    let totalLength = grid.columns.reduce(
      (length, column) => Math.max(boxSize(column.length), length),
      0
    );

    grid.columns.forEach((column) => {
      let col = document.createElement("col");
      setWidths(
        col,
        Math.floor((boxSize(column.length) * 100) / totalLength) + "%"
      );
      group.append(col);
    });

    table.appendChild(group);

    grid.addHeader(table);

    grid.addBody(table);

    grid.addFooter(table);
  }

  freeRow() {
    let grid = this;

    return grid.appendTableRow();
  }

  addRow(saveUrl) {
    let grid = this;

    let row = grid.freeRow();

    row.bind({}, EditMode.ADD);
    row.getElementsByTagName("INPUT")[0].focus();
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

    let tf = document.createElement("td");
    tf.className = "table-footer";
    addText(tf, " ");
    navRow.append(tf);

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