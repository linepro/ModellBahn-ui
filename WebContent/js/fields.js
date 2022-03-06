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
    [ entity.herstellerBezeichnung, entity.bestellNr, entity.gattungBezeichnung, entity.betreibsnummer, entity.bahnverwaltungBezeichnung ].filter(x => x).join(" ") + " (" + entity.artikelId + ")",
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorieBezeichnung,
    entity
  );

const decoderOption = (entity) =>
  dropOption(
    entity.decoderId,
    [ entity.herstellerBezeichnung, entity.bestellNr, entity.bezeichnung ].filter(x => x).join(" ") + " (" + entity.decoderId + ")",
    entity.bezeichnung,
    undefined,
    entity.herstellerBezeichnung,
    entity
  );

const produktKey = (entity) => entity ? entity.hersteller + "/" + entity.bestellNr : undefined;
const produktBezeichnung = (entity) => entity ? entity.herstellerBezeichnung + " - " + entity.bestellNr : undefined;

const produktOption = (entity) =>
  dropOption(
    produktKey(entity),
    produktBezeichnung(entity),
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorieBezeichnung,
    entity
  );

const unterKategorieKey = (entity) => entity ? entity.kategorie + "/" + entity.name : undefined;
const unterKategorieBezeichnung = (entity) => entity ? entity.kategorieBezeichnung + " - " + entity.bezeichnung : undefined;

const unterKategorieOption = (entity) =>
  dropOption(
    unterKategorieKey(entity),
    unterKategorieBezeichnung(entity.bezeichnung),
    unterKategorieBezeichnung(entity.bezeichnung),
    undefined,
    entity.kategorieBezeichnung,
    entity
  );

const vorbildOption = (entity) =>
  dropOption(
    entity.gattung,
    entity.bezeichnung,
    entity.bezeichnung,
    entity.abbildung,
    entity.kategorieBezeichnung,
    entity
  );

const unterKategorieExtractor = (jsonData) => optionExtractor(jsonData).flatMap(k => k.unterKategorien);

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
const UNTER_KATEGORIE_DROP = dropDown(apiUrl("unterKategorien"), unterKategorieExtractor, unterKategorieOption);
const VORBILD_DROP = dropDown(apiUrl("vorbild"), optionExtractor, vorbildOption);
const WAHRUNG_DROP = dropDown(apiUrl("enums/wahrung"), optionExtractor, bezeichnungOption);
const ZUG_TYP_DROP = dropDown(apiUrl("zugTyp"), optionExtractor, bezeichnungOption);

const noOpSetter = () => {}
const fieldGetter = (fieldName) => (entity) => entity ? entity[fieldName] : undefined;
const fieldSetter = (fieldName) => (entity, value) => entity[fieldName] = value;
const dateGetter = (fieldName) => (entity) => entity && entity[fieldName] ? new Date(Date.parse(entity[fieldName])) : undefined;
const dateSetter = (fieldName) => (entity, value) => entity[fieldName] = value;
const produktSetter = (entity, value) => {
  let parts = value.split("/");
  entity.hersteller = parts[0];
  entity.bestellNr = parts[1];
};
const produktTeilBezeichnungGetter = (entity) => entity ? entity.teilHerstellerBezeichnung + " - " + entity.teilBestellNr : undefined;
const produktTeilGetter = (entity) => entity ? entity.teilHersteller + "/" + entity.teilBestellNr : undefined;
const produktTeilSetter = (entity, value) => {
  let parts = value.split("/");
  entity.teilHersteller = parts[0];
  entity.teilBestellNr = parts[1];
};
const unterKategorieBezeichnungGetter = (entity) => entity ? entity.kategorieBezeichnung + " - " + entity.unterKategorieBezeichnung : undefined;
const unterKategorieGetter = (entity) => entity ? entity.kategorie + "/" + entity.unterKategorie : undefined;
const unterKategorieSetter = (entity, value) => {
  let parts = value.split("/");
  entity.kategorie = parts[0];
  entity.unterKategorie = parts[1];
};

const ACHSFOLG_SELECT = (editable, required) => new AutoSelectColumn("ACHSFOLG", "achsfolg", fieldGetter("achsfolg"), fieldSetter("achsfolg"), ACHSFOLG_DROP, editable, required);
const ADRESS_TYP_SELECT = (editable, required) => new DropDownColumn("ADRESS_TYP", "adressTyp", fieldGetter("adressTyp"), fieldSetter("adressTyp"), ADRESS_TYP_DROP, editable, required);
const ANDERUNGS_TYP_SELECT = (editable, required) => new DropDownColumn("ANDERUNGS_TYP", "anderungsTyp", fieldGetter("anderungsTyp"), fieldSetter("anderungsTyp"), ANDERUNGS_TYP_DROP, editable, required);
const ANTRIEB_SELECT = (editable, required) => new DropDownColumn("ANTRIEB", "antrieb", fieldGetter("antrieb"), fieldSetter("antrieb"), ANTRIEB_DROP, editable, required);
const ARTIKEL_SELECT = (editable = Editable.ADD, required = false) => new DropDownColumn("ARTIKEL", "artikel", fieldGetter("artikelId"), fieldSetter("artikelId"), ARTIKEL_DROP, editable, required);
const AUFBAU_SELECT = (editable, required) => new ImageSelectColumn("AUFBAU", "aufbau", fieldGetter("aufbau"), fieldSetter("aufbau"), AUFBAU_DROP, editable, required);
const BAHNVERWALTUNG_SELECT = (editable, required) => new AutoSelectColumn("BAHNVERWALTUNG", "bahnverwaltung", fieldGetter("bahnverwaltung"), fieldSetter("bahnverwaltung"), BAHNVERWALTUNG_DROP, editable, required);
const DECODER_SELECT = (editable = Editable.ADD, required = false) => new DropDownColumn("DECODER", "decoderId", fieldGetter("decoderId"), fieldSetter("decoderId"), DECODER_DROP, editable, required);
const DECODER_STATUS_SELECT = (editable, required) => new DropDownColumn("DECODER_STATUS", "status", fieldGetter("status"), fieldSetter("status"), DECODER_STATUS_DROP, editable, required);
const DECODER_TYP_SELECT = (editable, required) => new DropDownColumn("DECODER_TYP", "decoderTyp", produktKey, produktSetter, DECODER_TYP_DROP, editable, required);
const FAHRZEUG_SELECT = (editable, required) => new DropDownColumn("ARTIKEL", "artikel", fieldGetter("artikelId"), fieldSetter("artikelId"), FAHRZEUG_DROP, editable, required);
const GATTUNG_SELECT = (editable, required) => new AutoSelectColumn("GATTUNG", "gattung", fieldGetter("gattung"), fieldSetter("gattung"), GATTUNG_DROP, editable, required);
const HERSTELLER_SELECT = (editable, required) => new AutoSelectColumn("HERSTELLER", "hersteller", fieldGetter("hersteller"), fieldSetter("hersteller"), HERSTELLER_DROP, editable, required);
const KONFIGURATION_SELECT = (editable, required) => new DropDownColumn("KONFIGURATION", "konfiguration", fieldGetter("konfiguration"), fieldSetter("konfiguration"), KONFIGURATION_DROP, editable, required);
const KUPPLUNG_SELECT = (editable, required) => new ImageSelectColumn("KUPPLUNG", "kupplung", fieldGetter("kupplung"), fieldSetter("kupplung"), KUPPLUNG_DROP, editable, required);
const LAND_SELECT = (editable, required) => new AutoSelectColumn("LAND", "land", fieldGetter("land"), fieldSetter("land"), LAND_DROP, editable, required);
const LEISTUNGSUBERTRAGUNG_SELECT = (editable, required) => new DropDownColumn("LEISTUNGSUBERTRAGUNG", "leistungsubertragung", fieldGetter("leistungsubertragung"), fieldSetter("leistungsubertragung"), LEISTUNGSUBERTRAGUNG_DROP, editable, required);
const LICHT_SELECT = (editable, required) => new ImageSelectColumn("LICHT", "licht", fieldGetter("licht"), fieldSetter("licht"), LICHT_DROP, editable, required);
const MASSSTAB_SELECT = (editable, required) => new DropDownColumn("MASSSTAB", "massstab", fieldGetter("massstab"), fieldSetter("massstab"), MASSSTAB_DROP, editable, required);
const MOTOR_TYP_SELECT = (editable, required) => new ImageSelectColumn("MOTOR_TYP", "motorTyp", fieldGetter("motorTyp"), fieldSetter("motorTyp"), MOTOR_TYP_DROP, editable, required);
const PRODUKT_SELECT = (editable, required) => new AutoSelectColumn("PRODUKT", "produkt", produktKey, produktSetter, PRODUKT_DROP, editable, required);
const PROTOKOLL_SELECT = (editable, required) => new ImageSelectColumn("PROTOKOLL", "protokoll", fieldGetter("protokoll"), fieldSetter("protokoll"), PROTOKOLL_DROP, editable, required);
const SONDERMODELL_SELECT  = (editable, required) =>  new DropDownColumn("SONDERMODELL", "sondermodell", fieldGetter("sondermodell"), fieldSetter("sondermodell"), SONDERMODELL_DROP, editable, required);
const SPURWEITE_SELECT = (editable, required) => new DropDownColumn("SPURWEITE", "spurweite", fieldGetter("spurweite"), fieldSetter("spurweite"), SPURWEITE_DROP, editable, required);
const STATUS_SELECT = (editable, required) => new DropDownColumn("STATUS", "status", fieldGetter("status"), fieldSetter("status"), STATUS_DROP, editable, required);
const STECKER_SELECT = (editable, required) => new DropDownColumn("STECKER", "stecker", fieldGetter("stecker"), fieldSetter("stecker"), STECKER_DROP, editable, required);
const STEUERUNG_SELECT = (editable, required) => new ImageSelectColumn("STEUERUNG", "steuerung", fieldGetter("steuerung"), fieldSetter("steuerung"), STEUERUNG_DROP, editable, required);
const TEIL_SELECT = (editable, required) => new DropDownColumn("TEIL", "teil", produktTeilGetter, produktTeilSetter, PRODUKT_DROP, editable, required);
const UNTER_KATEGORIE_SELECT = (editable, required) => new DropDownColumn("KATEGORIE", "unterKategorie", unterKategorieGetter, unterKategorieSetter, UNTER_KATEGORIE_DROP, editable, required);
const VORBILD_SELECT = (editable, required) => new DropDownColumn("VORBILD", "vorbild", fieldGetter("vorbild"), fieldSetter("vorbild"), VORBILD_DROP, editable, required);
const WAHRUNG_SELECT = (editable, required) => new AutoSelectColumn("WAHRUNG", "wahrung", fieldGetter("wahrung"), fieldSetter("wahrung"), WAHRUNG_DROP, editable, required);
const ZUG_TYP_SELECT = (editable, required) => new DropDownColumn("ZUG_TYP", "zugTyp", fieldGetter("zugTyp"), fieldSetter("zugTyp"), ZUG_TYP_DROP, editable, required);
const EPOCH_SELECT = (editable, required) => new ImageSelectColumn("EPOCH", "epoch", fieldGetter("epoch"), fieldSetter("epoch"), EPOCH_DROP, editable, required);

const ABBILDUNG = (editable, required) => new ImageColumn("ABBILDUNG", "abbildung", fieldGetter("abbildung"), editable, required);
const ACHSFOLG_BEZEICHNUNG = () => new TextColumn("ACHSFOLG", "achsfolg", fieldGetter("achsfolgBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const ADRESS = (editable, required) => new NumberColumn("ADRESS", "adress", fieldGetter("adress"), fieldSetter("adress"), editable, required, 65535, 1);
const ANDERUNGS_DATUM = (editable, required) => new DateColumn("DATUM", "anderungsDatum", dateGetter("anderungsDatum"), dateSetter("anderungsDatum"), editable, required);
const ANDERUNG_ID = (editable, required) => new NumberColumn("ANDERUNG", "anderungId", fieldGetter("anderungId"), fieldSetter("anderungId"), editable, required);
const ANFAHRZUGKRAFT = (editable, required) => new NumberColumn("ANFAHRZUGKRAFT", "anfahrzugkraft", fieldGetter("anfahrzugkraft"), fieldSetter("anfahrzugkraft"), editable, required, 300000, 0);
const ANLEITUNGEN = (editable, required) => new PdfColumn("ANLEITUNGEN", "anleitungen", fieldGetter("anleitungen"), editable, required);
const ANMERKUNG = (editable, required) => new TextColumn("ANMERKUNG", "anmerkung", fieldGetter("anmerkung"), fieldSetter("anmerkung"), editable, required, 30);
const ANTRIEB_BEZEICHNUNG = () => new TextColumn("ANTRIEB", "antrieb", fieldGetter("antriebBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const ARTIKEL_ID = () => new TextColumn("ARTIKEL", "artikelId", fieldGetter("artikelId"), noOpSetter, Editable.NEVER, false, 6, "^[A-Z0-9]+$");
const ARTIKEL_BEZEICHNUNG = () => new TextColumn("ARTIKEL", "artikel", fieldGetter("artikelBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const AUFBAU = (editable, required) => new TextColumn("AUFBAU", "aufbau", fieldGetter("aufbau"), fieldSetter("aufbau"), editable, required, 50);
const AUFBAU_BEZEICHNUNG = () => new TextColumn("AUFBAU", "aufbau", fieldGetter("aufbauBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const AUSSERDIENST = (editable, required) => new DateColumn("AUSSERDIENST", "ausserdienst", dateSetter("ausserdienst"), dateSetter("ausserdienst"), editable, required);
const BAHNVERWALTUNG_BEZEICHNUNG = () => new TextColumn("BAHNVERWALTUNG", "bahnverwaltungBezeichnung", noOpSetter, fieldSetter("bahnverwaltung"), Editable.NEVER, false, 50);
const BAUZEIT = (editable, required) => new DateColumn("BAUZEIT", "bauzeit", dateGetter("bauzeit"), dateSetter("bauzeit"), editable, required);
const BELADUNG = (editable, required) => new TextColumn("BELADUNG", "beladung", fieldGetter("beladung"), fieldSetter("beladung"), editable, required, 30);
const BESTELL_NR = (editable, required) => new TextColumn("BESTELL_NR", "bestellNr", fieldGetter("bestellNr"), fieldSetter("bestellNr"), editable, required, 10);
const BETREIBSNUMMER = (editable, required) => new TextColumn("BETREIBSNUMMER", "betreibsnummer", fieldGetter("betreibsnummer"), fieldSetter("betreibsnummer"), editable, required, 30);
const BEZEICHNUNG = (editable, required) => new TextColumn("BEZEICHNUNG", "bezeichnung", fieldGetter("bezeichnung"), fieldSetter("bezeichnung"), editable, required, 50);
const CV = (editable, required) => new NumberColumn("CV", "cv", fieldGetter("cv"), fieldSetter("cv"), editable, required, 127, 1);
const DECODER_ID = () => new TextColumn("DECODER", "decoderId", fieldGetter("decoderId"), noOpSetter, Editable.NEVER, false, 6, "^[A-Z0-9]+$");
const DECODER_BEZEICHNUNG = () => new TextColumn("DECODER", "decoderId", fieldGetter("decoderBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const DECODER_TYP_BEZEICHNUNG = () => new TextColumn("DECODER_TYP", "decoderTyp", produktBezeichnung, noOpSetter, Editable.NEVER, false, 50);
const DIENSTGEWICHT = (editable, required) => new NumberColumn("DIENSTGEWICHT", "dienstgewicht", fieldGetter("dienstgewicht"), fieldSetter("dienstgewicht"), editable, required, 1000, 0);
const DM_LAUFRAD_HINTEN = (editable, required) => new NumberColumn("DM_LAUFRAD_HINTEN", "dmLaufradHinten", fieldGetter("dmLaufradHinten"), fieldSetter("dmLaufradHinten"), editable, required, 4000, 0);
const DM_LAUFRAD_VORN = (editable, required) => new NumberColumn("DM_LAUFRAD_VORN", "dmLaufradVorn", fieldGetter("dmLaufradVorn"), fieldSetter("dmLaufradVorn"), editable, required, 4000, 0);
const DM_TREIBRAD = (editable, required) => new NumberColumn("DM_TREIBRAD", "dmTreibrad", fieldGetter("dmTreibrad"), fieldSetter("dmTreibrad"), editable, required, 4000, 0);
const DM_ZYLINDER = (editable, required) => new NumberColumn("DM_ZYLINDER", "dmZylinder", fieldGetter("dmZylinder"), fieldSetter("dmZylinder"), editable, required, 3000, 0);
const DREHGESTELLBAUART = (editable, required) => new TextColumn("DREHGESTELLBAUART", "drehgestellBauart", fieldGetter("drehgestellBauart"), fieldSetter("drehgestellBauart"), editable, required, 30);
const END_YEAR = (editable, required) => new NumberColumn("END_YEAR", "endYear", fieldGetter("endYear"), fieldSetter("endYear"), editable, required, 2100, 1800, 0, false);
const EPOCH_BEZEICHNUNG = () => new TextColumn("EPOCH", "epoch", fieldGetter("epochBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const EXPLOSIONSZEICHNUNG = (editable, required) => new PdfColumn("EXPLOSIONSZEICHNUNG", "explosionszeichnung", fieldGetter("explosionszeichnung"), editable, required);
const FAHRMOTOREN = (editable, required) => new NumberColumn("FAHRMOTOREN", "fahrmotoren", fieldGetter("fahrmotoren"), fieldSetter("fahrmotoren"), editable, required, 5, 0);
const FAHRSTUFE = (editable, required) => new NumberColumn("FAHRSTUFE", "fahrstufe", fieldGetter("fahrstufe"), fieldSetter("fahrstufe"), editable, required, 127, 1);
const FAHRZEUG_BEZEICHNUNG = () => new TextColumn("ARTIKEL", "artikel", fieldGetter("artikelBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const FUNKTION = (editable, required) => new TextColumn("FUNKTION", "funktion", fieldGetter("funktion"), fieldSetter("funktion"), editable, required, 3, "^F([12]d|3[012]|d)$|^K(1[012345]|d)$|^S[0123456]$");
const GATTUNG_BEZEICHNUNG = () => new TextColumn("GATTUNG", "gattung", fieldGetter("gattungBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const GERAUSCH = (editable, required) => new BoolColumn("GERAUSCH", "gerausch", fieldGetter("gerausch"), fieldSetter("gerausch"), editable, required);
const GESCHWINDIGKEIT = (editable, required) => new NumberColumn("GESCHWINDIGKEIT", "geschwindigkeit", fieldGetter("geschwindigkeit"), fieldSetter("geschwindigkeit"), editable, required, 300, 0);
const HERSTELLER = (editable, required) => new TextColumn("HERSTELLER", "hersteller", fieldGetter("hersteller"), fieldSetter("hersteller"), editable, required, 3);
const HERSTELLER_BEZEICHNUNG = () => new TextColumn("HERSTELLER", "hersteller", fieldGetter("herstellerBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const I_MAX = (editable, required) => new NumberColumn("I_MAX", "iMax", fieldGetter("iMax"), fieldSetter("iMax"), editable, required, 5000, 1);
const KAPAZITAT = (editable, required) => new NumberColumn("KAPAZITAT", "kapazitat", fieldGetter("kapazitat"), fieldSetter("kapazitat"), editable, required, 3000, 0, 2);
const KAUFDATUM = (editable, required) => new DateColumn("KAUFDATUM", "kaufdatum", dateGetter("kaufdatum"), dateGetter("kaufdatum"), editable, required);
const KESSELUBERDRUCK = (editable, required) => new NumberColumn("KESSELUBERDRUCK", "kesseluberdruck", fieldGetter("kesseluberdruck"), fieldSetter("kesseluberdruck"), editable, required, 100, 0, 2);
const KLASSE = (editable, required) => new NumberColumn("KLASSE", "klasse", fieldGetter("klasse"), fieldSetter("klasse"), editable, required, 4, 0);
const KOLBENHUB = (editable, required) => new NumberColumn("KOLBENHUB", "kolbenhub", fieldGetter("kolbenhub"), fieldSetter("kolbenhub"), editable, required, 3000, 0);
const KONFIGURATION_BEZEICHNUNG = () => new TextColumn("KONFIGURATION", "konfigurationBezeichnung", fieldGetter("konfiguration"), noOpSetter, Editable.NEVER, false, 50);
const KUPPLUNG_BEZEICHNUNG = () => new TextColumn("KUPPLUNG", "kupplungBezeichnung", fieldGetter("kupplung"), noOpSetter, Editable.NEVER, false, 50);
const LAND_BEZEICHNUNG = () => new TextColumn("LAND", "land", fieldGetter("landBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const LANGE = (editable, required) => new NumberColumn("LANGE", "lange", fieldGetter("lange"), fieldSetter("lange"), editable, required, 100, 0, 2, true);
const LEISTUNG = (editable, required) => new NumberColumn("LEISTUNG", "leistung", fieldGetter("leistung"), fieldSetter("leistung"), editable, required, 100000, 0);
const LICHT_BEZEICHNUNG = () => new TextColumn("LICHT", "licht", fieldGetter("lichtBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const MASSSTAB_BEZEICHNUNG = () => new TextColumn("MASSSTAB", "massstab", fieldGetter("massstabBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const MAXIMAL = (editable, required) => new NumberColumn("MAXIMAL", "maximal", fieldGetter("maximal"), fieldSetter("maximal"), editable, required, 255, 0);
const MENGE = (editable, required) => new NumberColumn("MENGE", "menge", fieldGetter("menge"), fieldSetter("menge"), editable, required, 100000, 1);
const MINIMAL = (editable, required) => new NumberColumn("MINIMAL", "minimal", fieldGetter("minimal"), fieldSetter("minimal"), editable, required, 255, 0);
const MITTELWAGEN = (editable, required) => new NumberColumn("MITTELWAGEN", "mittelwagen", fieldGetter("mittelwagen"), fieldSetter("mittelwagen"), editable, required, 30, 0);
const MOTORBAUART = (editable, required) => new TextColumn("MOTORBAUART", "motorbauart", fieldGetter("motorbauart"), fieldSetter("motorbauart"), editable, required, 30);
const MOTOR_TYP_BEZEICHNUNG = () => new TextColumn("MOTOR_TYP", "motorTyp", fieldGetter("motorTypBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const NAMEN = (editable, required) => new TextColumn("NAMEN", "name", fieldGetter("name"), fieldSetter("name"), editable, required, 30, "^[A-Z0-9.-]+$");
const POSITION = () => new NumberColumn("POSITION", "position", fieldGetter("position"), fieldSetter("position"), Editable.NEVER, true, 30, 0);
const PREIS = (editable, required) => new NumberColumn("PREIS", "preis", fieldGetter("preis"), fieldSetter("preis"), editable, required, 9000, 0, 2);
const PRODUKT_BEZEICHNUNG = () => new TextColumn("PRODUKT", "produkt", produktBezeichnung, noOpSetter, Editable.NEVER, false, 50);
const PROGRAMMABLE = (editable, required) => new BoolColumn("PROGRAMMABLE", "programmable", fieldGetter("programmable"), fieldSetter("programmable"), editable, required);
const PROTOKOLL_BEZEICHNUNG = () => new TextColumn("PROTOKOLL", "protokollBezeichnung", fieldGetter("protokoll"), noOpSetter, Editable.NEVER, false, 50);
const REICHWEITE = (editable, required) => new NumberColumn("REICHWEITE", "reichweite", fieldGetter("reichweite"), fieldSetter("reichweite"), editable, required, 3000, 0);
const ROSTFLACHE = (editable, required) => new NumberColumn("ROSTFLACHE", "rostflache", fieldGetter("rostflache"), fieldSetter("rostflache"), editable, required, 3000, 0, 2);
const SITZPLATZE_KL1 = (editable, required) => new NumberColumn("SITZPLATZE_KL1", "sitzplatzeKL1", fieldGetter("sitzplatzeKL1"), fieldSetter("sitzplatzeKL1"), editable, required, 300, 0);
const SITZPLATZE_KL2 = (editable, required) => new NumberColumn("SITZPLATZE_KL2", "sitzplatzeKL2", fieldGetter("sitzplatzeKL2"), fieldSetter("sitzplatzeKL2"), editable, required, 300, 0);
const SITZPLATZE_KL3 = (editable, required) => new NumberColumn("SITZPLATZE_KL3", "sitzplatzeKL3", fieldGetter("sitzplatzeKL3"), fieldSetter("sitzplatzeKL3"), editable, required, 300, 0);
const SITZPLATZE_KL4 = (editable, required) => new NumberColumn("SITZPLATZE_KL4", "sitzplatzeKL4", fieldGetter("sitzplatzeKL4"), fieldSetter("sitzplatzeKL4"), editable, required, 300, 0);
const SONDERMODELL_BEZEICHNUNG  = () =>  new TextColumn("SONDERMODELL", "sondermodell", fieldGetter("sondermodellBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const SPAN = (editable, required) => new NumberColumn("SPAN", "span", fieldGetter("span"), fieldSetter("span"), editable, required, 16, 1);
const SPURWEITE_BEZEICHNUNG = () => new TextColumn("SPURWEITE", "spurweite", fieldGetter("spurweiteBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const START_YEAR = (editable, required) => new NumberColumn("START_YEAR", "startYear", fieldGetter("startYear"), fieldSetter("startYear"), editable, required, 2100, 1800, 0, false);
const STEUERUNG_BEZEICHNUNG = () => new TextColumn("STEUERUNG", "steuerung", fieldGetter("steuerungBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const TEIL_BEZEICHNUNG = () => new TextColumn("TEIL", "teil", produktTeilBezeichnungGetter, noOpSetter, Editable.NEVER, false, 50);
const TELEFON = (editable, required) => new PhoneColumn("TELEFON", "telefon", fieldGetter("telefon"), fieldSetter("telefon"), editable, required);
const THUMBNAIL = () => new ThumbColumn("abbildung", "abbildung", fieldGetter("abbildung"));
const TRIEBKOPFE = (editable, required) => new NumberColumn("TRIEBKOPFE", "triebkopf", fieldGetter("triebkopf"), fieldSetter("triebkopf"), editable, required, 2, 0);
const UBERHITZERFLACHE = (editable, required) => new NumberColumn("UBERHITZERFLACHE", "uberhitzerflache", fieldGetter("uberhitzerflache"), fieldSetter("uberhitzerflache"), editable, required, 3000, 0, 2);
const UNTER_KATEGORIE_BEZEICHNUNG = () => new TextColumn("KATEGORIE", "unterKategorieBezeichnung", unterKategorieBezeichnungGetter, noOpSetter, Editable.NEVER, false, 50);
const VERBLEIBENDE = (editable, required) => new NumberColumn("VERBLEIBENDE", "verbleibende", fieldGetter("verbleibende"), fieldSetter("verbleibende"), editable, required);
const VERDAMPFUNG = (editable, required) => new NumberColumn("VERDAMPFUNG", "verdampfung", fieldGetter("verdampfung"), fieldSetter("verdampfung"), editable, required, 3000, 0, 2);
const WASSERVORRAT = (editable, required) => new NumberColumn("WASSERVORRAT", "wasservorrat", fieldGetter("wasservorrat"), fieldSetter("wasservorrat"), editable, required, 3000, 0, 2);
const WEBSITE = (editable, required) => new UrlColumn("URL", "url", fieldGetter("url"), fieldSetter("url"), editable, required);
const WERKSEINSTELLUNG = (editable, required) => new NumberColumn("WERKSEINSTELLUNG", "werkseinstellung", fieldGetter("werkseinstellung"), fieldSetter("werkseinstellung"), editable, required, 65535, 1);
const WERT = (editable, required) => new NumberColumn("WERT", "wert", fieldGetter("wert"), fieldSetter("wert"), editable, required, 65535, 1);
const ZUG = (editable, required) => new TextColumn("ZUG", "zug", fieldGetter("zug"), fieldSetter("zug"), editable, required, 30);
const ZUG_TYP_BEZEICHNUNG = () => new TextColumn("ZUG_TYP", "zugTyp", fieldGetter("zugTypBezeichnung"), noOpSetter, Editable.NEVER, false, 50);
const ZYLINDER = (editable, required) => new NumberColumn("ZYLINDER", "zylinder", fieldGetter("zylinder"), fieldSetter("zylinder"), editable, required, 36, 0);

const ADRESS_SEARCH = () => new SearchColumn("ADRESS", [{ fieldName: "adress", type: "number"}]);
const ANMERKUNG_SEARCH = () => new SearchColumn("ANMERKUNG", [{ fieldName: "anmerkung", type: "text"}]);
const ARTIKEL_ID_SEARCH = () => new SearchColumn("ARTIKEL", [{ fieldName: "artikelId", type: "text"}]);
const ARTIKEL_SEARCH = () => new SearchColumn("ARTIKEL", [{ fieldName: "artikel", type: "text"}]);
const AUSSERDIENST_SEARCH = () => new SearchColumn("AUSSERDIENST", [{ fieldName: "ausserdienst", type: "date"}]);
const BAHNVERWALTUNG_SEARCH = () => new SearchColumn("BAHNVERWALTUNG", [{ fieldName: "bahnverwaltung", type: "text"}]);
const BAUZEIT_SEARCH = () => new SearchColumn("BAUZEIT", [{ fieldName: "bauzeit", type: "date"}]);
const BESTELL_NR_SEARCH = () => new SearchColumn("BESTELL_NR", [{ fieldName: "bestellNr", type: "text"}]);
const BEZEICHNUNG_SEARCH = () => new SearchColumn("BEZEICHNUNG", [{ fieldName: "bezeichnung", type: "text"}]);
const DECODER_ID_SEARCH = () => new SearchColumn("DECODER", [{ fieldName: "decoderId", type: "text"}]);
const DECODER_STATUS_SEARCH = () => new SearchColumn("DECODER_STATUS", [{ fieldName: "status", type: "select", dropDown: DECODER_STATUS_DROP}]);
const DECODER_TYP_SEARCH = () => new SearchColumn("DECODER_TYP", [{ fieldName: "hersteller", type: "text", width: "47%"}, { fieldName: "bestellNr", type: "text", width: "47%"}]);
const EPOCH_SEARCH = () => new SearchColumn("EPOCH", [{ fieldName: "epoch", type: "text"}]);
const GATTUNG_SEARCH = () => new SearchColumn("GATTUNG", [{ fieldName: "gattung", type: "text"}]);
const GERAUSCH_SEARCH = () => new SearchColumn("GERAUSCH", [{ fieldName: "gerausch", type: "checkbox"}]);
const HERSTELLER_SEARCH = () => new SearchColumn("HERSTELLER", [{ fieldName: "hersteller", type: "text"}]);
const LAND_SEARCH = () => new SearchColumn("LAND", [{ fieldName: "land", type: "text"}]); 
const MASSSTAB_SEARCH = () => new SearchColumn("MASSSTAB", [{ fieldName: "massstab", type: "text"}]);
const MENGE_SEARCH = () => new SearchColumn("MENGE", [{ fieldName: "menge", type: "number"}]);
const NAMEN_SEARCH = () => new SearchColumn("NAMEN", [{ fieldName: "name", type: "text"}]); 
const PRODUKT_SEARCH = () => new SearchColumn("PRODUKT", [{ fieldName: "hersteller", type: "text", width: "65%"}, { fieldName: "bestellNr", type: "text", width: "30%"}]);
const PROTOKOLL_SEARCH = () => new SearchColumn("PROTOKOLL", [{ fieldName: "protokoll", type: "text"}]);
const SPURWEITE_SEARCH = () => new SearchColumn("SPURWEITE", [{ fieldName: "spurweite", type: "text"}]);
const STATUS_SEARCH = () => new SearchColumn("STATUS", [{ fieldName: "status", type: "select", dropDown: STATUS_DROP}]);
const STECKER_SEARCH = () => new SearchColumn("STECKER", [{ fieldName: "stecker", type: "select", dropDown: STECKER_DROP}]);
const UNTER_KATEGORIE_SEARCH = () => new SearchColumn("KATEGORIE", [{ fieldName: "kategorie", type: "text", width: "30%"}, { fieldName: "unterKategorie", type: "text", width: "65%"}]);
const ZUG_TYP_SEARCH = () => new SearchColumn("ZUG_TYP", [{ fieldName: "zugTyp", type: "text"}]);

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
