//module "utils.js";
"use strict";

const fetchUrl = (dataType) => {
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.has("self")) {
    return searchParams.get("self");
  }
  return apiUrl(dataType);
};

const imageSource = (imageName, extension) => {
  return fileUrl("img/" + imageName + (extension ? extension : ".png"));
};

const addToEnd = (element) => {
  let docBody = document.getElementsByTagName("BODY")[0];
  docBody.appendChild(element);
};

const createImage = (parent, className, source, alt) => {
  let img = document.createElement("img");
  img.className = className;
  img.src = source ? source : "";
  img.alt = alt ? alt : img.src;
  if (parent) parent.appendChild(img);
  return img;
};

const addAnchor = (parent, text, url, newWindow) => {
  let a = document.createElement("a");
  a.href = url;
  if (newWindow) a.target = "_blank";
  addText(a, text);
  parent.appendChild(a);
  return a;
};

const createTextElement = (type, parent, text, className) => {
  let c = document.createElement(type);
  if (className) c.className = className;
  if (text) addText(c, text);
  if (parent) parent.appendChild(c);
  return c;
};

const addRule = (parent, className = "highlight") => {
  let hr = document.createElement("hr");
  hr.className = className;
  parent.appendChild(hr);
  return hr;
};

const createDiv = (parent, className, id) => {
  let d = document.createElement("div");
  if (id) d.id = id;
  if (className) d.className = className;
  if (parent) parent.appendChild(d);
  return d;
};

const addModal = () => {
  let modal = document.getElementById("modal");

  if (!modal) {
    modal = createDiv(undefined, "modal", "modal");
    addToEnd(modal);

    createDiv(modal, "modal-content", "modal-content");

    window.addEventListener(
      "click",
      e => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      },
      false
    );
  }

  return modal;
};

const createButton = (parent, caption, imageName, action = undefined, className = "nav-button", id = undefined) => {
  let btn = document.createElement("button");
  if (id) btn.id = id;
  btn.className = className;
  btn.value = translate(caption);
  if (action) {
    btn.addEventListener("click", action, false);
  }
  if (imageName) {
    createImage(btn, className, imageSource(imageName), btn.value);
  } else {
    addText(btn, btn.value);
  }
  if (parent) parent.appendChild(btn);
  return btn;
};

const addText = (cell, text) => {
  let txt = document.createTextNode(translate(text));
  if (cell.firstChild) {
    cell.insertBefore(txt, cell.firstChild);
  } else {
    cell.appendChild(txt);
  }
  return txt;
};

const addTooltip = (input, text) => {
  if (text) {
    input.setAttribute("data-tooltip", text);
    input.classList.add("tooltip");
  } else {
    input.removeAttribute("data-tooltip");
    input.classList.remove("tooltip");
  }
};

const removeChildren = (node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};

const createOptGroup = (text) => {
  let grp = document.createElement("optgroup");
  grp.label = text;
  return grp;
};

const createOption = (value, text, tooltip, abbildung) => {
  let opt = document.createElement("option");
  opt.value = value;
  opt.text = text;
  opt.setAttribute("data-img", abbildung);
  opt.setAttribute("data-desc", tooltip);
  return opt;
};

const createSpan = (parent, className, id) => {
  let spn = document.createElement("span");
  if (id) spn.id = id;
  spn.className = className;
  if (parent) parent.appendChild(spn);
  return spn;
};

const createInput = (type, parent, className, id) => {
  let inp = document.createElement("input");
  inp.type = type;
  if (id) inp.id = id;
  inp.className = className;
  if (parent) parent.appendChild(inp);
  return inp;
};

const createUl = (parent, className, id) => {
  let ul = document.createElement("ul");
  if (id) ul.id = id;
  ul.className = className;
  if (parent) parent.appendChild(ul);
  return ul;
};

const createLi = (parent, className, text, id) => {
  let li = document.createElement("li");
  if (id) li.id = id;
  li.className = className;
  if (text) addText(li, text);
  if (parent) parent.appendChild(li);
  return li;
};

const createTh = (parent, className, id) => {
  let th = document.createElement("th");
  if (id) ul.id = id;
  th.className = className;
  if (parent) parent.appendChild(th);
  return th;
};

const createTd = (parent, className, id) => {
  let td = document.createElement("td");
  if (id) td.id = id;
  td.className = className;
  if (parent) parent.appendChild(td);
  return td;
};

const createTr = (parent, className, id) => {
  let tr = document.createElement("tr");
  if (id) tr.id = id;
  tr.className = className;
  if (parent) parent.appendChild(tr);
  return tr;
};

const createTextarea = (parent, className, id) => {
  let ta = document.createElement("textarea");
  if (id) ta.id = id;
  ta.className = className;
  if (parent) parent.appendChild(ta);
  return ta;
};

const createSelect = (parent, className, size, id) => {
  let sel = document.createElement("select");
  if (id) sel.id = id;
  sel.className = className;
  sel.multiple = false;
  sel.size = size;
  if (parent) parent.appendChild(sel);
  return sel;
};

const createThead = (parent, className, id) => {
  let th = document.createElement("thead");
  if (id) th.id = id;
  th.className = className;
  if (parent) parent.appendChild(th);
  return th;
};

const createTbody = (parent, className, id) => {
  let tb = document.createElement("tbody");
  if (id) tb.id = id;
  tb.className = className;
  if (parent) parent.appendChild(tb);
  return tb;
};

const createTfoot = (parent, className, id) => {
  let tf = document.createElement("tfoot");
  if (id) tf.id = id;
  tf.className = className;
  if (parent) parent.appendChild(tf);
  return tf;
};

const createTable = (parent, className, id) => {
  let c = document.createElement("table");
  if (id) c.id = id;
  c.className = className;
  if (parent) parent.appendChild(c);
  return c;
};

const createColgroup = (parent, className, id) => {
  let g = document.createElement("colgroup");
  if (id) g.id = id;
  g.className = className;
  if (parent) parent.appendChild(g);
  return g;
};

const createCol = (parent, className, id) => {
  let c = document.createElement("col");
  if (id) c.id = id;
  c.className = className;
  if (parent) parent.appendChild(c);
  return c;
};

const createCanvas = (parent, className, id) => {
  let c = document.createElement("canvas");
  if (id) c.id = id;
  c.className = className;
  if (parent) parent.appendChild(c);
  return c;
};

const reportError = (description, error) => {
  console.trace("%s: %o", description, error);
  let alertBox = document.getElementById("alert-box");
  if (!alertBox) {
    alertBox = createDiv(undefined, "alert", "alert-box");
    let closer = createSpan(alertBox, "closebtn");
    closer.onclick = () => {
      alertBox.style.display = "none";
    };
    addText(closer, "CLOSE");
    createSpan(alertBox, undefined, "alert-message");
    let body = document.getElementsByTagName("BODY")[0];
    if (body) {
      if (body.firstChild) {
        body.insertBefore(alertBox, body.firstChild);
      } else {
        body.appendChild(alertBox);
      }
    } else {
      alert(error);
    }
  }

  let message = document.getElementById("alert-message");
  if (message) {
    message.innerText = description + ":\n" + error;
    alertBox.style.display = "inline-block";
  }
};

const showModal = (content, withCloser = true) => {
  let modal = addModal();

  let contents = document.getElementById("modal-content");
  removeChildren(contents);

  contents.appendChild(content);

  if (withCloser) {
    let closer = createDiv(contents, "closebtn");
    closer.onclick = () => {
      modal.style.display = "none";
    };
    addText(closer, "CLOSE");
  }

  modal.style.display = "block";
};

const setActiveTab = (event, tabName) => {
  let activeLink = tabName.replace("Tab", "Link");
  let tabContents = document.getElementsByClassName("tabContent");
  for (let tab of tabContents) {
    tab.style.display = (tab.id === tabName) ? "block" : "none";
    let link = document.getElementById(tab.id.replace("Tab", "Link"));
    if (link) {
      link.className = (link.id === activeLink) ? "tabLinks active" : "tabLinks"
    }
  }
};

const navLink = (title, href, action, id, className = "nav-button") => {
  let li = createLi(undefined, className, undefined, id);
  let a = addAnchor(li, title, href);
  a.className = "nav-button";
  if (action) {
    a.addEventListener("click", action, false);
  }
  return li;
};

const addHomeBack = ul => {
  ul.appendChild(navLink("HOME", fileUrl("index.html")));
  ul.appendChild(
    navLink("BACK", "#", () => {
      history.back();
    })
  );
};

const NavMenu = {
  BACK: 0,
  REF_DATA: 1,
  INVENTORY: 2,
  HOME: 3,
};

const addLingo = (parent) => {
  let lingo = createImage(parent, "lingo", fileUrl(translate("FLAG")));
  lingo.addEventListener("click", () => toggleLanguage(), false);
  return lingo;
};

const addLogo = (home, offset) => {
    let bar = createDiv(home, "dropdown");
    bar.style = "float: right; margin-top: 0.5rem; transform: translateX("+offset+"rem);"

    let logo = createDiv(bar, "logo dropdown");

    let logoImg = createImage(logo, "logo", imageSource("ModellBahn", ".svg"));
    
    let menu = createDiv(logo, "dropdown-content");

    let lingo = addLingo(menu);
    lingo.style = "float: right;"

    if (sessionId()) {
      addAnchor(menu, "PROFILE", "/account");
      addAnchor(menu, "LOGOUT", "/logout");
    } else {
      addAnchor(menu, "HOME", "/");
    }
    addAnchor(menu, "ABOUT", "/about.html", true);

    return bar;
};

const refData = () => [
  navLink("ACHSFOLGEN", fileUrl("achsfolgen.html")),
  navLink("ANTRIEBEN", fileUrl("antrieben.html")),
  navLink("AUFBAUTEN", fileUrl("aufbauten.html")),
  navLink("BAHNVERWALTUNGEN", fileUrl("bahnverwaltungen.html")),
  navLink("DECODER_TYPEN", fileUrl("decoderTypen.html")),
  navLink("EPOCHEN", fileUrl("epochen.html")),
  navLink("GATTUNGEN", fileUrl("gattungen.html")),
  navLink("HERSTELLERN", fileUrl("herstellern.html")),
  navLink("KATEGORIEN", fileUrl("kategorien.html")),
  navLink("KUPPLUNGEN", fileUrl("kupplungen.html")),
  navLink("LICHTEN", fileUrl("lichten.html")),
  navLink("MASSSTABEN", fileUrl("massstaben.html")),
  navLink("MOTOR_TYPEN", fileUrl("motorTypen.html")),
  navLink("PROTOKOLLEN", fileUrl("protokollen.html")),
  navLink("SONDERMODELLEN", fileUrl("sonderModellen.html")),
  navLink("SPURWEITEN", fileUrl("spurweiten.html")),
  navLink("STEUERUNGEN", fileUrl("steuerungen.html")),
  navLink("ZUG_TYPEN", fileUrl("zugTypen.html"))
  ];

const inventory = () => [
  navLink("ARTIKELEN", fileUrl("artikelen.html")),
  navLink("DECODEREN", fileUrl("decoderen.html")),
  navLink("PRODUKTEN", fileUrl("produkten.html")),
  navLink("VORBILDER", fileUrl("vorbilder.html")),
  navLink("ZUGEN", fileUrl("zugen.html"))
  ];

const addNavBar = (menuStyle) => {
  let header = document.getElementsByTagName("HEADER")[0];
  removeChildren(header);

  let nav = document.createElement("nav");
  header.appendChild(nav);

  if (menuStyle === NavMenu.HOME) {
    let home = createDiv(nav, "home");

    createTextElement("h1", home, "MODELLBAHN", "title");

    addLogo(home, 2);

    createTextElement("h3", nav, "REF_DATA");

    let ref = createUl(nav, "nav");

    refData().filter((li) => document.location.href !== li.firstChild.href)
             .sort((a, b) => a.innerText.localeCompare(b.innerText))
             .forEach((li) => ref.appendChild(li));

    createTextElement("h3", nav, "INVENTORY");

    let inv = createUl(nav, "nav");

    inventory().filter((li) => document.location.href !== li.firstChild.href)
               .sort((a, b) => a.innerText.localeCompare(b.innerText))
               .forEach((li) => inv.appendChild(li));
  } else {
    let div = createDiv(nav);
    div.style.display = "flex";

    let opts = createUl(div, "nav");

    addHomeBack(opts);

    if (menuStyle === NavMenu.INVENTORY) {
      inventory().filter((li) => document.location.href !== li.firstChild.href)
                 .sort((a, b) => a.innerText.localeCompare(b.innerText))
                 .forEach((li) => opts.appendChild(li));
    } else if (menuStyle === NavMenu.REF_DATA) {
      refData().filter((li) => document.location.href !== li.firstChild.href)
               .sort((a, b) => a.innerText.localeCompare(b.innerText))
               .forEach((li) => opts.appendChild(li));
    }

    addLogo(div, 8);
  }

  addRule(nav);

  let section = document.getElementsByTagName("SECTION")[0];
  section.style.top = nav.getBoundingClientRect().height + "px";
};

const addFooter = () => {
  let div = document.getElementsByTagName("FOOTER")[0];
  removeChildren(div);

  addRule(div);

  let ul = createUl(div, "footer");

  let api = createLi(ul);
  api.style = "float: left; margin-left: 0.5rem; position: relative;";
  let a = addAnchor(api, "API", "/swagger-ui/index.html");
  a.style = api.style;

  let co = createLi(ul, undefined, "COPYRIGHT");
  co.style = "margin-right: 0.5rem;";
};

const layout = async menuStyle => {
  //setAuthorisation("johng", "password");
  await loadTranslations(getLanguage());
  addNavBar(menuStyle);
  addFooter();
};

const errorHandler = (error) => {
  if (error.message.toLowerCase().includes("script error")) {
    reportError("Script Error: See Browser Console for Detail", error);
  } else {
    reportError(
      translate("ERROR_DETAIL", {
        msg: error.message,
        url: error.path,
        lineNo: error.lineNo,
        columnNo: error.columnNo,
        error: error.error.toString(),
      }),
      error.error
    );
  }
  return false;
};

window.addEventListener("error", errorHandler);