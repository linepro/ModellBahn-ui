// module 'fields.js'
'use strict';

const optionExtractor = (jsonData) => { return jsonData._embedded.data; }

const bezeichnungOption = (entity) => { return new DropOption(entity.name, entity.bezeichnung, entity.tooltip, entity.abbildung) };

const artikelOption = (entity) => { return new DropOption(entity.artikelId, entity.bezeichnung) };

const decoderOption = (entity) => { return new DropOption(entity.decoderId, entity.bezeichnung) };

const kategorieOption = (entity) => { return new DropOption(entity.kategorie + '/' + entity.name, entity.kategorie  + ' - ' + entity.bezeichnung) };

const produktOption = (entity) => { return new DropOption(entity.hersteller + '/' + entity.bestellNr, entity.hersteller + ' - ' + entity.bestellNr) };

const vorbildOption = (entity) => { return new DropOption(entity.gattung, entity.bezeichnung) };

const unterKategorieExtractor = (jsonData) => {
    let unterKategorien = [];
    for (let k = 0; k < jsonData._embedded.data.length; k++) {
        for (let u = 0; u < jsonData._embedded.data[k].unterKategorien.length; u++) {
            unterKategorien.push(jsonData._embedded.data[k].unterKategorien[u]);
        }
    }
    return unterKategorien;
}

const ACHSFOLG_DROP = new DropDown(apiRoot() + 'achsfolg', optionExtractor, bezeichnungOption);
const ADRESS_TYP_DROP = new DropDown(apiRoot() + 'enums/adressTyp', optionExtractor, bezeichnungOption);
const ANDERUNGS_TYP_DROP = new DropDown(apiRoot() + 'enums/anderungsTyp', optionExtractor, bezeichnungOption);
const ANTRIEB_DROP = new DropDown(apiRoot() + 'antrieb', optionExtractor, bezeichnungOption);
const ARTIKEL_DROP = new DropDown(apiRoot() + 'artikel', optionExtractor, artikelOption);
const AUFBAU_DROP = new DropDown(apiRoot() + 'aufbau', optionExtractor, bezeichnungOption);
const BAHNVERWALTUNG_DROP = new DropDown(apiRoot() + 'bahnverwaltung', optionExtractor, bezeichnungOption);
const DECODER_DROP = new DropDown(apiRoot() + 'decoder', optionExtractor, decoderOption);
const DECODER_STATUS_DROP = new DropDown(apiRoot() + 'enums/decoderStatus', optionExtractor, decoderOption);
const DECODER_TYP_DROP = new DropDown(apiRoot() + 'decoderTyp', optionExtractor, produktOption);
const EPOCH_DROP = new DropDown(apiRoot() + 'epoch', optionExtractor, bezeichnungOption);
const GATTUNG_DROP = new DropDown(apiRoot() + 'gattung', optionExtractor, bezeichnungOption);
const HERSTELLER_DROP = new DropDown(apiRoot() + 'hersteller', optionExtractor, bezeichnungOption);
const KONFIGURATION_DROP = new DropDown(apiRoot() + 'enums/konfiguration', optionExtractor, bezeichnungOption);
const KUPPLUNG_DROP = new DropDown(apiRoot() + 'kupplung', optionExtractor, bezeichnungOption);
const LAND_DROP = new DropDown(apiRoot() + 'enums/land', optionExtractor, bezeichnungOption);
const LEISTUNGSUBERTRAGUNG_DROP = new DropDown(apiRoot() + 'enums/leistungsubertragung', optionExtractor, bezeichnungOption);
const LICHT_DROP = new DropDown(apiRoot() + 'licht', optionExtractor, bezeichnungOption);
const MASSSTAB_DROP = new DropDown(apiRoot() + 'massstab', optionExtractor, bezeichnungOption);
const MOTOR_TYP_DROP = new DropDown(apiRoot() + 'motorTyp', optionExtractor, bezeichnungOption);
const PRODUKT_DROP = new DropDown(apiRoot() + 'produkt', optionExtractor, produktOption);
const PROTOKOLL_DROP = new DropDown(apiRoot() + 'protokoll', optionExtractor, bezeichnungOption);
const SONDERMODELL_DROP = new DropDown(apiRoot() + 'sondermodell', optionExtractor, bezeichnungOption);
const SPURWEITE_DROP = new DropDown(apiRoot() + 'spurweite', optionExtractor, bezeichnungOption);
const STATUS_DROP = new DropDown(apiRoot() + 'enums/status', optionExtractor, bezeichnungOption);
const STECKER_DROP = new DropDown(apiRoot() + 'enums/stecker', optionExtractor, bezeichnungOption);
const STEUERUNG_DROP = new DropDown(apiRoot() + 'steuerung', optionExtractor, bezeichnungOption);
const UNTER_KATEGORIE_DROP = new DropDown(apiRoot() + 'unterKategorien', unterKategorieExtractor, kategorieOption);
const VORBILD_DROP = new DropDown(apiRoot() + 'vorbild', optionExtractor, vorbildOption);
const WAHRUNG_DROP = new DropDown(apiRoot() + 'enums/wahrung', optionExtractor, bezeichnungOption);
const ZUG_TYP_DROP = new DropDown(apiRoot() + 'zugTyp', optionExtractor, bezeichnungOption);

const artikelIdGetter = (entity) => { return entity.artikelId };
const artikelIdSetter = (entity, value) => { entity.artikelId = value };
const decoderIdGetter = (entity) => { return entity.decoderId };
const decoderIdSetter = (entity, value) => { entity.decoderId = decoderId };
const decoderTypGetter = (entity) => { return entity.hersteller + '/' + entity.bestellNr };
const decoderTypSetter = (entity, value) => { let parts = value.split('/'); entity.hersteller = parts[0]; entity.bestellNr = parts[1] };
const produktGetter = (entity) => { return entity.hersteller + '/' + entity.bestellNr };
const produktSetter = (entity, value) => { let parts = value.split('/'); entity.hersteller = parts[0]; entity.bestellNr = parts[1] };
const produktTeilGetter = (entity) => { return entity.teilHersteller + '/' + entity.teilBestellNr };
const produktTeilSetter = (entity, value) => { let parts = value.split('/'); entity.teilHersteller = parts[0] ; entity.teilBestellNrbestellNr = parts[1] };
const unterKategorieGetter = (entity) => { return entity.kategorie + "/" + entity.unterKategorie };
const unterKategorieSetter = (entity, value) => { let parts = value.split('/'); entity.kategorie = parts[0]; entity.unterKategorie = parts[1] };
const vorbildGetter = (entity) => { return entity.gattung };
const vorbildSetter = (entity, value) => { entity.gattung = value };

const fieldGetter = (entity, fieldName) => { return entity[fieldName] };
const fieldSetter = (entity, value, fieldName) => { entity[fieldName] = value };
const noOpSetter = () => {};

const ACHSFOLG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('ACHSFOLG', 'achsfolg', getter, setter, ACHSFOLG_DROP, editable, required, 30, 5) };
const ADRESS_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('ADRESS_TYP', 'adressTyp', getter, setter, ADRESS_TYP_DROP, editable, required, 5) };
const ANDERUNGS_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('ANDERUNGS_TYP', 'anderungsTyp', getter, setter, ANDERUNGS_TYP_DROP, editable, required) };
const ANTRIEB_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('ANTRIEB', 'antrieb', getter, setter, ANTRIEB_DROP, editable, required, 30, 5) };
const ARTIKEL_SELECT = (editable, required, getter = artikelIdGetter, setter = artikelIdSetter) => { return new DropDownColumn('ARTIKEL', 'artikel', getter, setter, ARTIKEL_DROP, editable, required, 50, 5) };
const AUFBAU_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('AUFBAU', 'aufbau', getter, setter, AUFBAU_DROP, editable, required, 30, 5) };
const BAHNVERWALTUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('BAHNVERWALTUNG', 'bahnverwaltung', getter, setter, BAHNVERWALTUNG_DROP, editable, required, 30, 5) };
const DECODER_SELECT = (editable, required, getter = decoderIdGetter, setter = decoderIdSetter) => { return new DropDownColumn('DECODER', 'decoder', getter, setter, DECODER_DROP, editable, required, 30, 5) };
const DECODER_STATUS_SELECT = (editable, required, getter = decoderIdGetter, setter = decoderIdSetter) => { return new DropDownColumn('DECODER_STATUS', 'decoder', getter, setter, DECODER_STATUS_DROP, editable, required, 30, 5) };
const DECODER_TYP_SELECT = (editable, required, getter = decoderTypGetter, setter = decoderTypSetter) => { return new DropDownColumn('DECODER_TYP', 'decoderTyp', getter, setter, DECODER_TYP_DROP, editable, required, 50, 5) };
const EPOCH_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('EPOCH', 'epoch', getter, setter, EPOCH_DROP, editable, required, 30, 5) };
const GATTUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('GATTUNG', 'gattung', getter, setter, GATTUNG_DROP, editable, required, 30, 5) };
const HERSTELLER_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('HERSTELLER', 'hersteller', getter, setter, HERSTELLER_DROP, editable, required) };
const KONFIGURATION_SELECT = (editable, required = true, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('KONFIGURATION', 'konfiguration', getter, setter, KONFIGURATION_DROP, editable, required) };
const KUPPLUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('KUPPLUNG', 'kupplung', getter, setter, KUPPLUNG_DROP, editable, required, 30, 5) };
const LAND_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('LAND', 'land', getter, setter, LAND_DROP, editable, required, 5) };
const LEISTUNGSUBERTRAGUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('LEISTUNGSUBERTRAGUNG', 'leistungsubertragung', getter, setter, LEISTUNGSUBERTRAGUNG_DROP, editable, required, 30, 5) };
const LICHT_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('LICHT', 'licht', getter, setter, LICHT_DROP, editable, required, 30, 5) };
const MASSSTAB_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('MASSSTAB', 'massstab', getter, setter, MASSSTAB_DROP, editable, required, 30, 5) };
const MOTOR_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('MOTOR_TYP', 'motorTyp', getter, setter, MOTOR_TYP_DROP, editable, required, 30, 5) };
const PRODUKT_SELECT = (editable, required, getter = produktGetter, setter = produktSetter) => { return new DropDownColumn('PRODUKT', 'produkt', getter, setter, PRODUKT_DROP, editable, required, 50, 5) };
const PROTOKOLL_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('PROTOKOLL', 'protokoll', getter, setter, PROTOKOLL_DROP, editable, required) };
const SONDERMODELL_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('SONDERMODELL', 'sonderModell', getter, setter, SONDERMODELL_DROP, editable, required, 30, 5) };
const SPURWEITE_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('SPURWEITE', 'spurweite', getter, setter, SPURWEITE_DROP, editable, required, 30, 5) };
const STATUS_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('STATUS', 'status', getter, setter, STATUS_DROP, editable, required, 30, 5) };
const STECKER_SELECT = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('STECKER', 'stecker', getter, setter, STECKER_DROP, editable, required, 30, 5) };
const STEUERUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('STEUERUNG', 'steuerung', getter, setter, STEUERUNG_DROP, editable, required, 30, 5) };
const TEIL_SELECT = (editable = Editable.UPDATE, required = false, getter = produktTeilGetter, setter = produktTeilSetter) => { return new DropDownColumn('TEIL', 'teil', getter, setter, PRODUKT_DROP, editable, required, 50, 5) };
const UNTER_KATEGORIE_SELECT = (editable = Editable.UPDATE, required = false, getter = unterKategorieGetter, setter = unterKategorieSetter) => { return new DropDownColumn('KATEGORIE', 'unterKategorie', getter, setter, UNTER_KATEGORIE_DROP, editable, required) };
const VORBILD_SELECT = (editable = Editable.UPDATE, required = false, getter = vorbildGetter, setter = vorbildSetter) => { return new DropDownColumn('VORBILD', 'vorbild', getter, setter, VORBILD_DROP, editable, required, 30, 5) };
const WAHRUNG_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('WAHRUNG', 'wahrung', getter, setter, WAHRUNG_DROP, editable, required, 30, 5) };
const ZUG_TYP_SELECT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DropDownColumn('ZUG_TYP', 'typ', getter, setter, ZUG_TYP_DROP, editable, required, 30, 5) };

const ABBILDUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) => { return new IMGColumn('ABBILDUNG', 'abbildung', getter, editable, required) };
const ADRESS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ADRESS', 'adress', getter, setter, editable, required, 65535, 1) };
const ANDERUNGS_DATUM = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DateColumn('DATUM', 'anderungsDatum', getter, setter, editable, required, 5) };
const ANDERUNGS_ID = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ANDERUNG', 'anderungId', getter, setter, editable, required, 30, 0) };
const ANFAHRZUGKRAFT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ANFAHRZUGKRAFT', 'anfahrzugkraft', getter, setter, editable, required, 300000, 1) };
const ANLEITUNGEN = (editable = Editable.UPDATE, required = false, getter = fieldGetter) => { return new PDFColumn('ANLEITUNGEN', 'anleitungen', getter, editable, required) };
const ANMERKUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('ANMERKUNG', 'anmerkung', getter, setter, editable, required, 30) };
const ANZAHL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ANZAHL', 'anzahl', getter, setter, editable, required, 300000, 1) };
const ARTIKEL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('ARTIKEL', 'artikelId', getter, setter, editable, required, 5) };
const AUFBAU = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('AUFBAU', 'aufbau', getter, setter, editable, required, 5) };
const AUSSERDIENST = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DateColumn('AUSSERDIENST', 'ausserdienst', getter, setter, editable, required) };
const BAUZEIT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DateColumn('BAUZEIT', 'bauzeit', getter, setter, editable, required) };
const BELADUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('BELADUNG', 'beladung', getter, setter, editable, required, 30) };
const BESTELL_NR = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('BESTELL_NR', 'bestellNr', getter, setter, editable, required, 10) };
const BETREIBSNUMMER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('BETREIBSNUMMER', 'betreibsnummer', getter, setter, editable, required, 30) };
const BEZEICHNUNG = (editable = Editable.UPDATE, required = true, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('BEZEICHNUNG', 'bezeichnung', getter, setter, editable, required, 50) };
const CV = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('CV', 'cv', getter, setter, editable, required, 127, 1) };
const DECODER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('DECODER', 'decoderId', getter, setter, editable, required, 5) };
const DELETED = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new BoolColumn('DELETED', 'deleted', getter, setter, editable, required) };
const DEZIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DEZIMAL', 'dezimal', getter, setter, editable, required, 3, 0) };
const DIENSTGEWICHT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DIENSTGEWICHT', 'dienstgewicht', getter, setter, editable, required, 999, 1) };
const DMLAUFRADHINTEN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DM_LAUFRAD_HINTEN', 'dmLaufradHinten', getter, setter, editable, required, 3000, 1) };
const DMLAUFRADVORN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DM_LAUFRAD_VORN', 'dmLaufradVorn', getter, setter, editable, required, 3000, 1) };
const DMTREIBRAD = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DM_TREIBRAD', 'dmTreibrad', getter, setter, editable, required, 3000, 1) };
const DMZYLINDER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('DM_ZYLINDER', 'dmZylinder', getter, setter, editable, required, 3000, 1) };
const DREHGESTELLBAUART = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('DREHGESTELL', 'drehgestellBauart', getter, setter, editable, required, 30) };
const EXPLOSIONSZEICHNUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter) => { return new PDFColumn('EXPLOSIONSZEICHNUNG', 'explosionszeichnung', getter, editable, required) };
const FAHRMOTOREN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('FAHRMOTOREN', 'fahrmotoren', getter, setter, editable, required, 5, 1) };
const FAHRSTUFE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('FAHRSTUFE', 'fahrstufe', getter, setter, editable, required, 127, 1) };
const FUNKTION = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('FUNKTION', 'funktion', getter, setter, editable, required, 3) };
const GERAUSCH = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new BoolColumn('GERAUSCH', 'gerausch', getter, setter, editable, required) };
const GESCHWINDIGKEIT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('GESCHWINDIGKEIT', 'geschwindigkeit', getter, setter, editable, required, 300, 1) };
const HERSTELLER = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('HERSTELLER', 'hersteller', getter, setter, editable, required, 3) };
const INDEX = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('INDEX', 'index', getter, setter, editable, required, 3, 0) };
const I_MAX = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('I_MAX', 'iMax', getter, setter, editable, required, 1000, 1) };
const KAPAZITAT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('KAPAZITAT', 'kapazitat', getter, setter, editable, required, 3000, 1, 2) };
const KAUFDATUM = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new DateColumn('KAUFDATUM', 'kaufdatum', getter, setter, editable, required) };
const KESSELUBERDRUCK = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('KESSELUBERDRUCK', 'kesseluberdruck', getter, setter, editable, required, 3000, 0, 2) };
const KLASSE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('KLASSE', 'klasse', getter, setter, editable, required, 4, 0) };
const KOLBENHUB = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('KOLBENHUB', 'kolbenhub', getter, setter, editable, required, 3000, 1, 2) };
const LANGE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('LANGE', 'lange', getter, setter, editable, required, 50, 1, 2) };
const LEISTUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('LEISTUNG', 'leistung', getter, setter, editable, required, 10000, 0, 2) };
const MAXIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('MAXIMAL', 'maximal', getter, setter, editable, required, 30) };
const MINIMAL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('MINIMAL', 'minimal', getter, setter, editable, required, 30) };
const MITTELWAGEN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('MITTELWAGEN', 'mittelwagen', getter, setter, editable, required, 30, 0) };
const MOTORBAUART = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('MOTORBAUART', 'motorbauart', getter, setter, editable, required, 30) };
const NAMEN = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('NAMEN', 'name', getter, setter, editable, required, 30, '^[A-Z0-9.]+$') };
const POSITION = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('POSITION', 'position', getter, setter, editable, required, 30, 0) };
const PREIS = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('PREIS', 'preis', getter, setter, editable, required, noOpSetter, 0, 2) };
const PROGRAMMABLE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new BoolColumn('PROGRAMMABLE', 'programmable', getter, setter, editable, required) };
const REICHWEITE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('REICHWEITE', 'reichweite', getter, setter, editable, required, 3000, 0) };
const REIHE = (editable = Editable.ADD, required = true, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('REIHE', 'reihe', getter, setter, editable, required, 1, 0) };
const ROSTFLACHE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ROSTFLACHE', 'rostflache', getter, setter, editable, required, 3000, 0, 2) };
const SITZPLATZEKL1 = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('SITZPLATZE_KL1', 'sitzplatzeKL1', getter, setter, editable, required, 300, 0) };
const SITZPLATZEKL2 = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('SITZPLATZE_KL2', 'sitzplatzeKL2', getter, setter, editable, required, 300, 0) };
const SITZPLATZEKL3 = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('SITZPLATZE_KL3', 'sitzplatzeKL3', getter, setter, editable, required, 300, 0) };
const SITZPLATZEKL4 = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('SITZPLATZE_KL4', 'sitzplatzeKL4', getter, setter, editable, required, 300, 0) };
const SPAN = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('SPAN', 'span', getter, setter, editable, required, 16, 1) };
const STUCK = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('STUCK', 'stuck', getter, setter, editable, required, 300, 0) };
const TELEFON = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new PhoneColumn('TELEFON', 'telefon', getter, setter, editable, required) };
const TRIEBKOPF = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('TRIEBKOPFE', 'triebkopf', getter, setter, editable, required, 2, 0) };
const UBERHITZERFLACHE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('UBERHITZERFLACHE', 'uberhitzerflache', getter, setter, editable, required, 3000, 0, 2) };
const URL = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new URLColumn('URL', 'url', getter, setter, editable, required) };
const VERBLEIBENDE = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('VERBLEIBENDE', 'verbleibende', getter, setter, editable, required, 300, 0) };
const VERDAMPFUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) =>  { return new NumberColumn('VERDAMPFUNG', 'verdampfung', getter, setter, editable, required, 3000, 0, 2) };
const WASSERVORRAT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('WASSERVORRAT', 'wasservorrat', getter, setter, editable, required, 3000, 0, 2) };
const WERKSEINSTELLUNG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('WERKSEINSTELLUNG', 'werkseinstellung', getter, setter, editable, required, 65535, 1) };
const WERT = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('WERT', 'wert', getter, setter, editable, required, 65535, 1) };
const ZUG = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new TextColumn('ZUG', 'zug', getter, setter, editable, required, 30) };
const ZYLINDER = (editable = Editable.UPDATE, required = false, getter = fieldGetter, setter = fieldSetter) => { return new NumberColumn('ZYLINDER', 'zylinder', getter, setter, editable, required, 100, 1) };

const decoderCvBezeichnungGetter = (entity) => { return entity.bezeichnung; };
const decoderCvCvGetter = (entity) => { return entity.cv; };
const decoderCvWerkseinstellungGetter = (entity) => { return entity.werkseinstellung; };
const decoderFunktionFunktionGetter = (entity) => { return entity.bezeichnung; };
const decoderFunktionProgrammableGetter = (entity) => { return entity.programmable; };
const decoderFunktionReiheGetter = (entity) => { return entity.reihe; };
const decoderTypBezeichnungGetter = (entity) => { return entity.bezeichnung; };
const decoderTypIMaxGetter = (entity) => { return entity.iMax; };
const decoderTypKonfigurationGetter = (entity) => { return entity.konfiguration; };
const decoderTypSoundGetter = (entity) => { return entity.sound; };