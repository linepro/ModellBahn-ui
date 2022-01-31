// module "fields.js";
"use strict";

const optionExtractor = (jsonData) => jsonData._embedded.data;

const bezeichnungOption = (entity) =>
  dropOption(
    entity.name,
    entity.bezeichnung,
    entity.tooltip ? entity.tooltip : entity.bezeichnung,
    entity.abbildung,
    undefined,
    entity
  );

const artikelOption = (entity) =>
  dropOption(
    entity.artikelId,
    [ entity.hersteller, entity.bestellNr, entity.gattung, entity.betreibsnummer, entity.bahnverwaltung ].filter(x => x).join(" ") + " (" + entity.artikelId + ")",
    entity.bezeichnung,
    entity.abbildung,
    translate(entity.kategorie),
    entity
  );

const decoderOption = (entity) =>
  dropOption(
    entity.decoderId,
    [ entity.hersteller, entity.bestellNr, entity.bezeichnung ].filter(x => x).join(" ") + " (" + entity.decoderId + ")",
    entity.bezeichnung,
    undefined,
    entity.hersteller,
    entity
  );

const kategorieOption = (entity) =>
  dropOption(
    entity.kategorie + "/" + entity.name,
    entity.kategorieBezeichnung + " - " + entity.bezeichnung,
    entity.kategorieBezeichnung + " - " + entity.bezeichnung,
    undefined,
    entity.kategorieBezeichnung,
    entity
  );

const produktOption = (entity) =>
  dropOption(
    entity.hersteller + "/" + entity.bestellNr,
    entity.hersteller + " - " + entity.bestellNr,
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorie,
    entity
  );

const vorbildOption = (entity) =>
  dropOption(
    entity.gattung,
    entity.bezeichnung,
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorie,
    entity
  );

const unterKategorieExtractor = (jsonData) =>
  optionExtractor(jsonData).flatMap(k => k.unterKategorien);

const ACHSFOLG_DROP = dropDown(apiUrl("achsfolg"), optionExtractor, bezeichnungOption);
const ADRESS_TYP_DROP = dropDown(apiUrl("enums/adressTyp"), optionExtractor, bezeichnungOption);
const ANDERUNGS_TYP_DROP = dropDown(apiUrl("enums/anderungsTyp"), optionExtractor, bezeichnungOption);
const ANTRIEB_DROP = dropDown(apiUrl("antrieb"), optionExtractor, bezeichnungOption);
const ARTIKEL_DROP = dropDown(apiUrl("artikel"), optionExtractor, artikelOption);
const AUFBAU_DROP = dropDown(apiUrl("aufbau"), optionExtractor, bezeichnungOption);
const BAHNVERWALTUNG_DROP = dropDown(apiUrl("bahnverwaltung"), optionExtractor, bezeichnungOption);
const DECODER_DROP = dropDown(apiUrl("decoder"), optionExtractor, decoderOption);
const DECODER_STATUS_DROP = dropDown(apiUrl("enums/decoderStatus"), optionExtractor, bezeichnungOption);
const DECODER_TYP_DROP = dropDown(apiUrl("decoderTyp"), optionExtractor, produktOption);
const EPOCH_DROP = dropDown(apiUrl("epoch"), optionExtractor, bezeichnungOption);
const GATTUNG_DROP = dropDown(apiUrl("gattung"), optionExtractor, bezeichnungOption);
const HERSTELLER_DROP = dropDown(apiUrl("hersteller"), optionExtractor, bezeichnungOption);
const KONFIGURATION_DROP = dropDown(apiUrl("enums/konfiguration"), optionExtractor, bezeichnungOption);
const KUPPLUNG_DROP = dropDown(apiUrl("kupplung"), optionExtractor, bezeichnungOption);
const LAND_DROP = dropDown(apiUrl("enums/land"), optionExtractor, bezeichnungOption);
const LEISTUNGSUBERTRAGUNG_DROP = dropDown(apiUrl("enums/leistungsubertragung"), optionExtractor, bezeichnungOption);
const LICHT_DROP = dropDown(apiUrl("licht"), optionExtractor, bezeichnungOption);
const MASSSTAB_DROP = dropDown(apiUrl("massstab"), optionExtractor, bezeichnungOption);
const MOTOR_TYP_DROP = dropDown(apiUrl("motorTyp"), optionExtractor, bezeichnungOption);
const PRODUKT_DROP = dropDown(apiUrl("produkt"), optionExtractor, produktOption);
const PROTOKOLL_DROP = dropDown(apiUrl("protokoll"), optionExtractor, bezeichnungOption);
const SONDERMODELL_DROP = dropDown(apiUrl("sondermodell"), optionExtractor, bezeichnungOption);
const SPURWEITE_DROP = dropDown(apiUrl("spurweite"), optionExtractor, bezeichnungOption);
const STATUS_DROP = dropDown(apiUrl("enums/status"), optionExtractor, bezeichnungOption);
const STECKER_DROP = dropDown(apiUrl("enums/stecker"), optionExtractor, bezeichnungOption);
const STEUERUNG_DROP = dropDown(apiUrl("steuerung"), optionExtractor, bezeichnungOption);
const UNTER_KATEGORIE_DROP = dropDown(apiUrl("unterKategorien"), unterKategorieExtractor, kategorieOption);
const VORBILD_DROP = dropDown(apiUrl("vorbild"), optionExtractor, vorbildOption);
const WAHRUNG_DROP = dropDown(apiUrl("enums/wahrung"), optionExtractor, bezeichnungOption);
const ZUG_TYP_DROP = dropDown(apiUrl("zugTyp"), optionExtractor, bezeichnungOption);

const artikelIdGetter = (entity) => entity ? entity.artikelId : undefined;
const artikelIdSetter = (entity, value) => entity.artikelId = value;
const decoderIdGetter = (entity) => entity ? entity.decoderId : undefined;
const decoderIdSetter = (entity, decoderId) => entity.decoderId = decoderId;
const produktGetter = (entity) => entity ? entity.hersteller + "/" + entity.bestellNr : undefined;
const produktSetter = (entity, value) => {
  let parts = value.split("/");
  entity.hersteller = parts[0];
  entity.bestellNr = parts[1];
};
const produktTeilGetter = (entity) => entity ? entity.teilHersteller + "/" + entity.teilBestellNr : undefined;
const produktTeilSetter = (entity, value) => {
  let parts = value.split("/");
  entity.teilHersteller = parts[0];
  entity.teilBestellNr = parts[1];
};
const unterKategorieGetter = (entity) => entity ? entity.kategorie + "/" + entity.unterKategorie : undefined;
const unterKategorieSetter = (entity, value) => {
  let parts = value.split("/");
  entity.kategorie = parts[0];
  entity.unterKategorie = parts[1];
};
const vorbildGetter = (entity) => entity ? entity.gattung : undefined;
const vorbildSetter = (entity, value) => entity.gattung = value;

const fieldGetter = (entity, fieldName) => entity ? entity[fieldName] : undefined;
const fieldSetter = (entity, value, fieldName) => entity[fieldName] = value;
const dateGetter = (entity, fieldName) => entity && entity[fieldName] ? new Date(Date.parse(entity[fieldName])) : undefined;
const dateSetter = (entity, value, fieldName) => entity[fieldName] = value;
const noOpSetter = () => {};

const ACHSFOLG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("ACHSFOLG", "achsfolg", getter, setter, ACHSFOLG_DROP, editable, required);

const ADRESS_TYP_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("ADRESS_TYP", "adressTyp", getter, setter, ADRESS_TYP_DROP, editable, required);

const ARTIKEL_SELECT = (editable, required, getter = artikelIdGetter, setter = artikelIdSetter) =>
  new DropDownColumn("ARTIKEL", "artikel", getter, setter, ARTIKEL_DROP, editable, required);

const BAHNVERWALTUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("BAHNVERWALTUNG", "bahnverwaltung", getter, setter, BAHNVERWALTUNG_DROP, editable, required);

const DECODER_SELECT = (editable = Editable.UPDATE, required = false, getter = decoderIdGetter, setter = decoderIdSetter) =>
  new DropDownColumn("DECODER", "decoderId", getter, setter, DECODER_DROP, editable, required);

const DECODER_STATUS_SELECT = (editable, required, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("DECODER_STATUS", "status", getter, setter, DECODER_STATUS_DROP, editable, required);

const DECODER_TYP_SELECT = (editable = Editable.UPDATE, required = true, getter = produktGetter, setter = produktSetter) =>
  new DropDownColumn("DECODER_TYP", "decoderTyp", getter, setter, DECODER_TYP_DROP, editable, required);

const GATTUNG_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("GATTUNG", "gattung", getter, setter, GATTUNG_DROP, editable, required);

const HERSTELLER_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("HERSTELLER", "hersteller", getter, setter, HERSTELLER_DROP, editable, required);

const KONFIGURATION_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("KONFIGURATION", "konfiguration", getter, setter, KONFIGURATION_DROP, editable, required);

const KUPPLUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new ImageSelectColumn("KUPPLUNG", "kupplung", getter, setter, KUPPLUNG_DROP, editable, required);

const LAND_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("LAND", "land", getter, setter, LAND_DROP, editable, required);

const LICHT_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new ImageSelectColumn("LICHT", "licht", getter, setter, LICHT_DROP, editable, required);

const MASSSTAB_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("MASSSTAB", "massstab", getter, setter, MASSSTAB_DROP, editable, required);

const MOTOR_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new ImageSelectColumn("MOTOR_TYP", "motorTyp", getter, setter, MOTOR_TYP_DROP, editable, required);

const PRODUKT_SELECT = (editable = Editable.UPDATE, required = true, getter = produktGetter, setter = produktSetter) =>
  new AutoSelectColumn("PRODUKT", "produkt", getter, setter, PRODUKT_DROP, editable, required);

const PROTOKOLL_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new ImageSelectColumn("PROTOKOLL", "protokoll", getter, setter, PROTOKOLL_DROP, editable, required);

const SPURWEITE_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("SPURWEITE", "spurweite", getter, setter, SPURWEITE_DROP, editable, required);

const STATUS_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("STATUS", "status", getter, setter, STATUS_DROP, editable, required);

const STECKER_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("STECKER", "stecker", getter, setter, STECKER_DROP, editable, required);

const STEUERUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new ImageSelectColumn("STEUERUNG", "steuerung", getter, setter, STEUERUNG_DROP, editable, required);

const UNTER_KATEGORIE_SELECT = (editable = Editable.UPDATE, required = true, getter = unterKategorieGetter, setter = unterKategorieSetter) =>
  new DropDownColumn("KATEGORIE", "unterKategorie", getter, setter, UNTER_KATEGORIE_DROP, editable, required);

const WAHRUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new AutoSelectColumn("WAHRUNG", "wahrung", getter, setter, WAHRUNG_DROP, editable, required);

const ZUG_TYP_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("ZUG_TYP", "zugTyp", getter, setter, ZUG_TYP_DROP, editable, required);

const ABBILDUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new ImageColumn("ABBILDUNG", "abbildung", getter, editable, required);

const ADRESS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("ADRESS", "adress", getter, setter, editable, required, 65535, 1);

const ANLEITUNGEN = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new PdfColumn("ANLEITUNGEN", "anleitungen", getter, editable, required);

const ANMERKUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ANMERKUNG", "anmerkung", getter, setter, editable, required, 30);

const ARTIKEL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ARTIKEL", "artikelId", getter, setter, editable, required, 5, "^[A-Z0-9]+$");

const AUSSERDIENST = (editable = Editable.UPDATE, required = false, getter = dateGetter, setter = dateSetter) =>
  new DateColumn("AUSSERDIENST", "ausserdienst", getter, setter, editable, required);

const BAUZEIT = (editable = Editable.UPDATE, required = false, getter = dateGetter, setter = dateSetter) =>
  new DateColumn("BAUZEIT", "bauzeit", getter, setter, editable, required);

const BESTELL_NR = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("BESTELL_NR", "bestellNr", getter, setter, editable, required, 10);

const BETREIBSNUMMER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("BETREIBSNUMMER", "betreibsnummer", getter, setter, editable, required, 30);

const BEZEICHNUNG = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("BEZEICHNUNG", "bezeichnung", getter, setter, editable, required, 50);

const CV = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("CV", "cv", getter, setter, editable, required, 127, 1);

const DECODER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("DECODER", "decoderId", getter, setter, editable, required, 5, "^[A-Z0-9]+$");

const END_YEAR = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("END_YEAR", "endYear", getter, setter, editable, required, 2100, 1800, 0, false);

const EXPLOSIONSZEICHNUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new PdfColumn("EXPLOSIONSZEICHNUNG", "explosionszeichnung", getter, editable, required);

const FAHRSTUFE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("FAHRSTUFE", "fahrstufe", getter, setter, editable, required, 127, 1);

const FUNKTION = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("FUNKTION", "funktion", getter, setter, editable, required, 3, "^F([12]d|3[012]|d)$|^K(1[012345]|d)$|^S[0123456]$");

const GERAUSCH = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new BoolColumn("GERAUSCH", "gerausch", getter, setter, editable, required);

const HERSTELLER = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("HERSTELLER", "hersteller", getter, setter, editable, required, 3);

const I_MAX = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("I_MAX", "iMax", getter, setter, editable, required, 5000, 1);

const KAUFDATUM = (editable = Editable.UPDATE, required = false, getter = dateGetter, setter = dateSetter) =>
  new DateColumn("KAUFDATUM", "kaufdatum", getter, setter, editable, required);

const LANGE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("LANGE", "lange", getter, setter, editable, required, 100, 0, 2, true);

const MAXIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("MAXIMAL", "maximal", getter, setter, editable, required, 255, 0);

const MENGE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("MENGE", "menge", getter, setter, editable, required, 100000, 1);

const MINIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("MINIMAL", "minimal", getter, setter, editable, required, 255, 0);

const NAMEN = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("NAMEN", "name", getter, setter, editable, required, 30, "^[A-Z0-9.-]+$");

const POSITION = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("POSITION", "position", getter, setter, editable, required, 30, 0);

const PREIS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("PREIS", "preis", getter, setter, editable, required, 9000, 0, 2);

const PROGRAMMABLE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new BoolColumn("PROGRAMMABLE", "programmable", getter, setter, editable, required);

const SPAN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("SPAN", "span", getter, setter, editable, required, 16, 1);

const START_YEAR = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("START_YEAR", "startYear", getter, setter, editable, required, 2100, 1800, 0, false);

const URL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new UrlColumn("URL", "url", getter, setter, editable, required);

const WERKSEINSTELLUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("WERKSEINSTELLUNG", "werkseinstellung", getter, setter, editable, required, 65535, 1);

const ZUG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ZUG", "zug", getter, setter, editable, required, 30);

const IMPORT_DATA = (entities, complete = (entity) => alert(entity + " " + translate("UPLOAD_COMPLETE"))) => {

  let frm = createDiv(undefined, "popup-form");

  let head = createDiv(frm, "popup-head");
  createTextElement("h3", head, "IMPORT", "popup-head");

  let inp = createDiv(frm, "popup-section");

  let fil = createDiv(inp, "popup-field");

  let entz = createDiv(frm, "popup-section");

  let lbl = createTextElement("label", fil, "FILE", "popup-label");
  lbl.htmlFor = "importFile";
  lbl.addEventListener("click", () => sel.click());
  fil.appendChild(lbl);

  let sel = createInput("file", fil, "popup-control", "importFile");
  sel.accept = "text/csv";
  sel.multiple = false;
  sel.required = true;
  sel.addEventListener(
    "change",
    () => Array.from(entz.getElementsByTagName("button"))
                         .forEach(b => b.disabled = !sel.files[0])
  );

  let enc = createSelect(fil, "popup-contol", "importEncoding", 3);
  enc.add(createOption("WINDOWS-1251", "WINDOWS-1251"));
  enc.add(createOption("ISO-8859-1", "ISO-8859-1"));
  enc.add(createOption("UTF-8", "UTF-8"));
  enc.selectedIndex = 0;

  let errh = createDiv(frm, "popup-head");
  let eh = createDiv(errh, "error-head");
  createTextElement("h3", eh, "IMPORT_ERRORS", "form-head");

  let errb = createDiv(frm, "popup-section");
  let eb = createDiv(errb, "error-body");

  let txt = createTextarea(eb, "error-body");

  entities.forEach(e => {
    let btn = createButton(entz, e, undefined, () => {
          txt.value = "";

          upload(
            apiUrl("data/" + e),
            "data",
            sel.files[0],
            sel.files[0].name,
            (data) => complete(translate(e)),
            (errors) => {
              txt.value = errors;
            },
            "POST",
            enc.value
          );
        },
        "popup-button"
      );
    btn.disabled = true;
    }
  );

  let foot = createDiv(frm, "form-foot");

  createButton(foot, "close", "close", () => modal.style.display = "none");

  showModal(frm, false);
}

const EXPORT_DATA = (entities, complete = (entity) => alert(entity + " " + translate("DOWNLOAD_COMPLETE"))) => {

  let frm = createDiv("popup-form");

  let head = createDiv(frm, "popup-head");
  createTextElement("h3", head, "EXPORT", "popup-head");

  let entz = createDiv(frm, "popup-section");

  entities.forEach(e => createButton(entz, e, () => download(
     apiUrl("data/" + e),
     (data) => {
       let blobData = new Blob([data], {type: "text/csv"});
       let url = window.URL.createObjectURL(blobData);
       let a = createAnchor(document.body, "nav-button", e, url);
       a.style = "display: none";
       a.download = entity + ".csv";
       a.click();
       window.URL.revokeObjectURL(url);
       a.remove();
       complete(translate(e));
     },
     (error) => reportError(apiUrl("data/" + e), error)
   ),
   "popup-button"
    )
  );

  let foot = createDiv(frm, "form-foot");

  createButton(foot, "close", "close", () => modal.style.display = "none");

  showModal(frm, false);
}
