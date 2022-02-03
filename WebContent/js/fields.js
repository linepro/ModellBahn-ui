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
const FAHRZEUG_DROP = dropDown(apiUrl("artikel"), optionExtractor, artikelOption);
const GATTUNG_DROP = dropDown(apiUrl("gattung"), optionExtractor, bezeichnungOption);
const HERSTELLER_DROP = dropDown(apiUrl("hersteller"), optionExtractor, bezeichnungOption);
const KATEGORIE_DROP = dropDown(apiUrl("kategorie"), optionExtractor, bezeichnungOption);
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

const fieldGetter = (fieldName) => (entity) => entity ? entity[fieldName] : undefined;
const fieldSetter = (fieldName) => (entity, value) => entity[fieldName] = value;
const dateGetter = (fieldName) => (entity) => entity && entity[fieldName] ? new Date(Date.parse(entity[fieldName])) : undefined;
const dateSetter = (fieldName) => (entity, value) => entity[fieldName] = value;
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

const ACHSFOLG_SELECT = (editable = Editable.UPDATE, required = false) => new AutoSelectColumn("ACHSFOLG", "achsfolg", fieldGetter("achsfolg"), fieldSetter("achsfolg"), ACHSFOLG_DROP, editable, required);
const ADRESS_TYP_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("ADRESS_TYP", "adressTyp", fieldGetter("adressTyp"), fieldSetter("adressTyp"), ADRESS_TYP_DROP, editable, required);
const ANDERUNGS_TYP_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("ANDERUNGS_TYP", "anderungsTyp", fieldGetter("anderungsTyp"), fieldSetter("anderungsTyp"), ANDERUNGS_TYP_DROP, editable, required);
const ANTRIEB_SELECT = (editable, required) => new DropDownColumn("ANTRIEB", "antrieb", fieldGetter("antrieb"), fieldSetter("antrieb"), ANTRIEB_DROP, editable, required);
const ARTIKEL_SELECT = (editable = Editable.ADD, required = false) => new DropDownColumn("ARTIKEL", "artikel", fieldGetter("artikelId"), fieldSetter("artikelId"), ARTIKEL_DROP, editable, required);
const AUFBAU_SELECT = (editable = Editable.UPDATE, required = true) => new ImageSelectColumn("AUFBAU", "aufbau", fieldGetter("aufbau"), fieldSetter("aufbau"), editable, required);
const BAHNVERWALTUNG_SELECT = (editable = Editable.UPDATE, required = false) => new AutoSelectColumn("BAHNVERWALTUNG", "bahnverwaltung", fieldGetter("bahnverwaltung"), fieldSetter("bahnverwaltung"), BAHNVERWALTUNG_DROP, editable, required);
const DECODER_SELECT = (editable = Editable.ADD, required = false) => new DropDownColumn("DECODER", "decoderId", fieldGetter("decoderId"), fieldSetter("decoderId"), DECODER_DROP, editable, required);
const DECODER_STATUS_SELECT = (editable, required) => new DropDownColumn("DECODER_STATUS", "status", fieldGetter("status"), fieldSetter("status"), DECODER_STATUS_DROP, editable, required);
const DECODER_TYP_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("DECODER_TYP", "decoderTyp", produktGetter, produktSetter, DECODER_TYP_DROP, editable, required);
const FAHRZEUG_SELECT = (editable, required) => new DropDownColumn("ARTIKEL", "artikel", fieldGetter("artikelId"), fieldSetter("artikelId"), FAHRZEUG_DROP, editable, required);
const GATTUNG_SELECT = (editable = Editable.UPDATE, required = true) => new AutoSelectColumn("GATTUNG", "gattung", fieldGetter("gattung"), fieldSetter("gattung"), GATTUNG_DROP, editable, required);
const HERSTELLER_SELECT = (editable = Editable.UPDATE, required = true) => new AutoSelectColumn("HERSTELLER", "hersteller", fieldGetter("hersteller"), fieldSetter("hersteller"), HERSTELLER_DROP, editable, required);
const KONFIGURATION_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("KONFIGURATION", "konfiguration", fieldGetter("konfiguration"), fieldSetter("konfiguration"), KONFIGURATION_DROP, editable, required);
const KUPPLUNG_SELECT = (editable = Editable.UPDATE, required = false) => new ImageSelectColumn("KUPPLUNG", "kupplung", fieldGetter("kupplung"), fieldSetter("kupplung"), KUPPLUNG_DROP, editable, required);
const LAND_SELECT = (editable = Editable.UPDATE, required = false) => new AutoSelectColumn("LAND", "land", fieldGetter("land"), fieldSetter("land"), LAND_DROP, editable, required);
const LEISTUNGSUBERTRAGUNG_SELECT = (editable, required) => new DropDownColumn("LEISTUNGSUBERTRAGUNG", "leistungsubertragung", fieldGetter("leistungsubertragung"), fieldSetter("leistungsubertragung"), LEISTUNGSUBERTRAGUNG_DROP, editable, required);
const LICHT_SELECT = (editable = Editable.UPDATE, required = false) => new ImageSelectColumn("LICHT", "licht", fieldGetter("licht"), fieldSetter("licht"), LICHT_DROP, editable, required);
const MASSSTAB_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("MASSSTAB", "massstab", fieldGetter("massstab"), fieldSetter("massstab"), MASSSTAB_DROP, editable, required);
const MOTOR_TYP_SELECT = (editable = Editable.UPDATE, required = false) => new ImageSelectColumn("MOTOR_TYP", "motorTyp", fieldGetter("motorTyp"), fieldSetter("motorTyp"), MOTOR_TYP_DROP, editable, required);
const PRODUKT_SELECT = (editable = Editable.UPDATE, required = true) => new AutoSelectColumn("PRODUKT", "produkt", produktGetter, produktSetter, PRODUKT_DROP, editable, required);
const PROTOKOLL_SELECT = (editable = Editable.UPDATE, required = false) => new ImageSelectColumn("PROTOKOLL", "protokoll", fieldGetter("protokoll"), fieldSetter("protokoll"), PROTOKOLL_DROP, editable, required);
const SONDERMODELL_SELECT  = (editable = Editable.UPDATE, required = true) =>  new DropDownColumn("SONDERMODELL", "sondermodell", fieldGetter("sondermodell"), fieldSetter("sondermodell"), SONDERMODELL_DROP, editable, required);
const SPURWEITE_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("SPURWEITE", "spurweite", fieldGetter("spurweite"), fieldSetter("spurweite"), SPURWEITE_DROP, editable, required);
const STATUS_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("STATUS", "status", fieldGetter("status"), fieldSetter("status"), STATUS_DROP, editable, required);
const STECKER_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("STECKER", "stecker", fieldGetter("stecker"), fieldSetter("stecker"), STECKER_DROP, editable, required);
const STEUERUNG_SELECT = (editable = Editable.UPDATE, required = false) => new ImageSelectColumn("STEUERUNG", "steuerung", fieldGetter("steuerung"), fieldSetter("steuerung"), STEUERUNG_DROP, editable, required);
const TEIL_SELECT = (editable = Editable.ADD, required = true) => new DropDownColumn("TEIL", "teil", fieldGetter("teil"), fieldSetter("teil"), PRODUKT_DROP, editable, required);
const UNTER_KATEGORIE_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("KATEGORIE", "unterKategorie", unterKategorieGetter, unterKategorieSetter, UNTER_KATEGORIE_DROP, editable, required);
const VORBILD_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("VORBILD", "vorbild", fieldGetter("vorbild"), fieldSetter("vorbild"), VORBILD_DROP, editable, required);
const WAHRUNG_SELECT = (editable = Editable.UPDATE, required = false) => new AutoSelectColumn("WAHRUNG", "wahrung", fieldGetter("wahrung"), fieldSetter("wahrung"), WAHRUNG_DROP, editable, required);
const ZUG_TYP_SELECT = (editable = Editable.UPDATE, required = true) => new DropDownColumn("ZUG_TYP", "zugTyp", fieldGetter("zugTyp"), fieldSetter("zugTyp"), ZUG_TYP_DROP, editable, required);
const EPOCH_SELECT = (editable = Editable.UPDATE, required = true) => new ImageSelectColumn("EPOCH", "epoch", fieldGetter("epoch"), fieldSetter("epoch"), EPOCH_DROP, editable, required);

const ABBILDUNG = (editable = Editable.UPDATE, required = false) => new ImageColumn("ABBILDUNG", "abbildung", fieldGetter("abbildung"), editable, required);
const ADRESS = (editable = Editable.UPDATE, required = false) => new NumberColumn("ADRESS", "adress", fieldGetter("adress"), fieldSetter("adress"), editable, required, 65535, 1);
const ANDERUNGS_DATUM = (editable = Editable.UPDATE, required = true) => new DateColumn("DATUM", "anderungsDatum", dateGetter("anderungsDatum"), dateSetter("anderungsDatum"), editable, required);
const ANDERUNG_ID = (editable = Editable.UPDATE, required = false) => new NumberColumn("ANDERUNG", "anderungId", fieldGetter("anderungId"), fieldSetter("anderungId"), editable, required);
const ANFAHRZUGKRAFT = (editable, required) => new NumberColumn("ANFAHRZUGKRAFT", "anfahrzugkraft", fieldGetter("anfahrzugkraft"), fieldSetter("anfahrzugkraft"), editable, required, 300000, 0);
const ANLEITUNGEN = (editable = Editable.UPDATE, required = false) => new PdfColumn("ANLEITUNGEN", "anleitungen", fieldGetter("anleitungen"), editable, required);
const ANMERKUNG = (editable = Editable.UPDATE, required = false) => new TextColumn("ANMERKUNG", "anmerkung", fieldGetter("anmerkung"), fieldSetter("anmerkung"), editable, required, 30);
const ARTIKEL = (editable = Editable.UPDATE, required = false) => new TextColumn("ARTIKEL", "artikelId", fieldGetter("artikelId"), fieldSetter("artikelId"), editable, required, 5, "^[A-Z0-9]+$");
const AUFBAU = (editable, required) => new TextColumn("AUFBAU", "aufbau", fieldGetter("aufbau"), fieldSetter("aufbau"), editable, required, 50);
const AUSSERDIENST = (editable = Editable.UPDATE, required = false) => new DateColumn("AUSSERDIENST", "ausserdienst", dateSetter("ausserdienst"), dateSetter("ausserdienst"), editable, required);
const BAUZEIT = (editable = Editable.UPDATE, required = false) => new DateColumn("BAUZEIT", "bauzeit", dateGetter("bauzeit"), dateSetter("bauzeit"), editable, required);
const BELADUNG = (editable = Editable.UPDATE, required = true) => new TextColumn("BELADUNG", "beladung", fieldGetter("beladung"), fieldSetter("beladung"), editable, required, 30);
const BESTELL_NR = (editable = Editable.ADD, required = true) => new TextColumn("BESTELL_NR", "bestellNr", fieldGetter("bestellNr"), fieldSetter("bestellNr"), editable, required, 10);
const BETREIBSNUMMER = (editable = Editable.UPDATE, required = false) => new TextColumn("BETREIBSNUMMER", "betreibsnummer", fieldGetter("betreibsnummer"), fieldSetter("betreibsnummer"), editable, required, 30);
const BEZEICHNUNG = (editable = Editable.UPDATE, required = true) => new TextColumn("BEZEICHNUNG", "bezeichnung", fieldGetter("bezeichnung"), fieldSetter("bezeichnung"), editable, required, 50);
const CV = (editable = Editable.ADD, required = true) => new NumberColumn("CV", "cv", fieldGetter("cv"), fieldSetter("cv"), editable, required, 127, 1);
const DECODER = (editable = Editable.UPDATE, required = false) => new TextColumn("DECODER", "decoderId", fieldGetter("decoderId"), fieldSetter("decoderId"), editable, required, 5, "^[A-Z0-9]+$");
const DIENSTGEWICHT = (editable, required) => new NumberColumn("DIENSTGEWICHT", "dienstgewicht", fieldGetter("dienstgewicht"), fieldSetter("dienstgewicht"), editable, required, 1000, 0);
const DM_LAUFRAD_HINTEN = (editable, required) => new NumberColumn("DM_LAUFRAD_HINTEN", "dmLaufradHinten", fieldGetter("dmLaufradHinten"), fieldSetter("dmLaufradHinten"), editable, required, 4000, 0);
const DM_LAUFRAD_VORN = (editable, required) => new NumberColumn("DM_LAUFRAD_VORN", "dmLaufradVorn", fieldGetter("dmLaufradVorn"), fieldSetter("dmLaufradVorn"), editable, required, 4000, 0);
const DM_TREIBRAD = (editable, required) => new NumberColumn("DM_TREIBRAD", "dmTreibrad", fieldGetter("dmTreibrad"), fieldSetter("dmTreibrad"), editable, required, 4000, 0);
const DM_ZYLINDER = (editable, required) => new NumberColumn("DM_ZYLINDER", "dmZylinder", fieldGetter("dmZylinder"), fieldSetter("dmZylinder"), editable, required, 3000, 0);
const DREHGESTELLBAUART = (editable, required) => new TextColumn("DREHGESTELLBAUART", "drehgestellBauart", fieldGetter("drehgestellBauart"), fieldSetter("drehgestellBauart"), editable, required, 30);
const END_YEAR = (editable = Editable.UPDATE, required = false) => new NumberColumn("END_YEAR", "endYear", fieldGetter("endYear"), fieldSetter("endYear"), editable, required, 2100, 1800, 0, false);
const EXPLOSIONSZEICHNUNG = (editable = Editable.UPDATE, required = false) => new PdfColumn("EXPLOSIONSZEICHNUNG", "explosionszeichnung", fieldGetter("explosionszeichnung"), editable, required);
const FAHRMOTOREN = (editable, required) => new NumberColumn("FAHRMOTOREN", "fahrmotoren", fieldGetter("fahrmotoren"), fieldSetter("fahrmotoren"), editable, required, 5, 0);
const FAHRSTUFE = (editable = Editable.UPDATE, required = false) => new NumberColumn("FAHRSTUFE", "fahrstufe", fieldGetter("fahrstufe"), fieldSetter("fahrstufe"), editable, required, 127, 1);
const FUNKTION = (editable = Editable.ADD, required = true) => new TextColumn("FUNKTION", "funktion", fieldGetter("funktion"), fieldSetter("funktion"), editable, required, 3, "^F([12]d|3[012]|d)$|^K(1[012345]|d)$|^S[0123456]$");
const GERAUSCH = (editable = Editable.UPDATE, required = false) => new BoolColumn("GERAUSCH", "gerausch", fieldGetter("gerausch"), fieldSetter("gerausch"), editable, required);
const GESCHWINDIGKEIT = (editable, required) => new NumberColumn("GESCHWINDIGKEIT", "geschwindigkeit", fieldGetter("geschwindigkeit"), fieldSetter("geschwindigkeit"), editable, required, 300, 0);
const HERSTELLER = (editable = Editable.ADD, required = true) => new TextColumn("HERSTELLER", "hersteller", fieldGetter("hersteller"), fieldSetter("hersteller"), editable, required, 3);
const I_MAX = (editable = Editable.UPDATE, required = false) => new NumberColumn("I_MAX", "iMax", fieldGetter("iMax"), fieldSetter("iMax"), editable, required, 5000, 1);
const KAPAZITAT = (editable, required) => new NumberColumn("KAPAZITAT", "kapazitat", fieldGetter("kapazitat"), fieldSetter("kapazitat"), editable, required, 3000, 0, 2);
const KAUFDATUM = (editable = Editable.UPDATE, required = false) => new DateColumn("KAUFDATUM", "kaufdatum", dateGetter("kaufdatum"), dateGetter("kaufdatum"), editable, required);
const KESSELUBERDRUCK = (editable, required) => new NumberColumn("KESSELUBERDRUCK", "kesseluberdruck", fieldGetter("kesseluberdruck"), fieldSetter("kesseluberdruck"), editable, required, 100, 0, 2);
const KLASSE = (editable, required) => new NumberColumn("KLASSE", "klasse", fieldGetter("klasse"), fieldSetter("klasse"), editable, required, 4, 0);
const KOLBENHUB = (editable, required) => new NumberColumn("KOLBENHUB", "kolbenhub", fieldGetter("kolbenhub"), fieldSetter("kolbenhub"), editable, required, 3000, 0);
const LANGE = (editable = Editable.UPDATE, required = false) => new NumberColumn("LANGE", "lange", fieldGetter("lange"), fieldSetter("lange"), editable, required, 100, 0, 2, true);
const LEISTUNG = (editable, required) => new NumberColumn("LEISTUNG", "leistung", fieldGetter("leistung"), fieldSetter("leistung"), editable, required, 100000, 0);
const MAXIMAL = (editable = Editable.UPDATE, required = false) => new NumberColumn("MAXIMAL", "maximal", fieldGetter("maximal"), fieldSetter("maximal"), editable, required, 255, 0);
const MENGE = (editable = Editable.UPDATE, required = false) => new NumberColumn("MENGE", "menge", fieldGetter("menge"), fieldSetter("menge"), editable, required, 100000, 1);
const MINIMAL = (editable = Editable.UPDATE, required = false) => new NumberColumn("MINIMAL", "minimal", fieldGetter("minimal"), fieldSetter("minimal"), editable, required, 255, 0);
const MITTELWAGEN = (editable, required) => new NumberColumn("MITTELWAGEN", "mittelwagen", fieldGetter("mittelwagen"), fieldSetter("mittelwagen"), editable, required, 30, 0);
const MOTORBAUART = (editable, required) => new TextColumn("MOTORBAUART", "motorbauart", fieldGetter("motorbauart"), fieldSetter("motorbauart"), editable, required, 30);
const NAMEN = (editable = Editable.ADD, required = true) => new TextColumn("NAMEN", "name", fieldGetter("name"), fieldSetter("name"), editable, required, 30, "^[A-Z0-9.-]+$");
const POSITION = (editable = Editable.UPDATE, required = false) => new NumberColumn("POSITION", "position", fieldGetter("position"), fieldSetter("position"), editable, required, 30, 0);
const PREIS = (editable = Editable.UPDATE, required = false) => new NumberColumn("PREIS", "preis", fieldGetter("preis"), fieldSetter("preis"), editable, required, 9000, 0, 2);
const PROGRAMMABLE = (editable = Editable.UPDATE, required = false) => new BoolColumn("PROGRAMMABLE", "programmable", fieldGetter("programmable"), fieldSetter("programmable"), editable, required);
const REICHWEITE = (editable, required) => new NumberColumn("REICHWEITE", "reichweite", fieldGetter("reichweite"), fieldSetter("reichweite"), editable, required, 3000, 0);
const ROSTFLACHE = (editable, required) => new NumberColumn("ROSTFLACHE", "rostflache", fieldGetter("rostflache"), fieldSetter("rostflache"), editable, required, 3000, 0, 2);
const SITZPLATZE_KL1 = (editable, required) => new NumberColumn("SITZPLATZE_KL1", "sitzplatzeKL1", fieldGetter("sitzplatzeKL1"), fieldSetter("sitzplatzeKL1"), editable, required, 300, 0);
const SITZPLATZE_KL2 = (editable, required) => new NumberColumn("SITZPLATZE_KL2", "sitzplatzeKL2", fieldGetter("sitzplatzeKL2"), fieldSetter("sitzplatzeKL2"), editable, required, 300, 0);
const SITZPLATZE_KL3 = (editable, required) => new NumberColumn("SITZPLATZE_KL3", "sitzplatzeKL3", fieldGetter("sitzplatzeKL3"), fieldSetter("sitzplatzeKL3"), editable, required, 300, 0);
const SITZPLATZE_KL4 = (editable, required) => new NumberColumn("SITZPLATZE_KL4", "sitzplatzeKL4", fieldGetter("sitzplatzeKL4"), fieldSetter("sitzplatzeKL4"), editable, required, 300, 0);
const SPAN = (editable = Editable.UPDATE, required = false) => new NumberColumn("SPAN", "span", fieldGetter("span"), fieldSetter("span"), editable, required, 16, 1);
const START_YEAR = (editable = Editable.UPDATE, required = false) => new NumberColumn("START_YEAR", "startYear", fieldGetter("startYear"), fieldSetter("startYear"), editable, required, 2100, 1800, 0, false);
const TELEFON = (editable = Editable.UPDATE, required = false) => new PhoneColumn("TELEFON", "telefon", fieldGetter("telefon"), fieldSetter("telefon"), editable, required);
const THUMBNAIL = () => new ThumbColumn("abbildung", "abbildung", fieldGetter("abbildung"));
const TRIEBKOPFE = (editable, required) => new NumberColumn("TRIEBKOPFE", "triebkopf", fieldGetter("triebkopf"), fieldSetter("triebkopf"), editable, required, 2, 0);
const UBERHITZERFLACHE = (editable, required) => new NumberColumn("UBERHITZERFLACHE", "uberhitzerflache", fieldGetter("uberhitzerflache"), fieldSetter("uberhitzerflache"), editable, required, 3000, 0, 2);
const URL = (editable = Editable.UPDATE, required = false) => new UrlColumn("URL", "url", fieldGetter("url"), fieldSetter("url"), editable, required);
const VERBLEIBENDE = (editable = Editable.UPDATE, required = true) => new NumberColumn("VERBLEIBENDE", "verbleibende", fieldGetter("verbleibende"), fieldSetter("verbleibende"), editable, required);
const VERDAMPFUNG = (editable, required) => new NumberColumn("VERDAMPFUNG", "verdampfung", fieldGetter("verdampfung"), fieldSetter("verdampfung"), editable, required, 3000, 0, 2);
const WASSERVORRAT = (editable, required) => new NumberColumn("WASSERVORRAT", "wasservorrat", fieldGetter("wasservorrat"), fieldSetter("wasservorrat"), editable, required, 3000, 0, 2);
const WERKSEINSTELLUNG = (editable = Editable.UPDATE, required = false) => new NumberColumn("WERKSEINSTELLUNG", "werkseinstellung", fieldGetter("werkseinstellung"), fieldSetter("werkseinstellung"), editable, required, 65535, 1);
const WERT = (editable = Editable.UPDATE, required = false) => new NumberColumn("WERT", "wert", fieldGetter("wert"), fieldSetter("wert"), editable, required, 65535, 1);
const ZUG = (editable = Editable.UPDATE, required = false) => new TextColumn("ZUG", "zug", fieldGetter("zug"), fieldSetter("zug"), editable, required, 30);
const ZYLINDER = (editable, required) => new NumberColumn("ZYLINDER", "zylinder", fieldGetter("zylinder"), fieldSetter("zylinder"), editable, required, 36, 0);

const IMPORT_DATA = (entities, complete = (entity) => alert(entity + " " + translate("UPLOAD_COMPLETE"))) => {

  let frm = createDiv(undefined, "popup-form");

  let head = createDiv(frm, "popup-head");
  createTextElement("h3", head, "IMPORT", "popup-head");

  let inp = createDiv(frm, "popup-section");

  let fil = createDiv(inp, "popup-field");

  let entz = createDiv(frm, "popup-section");
  entz.style.flexDirection = "row";

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
  enc.style.order = 3;

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
            () => complete(translate(e)),
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
