// module "fields.js";
"use strict";

const optionExtractor = (jsonData) => jsonData._embedded.data;

const bezeichnungOption = (entity) =>
  dropOption(
    entity.name, 
    entity.bezeichnung, 
    entity.tooltip, 
    entity.abbildung
  );

const artikelOption = (entity) => 
  dropOption(
    entity.artikelId,
    [ entity.hersteller, entity.bestellNr, entity.gattung, entity.betreibsnummer, entity.bahnverwaltung ].filter(x => x).join(" ") + " (" + entity.artikelId + ")",
    entity.bezeichnung,
    entity.abbildung,
    translate(entity.kategorie)
  );

const decoderOption = (entity) => 
  dropOption(
    entity.decoderId,
    [ entity.hersteller, entity.bestellNr, entity.bezeichnung ].filter(x => x).join(" ") + " (" + entity.decoderId + ")"
  );

const kategorieOption = (entity) =>
  dropOption(
    entity.kategorie + "/" + entity.name,
    entity.bezeichnung,
    entity.bezeichnung,
    undefined,
    entity.kategorie
  );

const produktOption = (entity) =>
  dropOption(
    entity.hersteller + "/" + entity.bestellNr, 
    entity.hersteller + " - " + entity.bestellNr,
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorie
  );

const vorbildOption = (entity) =>
  dropOption(
    entity.gattung, 
    entity.bezeichnung,
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorie
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
const DECODER_STATUS_DROP = dropDown(apiUrl("enums/decoderStatus"), optionExtractor, decoderOption);
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

const artikelIdGetter = (entity) => entity.artikelId;
const artikelIdSetter = (entity, value) => entity.artikelId = value;
const decoderIdGetter = (entity) => entity.decoderId;
const decoderIdSetter = (entity, decoderId) => entity.decoderId = decoderId;
const produktGetter = (entity) => entity.hersteller + "/" + entity.bestellNr;
const produktSetter = (entity, value) => {
  let parts = value.split("/");
  entity.hersteller = parts[0];
  entity.bestellNr = parts[1];
};
const produktTeilGetter = (entity) => entity.teilHersteller + "/" + entity.teilBestellNr;
const produktTeilSetter = (entity, value) => {
  let parts = value.split("/");
  entity.teilHersteller = parts[0];
  entity.teilBestellNrbestellNr = parts[1];
};
const unterKategorieGetter = (entity) => entity.kategorie + "/" + entity.unterKategorie;
const unterKategorieSetter = (entity, value) => {
  let parts = value.split("/");
  entity.kategorie = parts[0];
  entity.unterKategorie = parts[1];
};
const vorbildGetter = (entity) => entity.gattung;
const vorbildSetter = (entity, value) => entity.gattung = value;

const fieldGetter = (entity, fieldName) => entity[fieldName];
const fieldSetter = (entity, value, fieldName) => entity[fieldName] = value;
const noOpSetter = () => {};

const ACHSFOLG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => 
  new DropDownColumn("ACHSFOLG", "achsfolg", getter, setter, ACHSFOLG_DROP, editable, required, 30, 5);

const ADRESS_TYP_SELECT = (
  editable = Editable.UPDATE,
  required = false,
  getter = fieldGetter,
  setter = fieldSetter
) => 
  new DropDownColumn("ADRESS_TYP", "adressTyp", getter, setter, ADRESS_TYP_DROP, editable, required, 5);

const BAHNVERWALTUNG_SELECT = (
  editable = Editable.UPDATE,
  required = false,
  getter = fieldGetter,
  setter = fieldSetter
) => 
  new DropDownColumn(
    "BAHNVERWALTUNG",
    "bahnverwaltung",
    getter,
    setter,
    BAHNVERWALTUNG_DROP,
    editable,
    required,
    30,
    5
  );

const DECODER_SELECT = (editable, required, getter = decoderIdGetter, setter = decoderIdSetter) => 
  new DropDownColumn("DECODER", "decoder", getter, setter, DECODER_DROP, editable, required, 30, 5);

const DECODER_TYP_SELECT = (editable, required, getter = produktGetter, setter = produktSetter) =>
  new DropDownColumn("DECODER_TYP", "decoderTyp", getter, setter, DECODER_TYP_DROP, editable, required, 50, 5);

const GATTUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("GATTUNG", "gattung", getter, setter, GATTUNG_DROP, editable, required, 30, 5);

const HERSTELLER_SELECT = (
  editable = Editable.UPDATE,
  required = false,
  getter = fieldGetter,
  setter = fieldSetter
) =>
  new DropDownColumn("HERSTELLER", "hersteller", getter, setter, HERSTELLER_DROP, editable, required);

const KONFIGURATION_SELECT = (editable, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("KONFIGURATION", "konfiguration", getter, setter, KONFIGURATION_DROP, editable, required);

const KUPPLUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("KUPPLUNG", "kupplung", getter, setter, KUPPLUNG_DROP, editable, required, 30, 5);

const LAND_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("LAND", "land", getter, setter, LAND_DROP, editable, required, 5);

const LICHT_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("LICHT", "licht", getter, setter, LICHT_DROP, editable, required, 30, 5);

const MASSSTAB_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("MASSSTAB", "massstab", getter, setter, MASSSTAB_DROP, editable, required, 30, 5);

const MOTOR_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("MOTOR_TYP", "motorTyp", getter, setter, MOTOR_TYP_DROP, editable, required, 30, 5);

const PRODUKT_SELECT = (editable, required, getter = produktGetter, setter = produktSetter) =>
  new DropDownColumn("PRODUKT", "produkt", getter, setter, PRODUKT_DROP, editable, required, 50, 5);

const PROTOKOLL_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("PROTOKOLL", "protokoll", getter, setter, PROTOKOLL_DROP, editable, required);

const SPURWEITE_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("SPURWEITE", "spurweite", getter, setter, SPURWEITE_DROP, editable, required, 30, 5);

const STATUS_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("STATUS", "status", getter, setter, STATUS_DROP, editable, required, 30, 5);

const STECKER_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("STECKER", "stecker", getter, setter, STECKER_DROP, editable, required, 30, 5);

const STEUERUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("STEUERUNG", "steuerung", getter, setter, STEUERUNG_DROP, editable, required, 30, 5);

const UNTER_KATEGORIE_SELECT = (
  editable = Editable.UPDATE,
  required = false,
  getter = unterKategorieGetter,
  setter = unterKategorieSetter
) =>
  new DropDownColumn("KATEGORIE", "unterKategorie", getter, setter, UNTER_KATEGORIE_DROP, editable, required);

const WAHRUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("WAHRUNG", "wahrung", getter, setter, WAHRUNG_DROP, editable, required, 30, 5);

const ZUG_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DropDownColumn("ZUG_TYP", "zugTyp", getter, setter, ZUG_TYP_DROP, editable, required, 30, 5);

const ABBILDUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new ImageColumn("ABBILDUNG", "abbildung", getter, editable, required);

const ADRESS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("ADRESS", "adress", getter, setter, editable, required, 65535, 1);

const ANLEITUNGEN = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new PdfColumn("ANLEITUNGEN", "anleitungen", getter, editable, required);

const ANZAHL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("ANZAHL", "anzahl", getter, setter, editable, required, 300000, 1);

const ANMERKUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ANMERKUNG", "anmerkung", getter, setter, editable, required, 30);

const ARTIKEL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ARTIKEL", "artikelId", getter, setter, editable, required, 5, "^[A-Z0-9]+$");

const AUFBAU = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("AUFBAU", "aufbau", getter, setter, editable, required, 5);

const AUSSERDIENST = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DateColumn("AUSSERDIENST", "ausserdienst", getter, setter, editable, required);

const BAUZEIT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
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

const EXPLOSIONSZEICHNUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) =>
  new PdfColumn("EXPLOSIONSZEICHNUNG", "explosionszeichnung", getter, editable, required);

const FAHRSTUFE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("FAHRSTUFE", "fahrstufe", getter, setter, editable, required, 127, 1);

const FUNKTION = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn(
    "FUNKTION",
    "funktion",
    getter,
    setter,
    editable,
    required,
    3,
    "^F([12]d|3[012]|d)$|^K(1[012345]|d)$|^S[0123456]$"
  );

const GERAUSCH = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new BoolColumn("GERAUSCH", "gerausch", getter, setter, editable, required);

const HERSTELLER = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("HERSTELLER", "hersteller", getter, setter, editable, required, 3);

const INDEX = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("INDEX", "index", getter, setter, editable, required, 3, 0);

const I_MAX = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("I_MAX", "iMax", getter, setter, editable, required, 1000, 1);

const KAUFDATUM = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new DateColumn("KAUFDATUM", "kaufdatum", getter, setter, editable, required);

const LANGE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("LANGE", "lange", getter, setter, editable, required, 50, 1, 2);

const MAXIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("MAXIMAL", "maximal", getter, setter, editable, required, 30);

const MINIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("MINIMAL", "minimal", getter, setter, editable, required, 30);

const NAMEN = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("NAMEN", "name", getter, setter, editable, required, 30, "^[A-Z0-9.-]+$");

const POSITION = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("POSITION", "position", getter, setter, editable, required, 30, 0);

const PREIS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("PREIS", "preis", getter, setter, editable, required, noOpSetter, 0, 2);

const PROGRAMMABLE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new BoolColumn("PROGRAMMABLE", "programmable", getter, setter, editable, required);

const REIHE = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("REIHE", "reihe", getter, setter, editable, required, 1, 0);

const SPAN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("SPAN", "span", getter, setter, editable, required, 16, 1);

const STUCK = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("STUCK", "stuck", getter, setter, editable, required, 300, 0);

const URL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new UrlColumn("URL", "url", getter, setter, editable, required);

const WERKSEINSTELLUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new NumberColumn("WERKSEINSTELLUNG", "werkseinstellung", getter, setter, editable, required, 65535, 1);

const ZUG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>
  new TextColumn("ZUG", "zug", getter, setter, editable, required, 30);

