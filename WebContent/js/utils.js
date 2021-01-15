// module 'utils.js'
'use strict';

const NavMenu = {
  BACK: 0,
  REF_DATA: 1,
  INVENTORY: 2,
  HOME: 3
};

window.onerror = function (msg, url, lineNo, columnNo, error) {
  if (msg.toLowerCase().includes('script error')) {
    reportError('Script Error: See Browser Console for Detail');
  } else {
    const message = getMessage('ERROR_DETAIL', {
      msg: msg,
      url: url,
      lineNo: lineNo,
      columnNo: columnNo,
      error:  error.toString()
    });

    reportError(message);
  }

  return false;
};

const apiRoot = () => {
  return window.location.origin + '/ModellBahn/api/';
};

const siteRoot = () => {
  return window.location.origin + '/ModellBahn/modellbahn-ui/';
};

const fetchUrl = (dataType) => {
  let fetchUrl = apiRoot() + dataType;
  let searchParams = new URLSearchParams(location.search);

  if (searchParams.has('self')) { fetchUrl = searchParams.get('self') }

  return fetchUrl;
};

const removeChildren = (node) => {
  while (node.firstChild) { node.removeChild(node.firstChild) }
};

const addToEnd = (element) => {
  let docBody = document.getElementsByTagName('BODY')[0];
  docBody.appendChild(element);
};

const addToStart = (element) => {
  let docBody = document.getElementsByTagName('BODY')[0];
  docBody.insertBefore(element, docBody.firstChild);
};

const reportError = (error) => {
  console.log(error);

  let alertBox = document.getElementById('alert-box');

  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'alert-box';
    alertBox.className = 'alert';

    let closer = document.createElement('span');
    closer.className = 'closebtn';
    closer.onclick = () => { alertBox.style.display = 'none' };
    addText(closer, 'x');
    alertBox.appendChild(closer);

    let message = document.createElement('span');
    message.id = 'alert-message';
    alertBox.appendChild(message);

    let body = document.getElementsByTagName('BODY')[0];
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

  let message = document.getElementById('alert-message');
  if (message) {
    message.innerText = error;
    alertBox.style.display = 'inline-block';
  }
};

const getLink = (links, rel) => {
  if (!links || !links[rel]) { return; }
  return links[rel][0].href;
};

const getImgSrc = (image) => {
  return getImgSource(image, '.png');
};

const getImgSource = (image, extension) => {
  return siteRoot() + 'img/' + image + extension;
};

const getImg = (action) => {
  let img = document.createElement('img');

  img.alt = action;
  img.src = getImgSrc(action);

  return img;
};

const addLogo = (element) => {
  let logo = document.createElement('img');
  logo.src = getImgSource('ModellBahn', '.svg');
  logo.className = 'logo';
  element.appendChild(logo);
  return logo;
};

const getButton = (value, alt, action) => {
  let btn = document.createElement('button');

  btn.value = getMessage(value.toUpperCase());
  if (action) { btn.addEventListener('click', action) }
  btn.className = 'nav-button';

  let img = getImg(alt);
  img.className = 'nav-button';

  btn.appendChild(img);

  return btn;
};

const addText = (cell, text) => {
  let txt = document.createTextNode(getMessage(text));
  if (cell.firstChild) {
    cell.insertBefore(txt, cell.firstChild);
  } else {
    cell.appendChild(txt);
  }
  return txt;
};

const addOption = (select, value, text) => {
  let opt = document.createElement('option');
  opt.value = value;
  opt.text = text;
  select.add(opt);
};

const valueAndUnits = (cssSize) => {
  let dims = /^(\d+)([^\d]+)$/.exec(cssSize);
  return {
    value: dims[1],
    units: dims[2]
  };
};

const boxSize = (length) => {
  return Math.ceil(length / 5) * 5;
};

const addHeading = (element, type, text) => {
  let h = document.createElement(type);
  addText(h, text);
  element.appendChild(h);
  return h;
};

const addRule = (element) => {
  let hr = document.createElement('hr');
  hr.className = 'highlight';
  element.appendChild(hr);
  return hr;
};

async function checkResponse(response) {
  let clone = response.clone();
  if (200 <= response.status && response.status <= 202) {
    return response.json();
  } else if (response.status === 204) {
    return {entities: [], links: []};
  } else if (response.status === 400 || response.status === 500) {
    let errorMessage = response.status + ': ' + response.statusText;

    try {
      let jsonData = await response.json();

      errorMessage = jsonData.errorCode + ': ' + jsonData.userMessage;
    } catch (err) {
      errorMessage = await clone.text();
    }

    console.log(errorMessage);

    throw new Error(errorMessage);
  } else {
    console.log(response.statusText);

    throw new Error(response.statusText);
  }
}

const addModal = () => {
  let modal = document.getElementById('modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';

    let content = document.createElement('div');
    content.id = 'modal-content';
    content.className = 'modal-content';

    modal.appendChild(content);
    addToEnd(modal);

    window.addEventListener('click', (e) => { if (e.target === modal) { modal.style.display = 'none'; } }, false);
  }

  return modal;
};

const showModal = (content) => {
  let modal = addModal();

  let contents = document.getElementById('modal-content');
  removeChildren(contents);

  let closer = document.createElement('div');
  closer.className = 'closebtn';
  closer.onclick = () => { modal.style.display = 'none' };
  addText(closer, 'x');
  contents.appendChild(closer);

  contents.appendChild(content);
  modal.style.display = 'block';
};

const about = () => {
  fetch(siteRoot() + 'LICENSE')
  .then(response => response.text())
  .then(text => {
    let about = document.createElement('div');
    about.className = 'about';

    let heading = document.createElement('div');
    heading.className = 'about-header';
    about.appendChild(heading);

    let h2 = addHeading(heading, 'h2', 'ABOUT');
    h2.className = 'about-h2';
    addLogo(heading);

    let body = document.createElement('div');
    body.className = 'about-body';
    about.appendChild(body);

    let area = document.createElement('textarea');
    area.value = text;
    area.readOnly = true;
    area.disabled = true;
    body.appendChild(area);

    let footer = document.createElement('div');
    footer.className = 'about-footer';
    about.appendChild(footer);

    showModal(about);
  })
  .catch(error => reportError(error));
};

const setActiveTab = (event, tabName) => {
  let tabContents = document.getElementsByClassName('tabContent');
  let tabLinks = document.getElementsByClassName('tabLinks');

  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = (tabContents[i].id === tabName) ? 'block' : 'none';
  }

  resizeAll();

  let linkName = tabName.replace('Tab', 'Link');
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = (tabLinks[i].id === linkName) ? 'tabLinks active' : 'tabLinks';
  }
};

const setWidths = (element, width) => {
  element.width = width;
  //element.maxWidth = width;  
  element.style.width = width;
  element.style.maxWidth = width;
};

const resizeAll = (element = document) => {
  let nav = element.getElementsByTagName('NAV')[0];
  let rect = nav.getBoundingClientRect();
  let section = document.getElementsByTagName('SECTION')[0];
  section.style.top = rect.height + 'px';

  let tables = element.getElementsByTagName('TABLE');
  for (let i = 0; i < tables.length; i++) {
    let rect = tables[i].getBoundingClientRect();
    setWidths(tables[i].getElementsByTagName('TBODY')[0], rect.width + 'px');
  }
};

window.addEventListener('resize', () => { resizeAll() }, true);

async function removeFile(deleteUrl, grid, rowId) {
  await fetch(deleteUrl, { method: 'DELETE', headers: {'Content-type': 'application/json'} })
  .then(response => checkResponse(response))
  .then(jsonData => grid.renderUpdate(jsonData, rowId))
  .catch(error => reportError(error));
}

async function uploadFile(e, uploadUrl, fileData, grid, rowId) {
  let body = new FormData();

  body.append('file', fileData);

  await fetch(uploadUrl, { method: 'PUT', body: body })
  .then(response => checkResponse(response))
  .then(jsonData => grid.renderUpdate(jsonData, rowId))
  .catch(error => reportError(error));
}

const readFile = (uploadUrl, fileData, grid, rowId) => {
  const reader = new FileReader();

  reader.onload = (e) => { uploadFile(e, uploadUrl, fileData, grid, rowId) };

  reader.onerror = (e) => {
    reader.abort();

    reportError(getMessage('BADFILE', [fileData, e]));
  };

  reader.readAsDataURL(fileData);
};

const navLink = (title, href, action, id) => {
  let li = document.createElement('li');
  let a = document.createElement('a');
  if (id) { a.id = id; }
  a.className = 'nav-button';
  a.href = href;
  if (action) { a.addEventListener('click', action) }
  addText(a, title);
  li.appendChild(a);

  return li;
};

const addHomeBack = (ul) => {
  ul.appendChild(navLink('HOME', siteRoot() + 'index.html'));
  ul.appendChild(navLink('BACK', '#', () => { history.back() }));
};

const addNavBar = (menuStyle) => {
  let header = document.getElementsByTagName('HEADER')[0];
  removeChildren(header);

  let nav = document.createElement('nav');
  header.appendChild(nav);

  if (menuStyle === NavMenu.HOME) {
    let div = document.createElement('div');
    div.className = 'home';
    nav.appendChild(div);
    let heading = addHeading(div, 'H1', 'MODELLBAHN');
    heading.className = 'title';
    addLogo(div);
    addRule(nav);
  }

  if (menuStyle !== NavMenu.INVENTORY) {
    let ul = document.createElement('ul');
    ul.className = 'nav';

    if (menuStyle === NavMenu.HOME) {
      addHeading(nav, 'H3', 'REF_DATA');
    } else {
      addHomeBack(ul);
    }

    if (menuStyle !== NavMenu.BACK) {
      let lnks = [];
      lnks.push(navLink('ANTRIEBEN', siteRoot() + 'antrieben.html'));
      lnks.push(navLink('AUFBAUTEN', siteRoot() + 'aufbauten.html'));
      lnks.push(navLink('BAHNVERWALTUNGEN', siteRoot() + 'bahnverwaltungen.html'));
      lnks.push(navLink('DECODER_TYPEN', siteRoot() + 'decoderTypen.html'));
      lnks.push(navLink('EPOCHEN', siteRoot() + 'epochen.html'));
      lnks.push(navLink('GATTUNGEN', siteRoot() + 'gattungen.html'));
      lnks.push(navLink('HERSTELLERN', siteRoot() + 'herstellern.html'));
      lnks.push(navLink('KATEGORIEN', siteRoot() + 'kategorien.html'));
      lnks.push(navLink('KUPPLUNGEN', siteRoot() + 'kupplungen.html'));
      lnks.push(navLink('LICHTEN', siteRoot() + 'lichten.html'));
      lnks.push(navLink('MASSSTABEN', siteRoot() + 'massstaben.html'));
      lnks.push(navLink('MOTOR_TYPEN', siteRoot() + 'motorTypen.html'));
      lnks.push(navLink('PROTOKOLLEN', siteRoot() + 'protokollen.html'));
      lnks.push(navLink('SONDERMODELLEN', siteRoot() + 'sonderModellen.html'));
      lnks.push(navLink('SPURWEITEN', siteRoot() + 'spurweiten.html'));
      lnks.push(navLink('STEUERUNGEN', siteRoot() + 'steuerungen.html'));
      lnks.push(navLink('ZUG_TYPEN', siteRoot() + 'zugtypen.html'));
      lnks.filter(li => { return document.location.href !== li.firstChild.href })
          .sort((a, b) => { return a.innerText.localeCompare(b.innerText) })
          .forEach(li => ul.appendChild(li));
    }

    nav.appendChild(ul);
    if (menuStyle !== NavMenu.HOME) {
      addLogo(nav);
    }
    addRule(nav);
  }

  if (menuStyle === NavMenu.INVENTORY || menuStyle === NavMenu.HOME) {
    let ul = document.createElement('ul');
    ul.className = 'nav';

    if (menuStyle === NavMenu.HOME) {
      addHeading(nav, 'H3', 'INVENTORY');
    } else {
      addHomeBack(ul);
    }

    let lnks = [];
    lnks.push(navLink('ARTIKELEN', siteRoot() + 'artikelen.html'));
    lnks.push(navLink('DECODEREN', siteRoot() + 'decoderen.html'));
    lnks.push(navLink('PRODUKTEN', siteRoot() + 'produkten.html'));
    lnks.push(navLink('VORBILDER', siteRoot() + 'vorbilder.html'));
    lnks.push(navLink('ZUGEN', siteRoot() + 'zugen.html'));
    lnks.filter(li => { return document.location.href !== li.firstChild.href })
        .sort((a, b) => { return a.innerText.localeCompare(b.innerText) })
        .forEach(li => ul.appendChild(li));

    nav.appendChild(ul);
    if (menuStyle !== NavMenu.HOME) {
      addLogo(nav);
    }
    addRule(nav);
  }

  let rect = nav.getBoundingClientRect();
  let section = document.getElementsByTagName('SECTION')[0];
  section.style.top = rect.height + 'px';
};

const addFooter = () => {
  let div = document.getElementsByTagName('FOOTER')[0];
  removeChildren(div);

  let hr = document.createElement('hr');
  hr.className = 'highlight';
  div.appendChild(hr);

  let ul = document.createElement('ul');
  ul.className = 'footer';
  div.appendChild(ul);

  let li = document.createElement('li');
  addText(li, 'COPYRIGHT');
  ul.appendChild(li);

  ul.appendChild(navLink('ABOUT', '#', about, 'license'));
};

const createStyle = (className, values) => {
  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = className & ' ' & JSON.stringify(values, null, 1).replace(/"/g, '');
  document.getElementsByTagName('head')[0].appendChild(style);
};

const layout = async (menuStyle) => {
    await loadTranslations(siteRoot(), language());
    addNavBar(menuStyle);
    addFooter();
};
