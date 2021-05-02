//module "utils.js";
"use strict";

const apiUrl = (path) => {
  return window.location.origin + "/ModellBahn/api/" + path;
};
const fileUrl = (path) => {
  return window.location.origin + "/ModellBahn/modellbahn-ui/" + path;
};

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

const createImage = (source, className) => {
  let img = document.createElement("img");
  img.className = className;
  img.src = source ? source : "";
  return img;
};

const addHeading = (element, type, text) => {
  let h = document.createElement(type);
  addText(h, translate(text));
  element.appendChild(h);
  return h;
};

const addRule = (element) => {
  let hr = document.createElement("hr");
  hr.className = "highlight";
  element.appendChild(hr);
  return hr;
};

const addModal = () => {
  let modal = document.getElementById("modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal";
    modal.className = "modal";

    let content = document.createElement("div");
    content.id = "modal-content";
    content.className = "modal-content";

    modal.appendChild(content);
    addToEnd(modal);

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

const createButton = (caption, imageName, action = undefined, className = "nav-button") => {
  let btn = document.createElement("button");
  btn.value = translate(caption);
  if (action) {
    btn.addEventListener("click", action, false);
  }
  btn.className = className;
  let img = document.createElement("img");
  img.className = className;
  img.alt = imageName;
  img.src = imageSource(imageName);
  btn.appendChild(img);
  return btn;
};

const addText = (cell, text) => {
  let txt = document.createTextNode(text);
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

const reportError = (description, error) => {
  console.trace("%s: %o", description, error);
  let alertBox = document.getElementById("alert-box");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alert-box";
    alertBox.className = "alert";
    let closer = document.createElement("span");
    closer.className = "closebtn";
    closer.onclick = () => {
      alertBox.style.display = "none";
    };
    addText(closer, translate("CLOSE"));
    alertBox.appendChild(closer);
    let messageSpan = document.createElement("span");
    messageSpan.id = "alert-message";
    alertBox.appendChild(messageSpan);
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

const showModal = content => {
  let modal = addModal();

  let contents = document.getElementById("modal-content");
  removeChildren(contents);

  let closer = document.createElement("div");
  closer.className = "closebtn";
  closer.onclick = () => {
    modal.style.display = "none";
  };
  addText(closer, translate("CLOSE"));
  contents.appendChild(closer);

  contents.appendChild(content);
  modal.style.display = "block";
};

const showAbout = async licenseUrl => {
  await download(
    licenseUrl,
    text => {
      let about = document.createElement("div");
      about.className = "about";

      let heading = document.createElement("div");
      heading.className = "about-header";
      about.appendChild(heading);

      let h2 = addHeading(heading, "h2", "ABOUT");
      h2.className = "about-h2";

      let body = document.createElement("div");
      body.className = "about-body";
      about.appendChild(body);

      let area = document.createElement("textarea");
      area.value = text;
      area.readOnly = true;
      area.disabled = true;
      body.appendChild(area);

      let footer = document.createElement("div");
      footer.className = "about-footer";
      about.appendChild(footer);

      showModal(about);
    },
    error => reportError(licenseUrl, error)
  );
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

const navLink = (title, href, action, id) => {
  let li = document.createElement("li");
  let a = document.createElement("a");
  if (id) {
    a.id = id;
  }
  a.className = "nav-button";
  a.href = href;
  if (action) {
    a.addEventListener("click", action, false);
  }
  addText(a, translate(title));
  li.appendChild(a);

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

const addLingo = (element) => {
  let lingo = document.createElement("img");
  lingo.src = fileUrl(translate("FLAG"));
  lingo.className = "lingo";
  element.appendChild(lingo);
  lingo.addEventListener("click", () => toggleLanguage(), false);
  return lingo;
};

const addLogo = (element) => {
  let logo = document.createElement("img");
  logo.src = imageSource("ModellBahn", ".svg");
  logo.className = "logo";
  element.appendChild(logo);
  logo.addEventListener("click", () => showAbout(fileUrl(translate("LIZENZ"))), false);
  return logo;
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
    let home = document.createElement("div");
    home.className = "home";
    nav.appendChild(home);

    let heading = addHeading(home, "H1", "MODELLBAHN");
    heading.className = "title";

    let bar = document.createElement("div");
    bar.style.display = "flex";
    bar.style.float = "right";
    home.appendChild(bar);

    addLingo(bar);
    addLogo(bar);

    addHeading(nav, "H3", "REF_DATA");

    let ref = document.createElement("ul");
    ref.className = "nav";
    nav.appendChild(ref);

    refData().filter((li) => document.location.href !== li.firstChild.href)
             .sort((a, b) => a.innerText.localeCompare(b.innerText))
             .forEach((li) => ref.appendChild(li));

    addHeading(nav, "H3", "INVENTORY");

    let inv = document.createElement("ul");
    inv.className = "nav";
    nav.appendChild(inv);

    inventory().filter((li) => document.location.href !== li.firstChild.href)
               .sort((a, b) => a.innerText.localeCompare(b.innerText))
               .forEach((li) => inv.appendChild(li));
  } else {
    let div = document.createElement("div");
    div.style.display = "flex";
    nav.appendChild(div);

    let opts = document.createElement("ul");
    opts.className = "nav";
    div.appendChild(opts);

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

    let bar = document.createElement("div");
    bar.style.display = "flex";
    bar.style.float = "right";
    div.appendChild(bar);

    addLingo(bar);
    addLogo(bar);
  }

  addRule(nav);

  let section = document.getElementsByTagName("SECTION")[0];
  section.style.top = nav.getBoundingClientRect().height + "px";
};

const addFooter = () => {
  let div = document.getElementsByTagName("FOOTER")[0];
  removeChildren(div);

  let hr = document.createElement("hr");
  hr.className = "highlight";
  div.appendChild(hr);

  let ul = document.createElement("ul");
  ul.className = "footer";
  div.appendChild(ul);

  let li = document.createElement("li");
  addText(li, translate("COPYRIGHT"));
  ul.appendChild(li);
};

const layout = async menuStyle => {
  setAuthorisation("johng", "password");
  await loadTranslations(getLanguage());
  addNavBar(menuStyle);
  addFooter();
};

window.onerror = (message, path, lineNo, columnNo, error) => {
  if (message.toLowerCase().includes("script error")) {
    reportError("Script Error: See Browser Console for Detail", error);
  } else {
    reportError(
      translate("ERROR_DETAIL", {
        msg: message,
        url: path,
        lineNo: lineNo,
        columnNo: columnNo,
        error: error.toString(),
      }),
      error
    );
  }
  return false;
};