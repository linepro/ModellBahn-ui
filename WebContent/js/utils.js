// module "utils.js"
"use strict"

const resizeAll = (element = document) => {
  let nav = element.getElementsByTagName("NAV")[0]
  let rect = nav.getBoundingClientRect()
  let section = document.getElementsByTagName("SECTION")[0]
  section.style.top = rect.height + "px"

  let tables = element.getElementsByTagName("TABLE")
  for (let i = 0; i < tables.length; i++) {
    let rect = tables[i].getBoundingClientRect()
    setWidths(tables[i].getElementsByTagName("TBODY")[0], rect.width + "px")
  }
}

const apiUrl = (path) => { return window.location.origin + "/ModellBahn/api/" + path }
const fileUrl = (path) => { return window.location.origin + "/ModellBahn/modellbahn-ui/" + path }

const fetchUrl = (dataType) => {
  let searchParams = new URLSearchParams(location.search)
  if (searchParams.has("self")) { return searchParams.get("self") }
  return apiUrl(dataType)
}

const imageSource = (imageName, extension) => { return fileUrl("img/" + imageName + (extension ? extension : ".png")) }

const addToEnd = (element) => {
  let docBody = document.getElementsByTagName("BODY")[0]
  docBody.appendChild(element)
}

const addToStart = (element) => {
  let docBody = document.getElementsByTagName("BODY")[0]
  docBody.insertBefore(element, docBody.firstChild)
}

const createImage = (action) => {
  let img = document.createElement("img")
  img.alt = action
  img.src = imageSource(action)
  return img
}

const addHeading = (element, type, text) => {
  let h = document.createElement(type)
  addText(h, text)
  element.appendChild(h)
  return h
}

const addRule = (element) => {
  let hr = document.createElement("hr")
  hr.className = "highlight"
  element.appendChild(hr)
  return hr
}

const addModal = () => {
  let modal = document.getElementById("modal")

  if (!modal) {
    modal = document.createElement("div")
    modal.id = "modal"
    modal.className = "modal"

    let content = document.createElement("div")
    content.id = "modal-content"
    content.className = "modal-content"

    modal.appendChild(content)
    addToEnd(modal)

    window.addEventListener("click", (e) => { if (e.target === modal) { modal.style.display = "none" } }, false)
  }

  return modal
}

const createButton = (value, alt, action) => {
  let btn = document.createElement("button")
  btn.value = translate(value.toUpperCase())
  if (action) { btn.addEventListener("click", action) }
  btn.className = "nav-button"
  let img = createImage(alt)
  img.className = "nav-button"
  btn.appendChild(img)
  return btn
}

const addText = (cell, text) => {
  let txt = document.createTextNode(translate(text))
  if (cell.firstChild) {
    cell.insertBefore(txt, cell.firstChild)
  } else {
    cell.appendChild(txt)
  }
  return txt
}

const removeChildren = (node) => {
  while (node.firstChild) { node.removeChild(node.firstChild) }
}

const addOption = (select, value, text) => {
  let opt = document.createElement("option")
  opt.value = value
  opt.text = text
  select.add(opt)
}

const reportError = (description, error) => {
  console.log(description + ": " + error)
  let alertBox = document.getElementById("alert-box")
  if (!alertBox) {
    alertBox = document.createElement("div")
    alertBox.id = "alert-box"
    alertBox.className = "alert"
    let closer = document.createElement("span")
    closer.className = "closebtn"
    closer.onclick = () => { alertBox.style.display = "none" }
    addText(closer, "x")
    alertBox.appendChild(closer)
    let message = document.createElement("span")
    message.id = "alert-message"
    alertBox.appendChild(message)
    let body = document.getElementsByTagName("BODY")[0]
    if (body) {
      if (body.firstChild) {
        body.insertBefore(alertBox, body.firstChild)
      } else {
        body.appendChild(alertBox)
      }
    } else {
      alert(error)
    }
  }

  let message = document.getElementById("alert-message")
  if (message) {
    message.innerText = description + ":\n" + error
    alertBox.style.display = "inline-block"
  }
}

const showModal = (content) => {
  let modal = addModal()

  let contents = document.getElementById("modal-content")
  removeChildren(contents)

  let closer = document.createElement("div")
  closer.className = "closebtn"
  closer.onclick = () => { modal.style.display = "none" }
  addText(closer, "x")
  contents.appendChild(closer)

  contents.appendChild(content)
  modal.style.display = "block"
}

const showAbout = async (licenseUrl) => {
  await download(licenseUrl,
    (text) => {
	    let about = document.createElement("div")
	    about.className = "about"
	
	    let heading = document.createElement("div")
	    heading.className = "about-header"
	    about.appendChild(heading)
	
	    let h2 = addHeading(heading, "h2", "ABOUT")
	    h2.className = "about-h2"
	
	    let body = document.createElement("div")
	    body.className = "about-body"
	    about.appendChild(body)
	
	    let area = document.createElement("textarea")
	    area.value = text
	    area.readOnly = true
	    area.disabled = true
	    body.appendChild(area)
	
	    let footer = document.createElement("div")
	    footer.className = "about-footer"
	    about.appendChild(footer)
	
	    showModal(about)
   }, (error) => reportError(licenseUrl, error))
}

const setActiveTab = (event, tabName) => {
  let tabContents = document.getElementsByClassName("tabContent")
  let tabLinks = document.getElementsByClassName("tabLinks")

  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = (tabContents[i].id === tabName) ? "block" : "none"
  }

  resizeAll()

  let linkName = tabName.replace("Tab", "Link")
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = (tabLinks[i].id === linkName) ? "tabLinks active" : "tabLinks"
  }
}

const navLink = (title, href, action, id) => {
  let li = document.createElement("li")
  let a = document.createElement("a")
  if (id) { a.id = id }
  a.className = "nav-button"
  a.href = href
  if (action) { a.addEventListener("click", action) }
  addText(a, title)
  li.appendChild(a)

  return li
}

const addHomeBack = (ul) => {
  ul.appendChild(navLink("HOME", fileUrl("index.html")))
  ul.appendChild(navLink("BACK", "#", () => { history.back() }))
}

const NavMenu = {
  BACK: 0,
  REF_DATA: 1,
  INVENTORY: 2,
  HOME: 3
}

const addLogo = (element) => {
  let logo = document.createElement("img")
  logo.src = imageSource("ModellBahn", ".svg")
  logo.className = "logo"
  element.appendChild(logo)
  logo.addEventListener('click', () => showAbout(fileUrl(translate("LIZENZ")), "license"))
  return logo
}

const addNavBar = (menuStyle) => {
  let header = document.getElementsByTagName("HEADER")[0]
  removeChildren(header)

  let nav = document.createElement("nav")
  header.appendChild(nav)

  if (menuStyle === NavMenu.HOME) {
    let div = document.createElement("div")
    div.className = "home"
    nav.appendChild(div)
    let heading = addHeading(div, "H1", "MODELLBAHN")
    heading.className = "title"
    addLogo(div)
    addRule(nav)
  }

  if (menuStyle !== NavMenu.INVENTORY) {
    let ul = document.createElement("ul")
    ul.className = "nav"

    if (menuStyle === NavMenu.HOME) {
      addHeading(nav, "H3", "REF_DATA")
    } else {
      addHomeBack(ul)
    }

    if (menuStyle !== NavMenu.BACK) {
      let lnks = []
      lnks.push(navLink("ANTRIEBEN", fileUrl("antrieben.html")))
      lnks.push(navLink("AUFBAUTEN", fileUrl("aufbauten.html")))
      lnks.push(navLink("BAHNVERWALTUNGEN", fileUrl("bahnverwaltungen.html")))
      lnks.push(navLink("DECODER_TYPEN", fileUrl("decoderTypen.html")))
      lnks.push(navLink("EPOCHEN", fileUrl("epochen.html")))
      lnks.push(navLink("GATTUNGEN", fileUrl("gattungen.html")))
      lnks.push(navLink("HERSTELLERN", fileUrl("herstellern.html")))
      lnks.push(navLink("KATEGORIEN", fileUrl("kategorien.html")))
      lnks.push(navLink("KUPPLUNGEN", fileUrl("kupplungen.html")))
      lnks.push(navLink("LICHTEN", fileUrl("lichten.html")))
      lnks.push(navLink("MASSSTABEN", fileUrl("massstaben.html")))
      lnks.push(navLink("MOTOR_TYPEN", fileUrl("motorTypen.html")))
      lnks.push(navLink("PROTOKOLLEN", fileUrl("protokollen.html")))
      lnks.push(navLink("SONDERMODELLEN", fileUrl("sonderModellen.html")))
      lnks.push(navLink("SPURWEITEN", fileUrl("spurweiten.html")))
      lnks.push(navLink("STEUERUNGEN", fileUrl("steuerungen.html")))
      lnks.push(navLink("ZUG_TYPEN", fileUrl("zugtypen.html")))
      lnks.filter(li => { return document.location.href !== li.firstChild.href })
          .sort((a, b) => { return a.innerText.localeCompare(b.innerText) })
          .forEach(li => ul.appendChild(li))
    }

    nav.appendChild(ul)
    if (menuStyle !== NavMenu.HOME) {
      addLogo(nav)
    }
    addRule(nav)
  }

  if (menuStyle === NavMenu.INVENTORY || menuStyle === NavMenu.HOME) {
    let ul = document.createElement("ul")
    ul.className = "nav"

    if (menuStyle === NavMenu.HOME) {
      addHeading(nav, "H3", "INVENTORY")
    } else {
      addHomeBack(ul)
    }

    let lnks = []
    lnks.push(navLink("ARTIKELEN", fileUrl("artikelen.html")))
    lnks.push(navLink("DECODEREN", fileUrl("decoderen.html")))
    lnks.push(navLink("PRODUKTEN", fileUrl("produkten.html")))
    lnks.push(navLink("VORBILDER", fileUrl("vorbilder.html")))
    lnks.push(navLink("ZUGEN", fileUrl("zugen.html")))
    lnks.filter(li => { return document.location.href !== li.firstChild.href })
        .sort((a, b) => { return a.innerText.localeCompare(b.innerText) })
        .forEach(li => ul.appendChild(li))

    nav.appendChild(ul)
    if (menuStyle !== NavMenu.HOME) {
      addLogo(nav)
    }
    addRule(nav)
  }

  let rect = nav.getBoundingClientRect()
  let section = document.getElementsByTagName("SECTION")[0]
  section.style.top = rect.height + "px"
}

const addFooter = () => {
  let div = document.getElementsByTagName("FOOTER")[0]
  removeChildren(div)

  let hr = document.createElement("hr")
  hr.className = "highlight"
  div.appendChild(hr)

  let ul = document.createElement("ul")
  ul.className = "footer"
  div.appendChild(ul)

  let li = document.createElement("li")
  addText(li, "COPYRIGHT")
  ul.appendChild(li)
}

const layout = async (menuStyle) => {
    addNavBar(menuStyle)
    addFooter()
}

window.addEventListener("resize", () => { resizeAll() }, true)

window.onerror = function (message, path, lineNo, columnNo, error) {
  if (msg.toLowerCase().includes("script error")) {
    reportError("Script Error: See Browser Console for Detail")
  } else {
    let message = translate("ERROR_DETAIL", {
      msg: message,
      url: path,
      lineNo: lineNo,
      columnNo: columnNo,
      error:  error.toString()
    })

    reportError(message, error)
  }

  return false
}

const setWidths = (element, width) => {
  element.width = width
  element.style.width = width
  element.style.maxWidth = width
}
