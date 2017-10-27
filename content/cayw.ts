/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const bufferpack = require('bufferpack');
const getItemsAsync = require('./get-items-async.coffee');

const transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
// "https://github.com/zotero/zotero-libreoffice-integration/blob/master/components/zoteroOpenOfficeIntegration.js"
// https://kth.instructure.com/courses/11/pages/zotero-integration

class ScannableCiteMem {
  constructor(isLegal) {
    this.isLegal = isLegal;
    this.lst = [];
  }

  set(str, punc, slug) {
    if (!punc) { punc = ''; }
    if (str) {
      this.lst.push(str + punc);
    } else if (!this.isLegal) {
      this.lst.push(slug);
    }
  }

  setlaw(str, punc) {
    if (!punc) { punc = ''; }
    if (str && this.isLegal) { this.lst.push(str + punc); }
  }

  get() { return this.lst.join(' '); }
}

class CAYW {
  private host = '127.0.0.1';
  private port = 23116;
  private docID = 1;
  private fieldID = 2;
  
  private docData = `<data data-version=\"3\" zotero-version=\"5.0.18\">
    <session id=\"Z9Tp8PjG\"/>
    <style
      id=\"http://www.zotero.org/styles/chicago-note-bibliography\"
      locale=\"en-US\"
      hasBibliography=\"1\"
      bibliographyStyleHasBeenSet=\"0\"
    />
    <prefs>
      <pref name=\"fieldType\" value=\"Bookmark\"/>
      <pref name=\"automaticJournalAbbreviations\" value=\"true\"/>
      <pref name=\"noteType\" value=\"1\"/>
    </prefs>
  </data>`;
  
  private shortLocator = {
    article: "art.",
    chapter: "ch.",
    subchapter: "subch.",
    column: "col.",
    figure: "fig.",
    line: "l.",
    note: "n.",
    issue: "no.",
    opus: "op.",
    page: "p.",
    paragraph: "para.",
    subparagraph: "subpara.",
    part: "pt.",
    rule: "r.",
    section: "sec.",
    subsection: "subsec.",
    Section: "Sec.",
    'sub verbo': "sv.",
    schedule: "sch.",
    title: "tit.",
    verse: "vrs.",
    volume: "vol."
  }

  constructor(options) {
    this.options = options;
    this._ready = Zotero.Promise.defer();
    this.ready = this._ready.promise;

    if (!this.options.format) {
      this._ready.reject('no format');
      return;
    }

    if (this.options.format.startsWith('cite')) {
      this.options.command = this.options.format;
      this.options.format = 'latex';
    }

    if (!this[`$${this.options.format}`]) {
      this._ready.reject(`Unsupported format ${this.options.format}`);
      return;
    }

    this.options.format = this.options.format.replace(/-/g, '_');

    this.transport = transportService.createTransport(null, 0, this.host, this.port, null);
    this.outstream = transport.openOutputStream(Components.interfaces.nsITransport.OPEN_BLOCKING, 0, 0);

    this.stream = transport.openInputStream(0, 0, 0);
    this.instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    this.instream.init(this.stream);

    // var str = instream.read(4096);
    // var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    // var data = utf8Converter.convertURISpecToUTF8 (str, "UTF-8");


    this.session = 0;

    this.data = '';
    this.commands = 0;
    this.citation = [];

    this.send('addCitation');

    const pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(this.stream, -1, -1, 0, 0, false);
    pump.asyncRead(this, null);
  }

  onStartRequest() {}

  onStopRequest(request, context, status) { return this.close(); }

  onDataAvailable(request, context, inputStream, offset, count) {
    this.data += this.instream.read(count);

    if (!this.command()) { this.close(); }
  }

  command() {
    if (this.data.length < 8) { return true; }

    const [ session, length ] = Array.from(bufferpack.unpack('>II', this.data));
    if (this.data.length < (8 + length)) { return true; }

    this.commands++;

    if (this.closed || (this.commands > 10)) { return this.close("Runaway CAYW discussion with Zotero"); }

    const data = JSON.parse(this.data.substr(8, length));
    this.data = this.data.substr(8 + length);

    this.session = session;

    return this[`_${data[0]}`].apply(this, data[1]);
  }

  close(err) {
    if (this.closed) { return; }

    this.instream.close();
    this.outstream.close();

    if (err) {
      this._ready.reject(err);
    } else {
      for (let citation of this.citations) {
        citation.citekey = KeyManager.get(citation.id);
      }
      Zotero.Promise.resolve(this[`$${this.options.format}`]()).then(function(v) { return this._ready.resolve(v); }).catch(function(err) { return this._ready.reject(err); });
    }

    this.closed = true;
  }

  send(payload) {
    payload = JSON.stringify(payload);
    payload = bufferpack.pack('>II', [this.session, payload.length]).toString() + payload;
    this.outstream.write(payload, payload.length);
    return true;
  }

  _Application_getActiveDocument(protocolVersion) { return this.send([protocolVersion, this.docID]); }

  _Document_getDocumentData(documentID) { return this.send(this.docData); }

  _Document_setDocumentData(documentID, dataString) { return this.send(null); }

  _Document_canInsertField(documentID) { return this.send(true); }

  _Document_cursorInField(documentID, fieldType) { return this.send(null); }

  _Document_insertField(documentID, fieldType, noteType) { return this.send([this.fieldID, '', 0]); }

  _Field_setCode(documentID, fieldID, code) {
    let m;
    if (m = code.match(/^ITEM CSL_CITATION ({.*})/)) {
      this.citation = JSON.parse(m[1]).citationItems;
      this.fieldCode = null;
    } else {
      this.fieldCode = code;
    }
    return this.send(null);
  }

  _Document_getFields(documentID, fieldType) { return this.send([[this.fieldID],[this.fieldCode],[0]]); }

  _Field_setText(documentID, fieldID, text, isRTF) { return this.send(null); }

  _Field_getText(documentID, fieldID) { return this.send(`[${this.fieldID}]`); }

  _Document_activate(documentID) { return this.send(null); }

  _Document_complete(documentID) {
    this.send(null);
    return false; // will close the connection
  }

  _Field_delete(documentID, fieldID) { return this.send(null); }

  getStyle(id = 'apa') {
    let style = Zotero.Styles.get(`http://www.zotero.org/styles/${id}`);
    if (!style) { style = Zotero.Styles.get(`http://juris-m.github.io/styles/${id}`); }
    if (!style) { style = Zotero.Styles.get(id); }
    return style;
  }

  $latex() {
    if (!this.citation.length) { return ''; }
    if (!this.options.command) { this.options.command = 'cite'; }

    const state = this.citations.reduce((function(acc, cit) {
      for (let k in acc) {
        if (cit[k]) { acc[k]++; }
      }
    }), { prefix: 0, suffix: 0, 'suppress-author': 0, locator: 0, label: 0 });

    if ((this.citations.length > 1) && (state.suffix === 0) && (state.prefix === 0) && (state.locator === 0) && [0, this.citations.length].includes(state['suppress-author'])) {
      /* simple case where everything can be put in a single cite */
      return `\\${this.citations[0]['suppress-author'] ? 'citeyear' : this.options.command}{${this.citations.map(citation => citation.citekey).join(',')}}`;
    }

    let formatted = '';
    for (let citation of this.citations) {
      var label;
      formatted += "\\";
      formatted += citation['suppress-author'] ? 'citeyear' : this.options.command;
      if (citation.prefix) { formatted += `[${citation.prefix}]`; }

      if (citation.locator && citation.suffix) {
        label = citation.label === 'page' ? '' : this.shortLocator[citation.label] + ' ';
        formatted += `[${label}${citation.locator}, ${citation.suffix}]`;
      } else if (citation.locator) {
        label = citation.label === 'page' ? '' : this.shortLocator[citation.label] + ' ';
        formatted += `[${label}${citation.locator}]`;
      } else if (citation.suffix) {
        formatted += `[${citation.suffix}]`;
      } else if (citation.prefix) {
        formatted += '[]';
      }
      formatted += `{${citation.citekey}}`;
    }

    return formatted;
  }

  $mmd() {
    const formatted = [];
    for (let citation of this.citations) {
      if (citation.prefix) {
        formatted.push(`[${citation.prefix}][#${citation.citekey}]`);
      } else {
        formatted.push(`[#${citation.citekey}][]`);
      }
    }
    return formatted.join('');
  }

  $pandoc() {
    let formatted = [];
    for (let citation of this.citations) {
      let cite = '';
      if (citation.prefix) { cite += `${citation.prefix} `; }
      if (citation['suppress-author']) { cite += '-'; }
      cite += `@${citation.citekey}`;
      if (citation.locator) { cite += `, ${this.shortLocator[citation.label]} ${citation.locator}`; }
      if (citation.suffix) { cite += ` ${citation.suffix}`; }
      formatted.push(cite);
    }
    formatted = formatted.join('; ');
    if (this.options.brackets) { formatted = `[${formatted}]`; }
    return formatted;
  }

  $asciidoctor_bibtex() {
    let cite;
    let formatted = [];
    for (let citation of this.citations) {
      cite = citation.citekey;
      if (citation.locator) {
        let label = citation.locator;
        if (citation.label !== 'page') { label = this.shortLocator[citation.label] + ' ' + label; }
        cite += `(${label})`;
      }
      formatted.push(cite);
    }
    formatted = formatted.join(', ');
    formatted = (this.options.cite || 'cite') + ':[' + formatted + ']';
    return formatted;
  }

  // async
  *$scannable_cite() {
    const formatted = [];
    for (let citation of this.citations) {
      var id, needle;
      const item = yield getItemsAsync(citation.id);
      const isLegal = (needle = Zotero.ItemTypes.getName(item.itemTypeID), [ 'bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty' ].includes(needle));

      const key = Prefs.get('testing') ? 'ITEMKEY' : item.key;

      if (item.libraryID) {
        id = `zg:${item.libraryID}:${key}`;
      } else if (Zotero.userID) {
        id = `zu:${Zotero.userID}:${key}`;
      } else {
        id = `zu:0:${key}`;
      }

      const locator = citation.locator ? `${this.shortLocator[citation.label]} ${citation.locator}` : '';
      if (!citation.prefix) { citation.prefix = ''; }
      if (!citation.suffix) { citation.suffix = ''; }

      const title = new ScannableCiteMem(isLegal);
      title.set(item.firstCreator, ',', 'anon.');

      let includeTitle = false;
      /* Prefs.get throws an error if the pref is not found */
      try {
        includeTitle = Zotero.Prefs.get('translators.ODFScan.includeTitle');
      } catch (error) {}
      if (includeTitle || !item.firstCreator) {
        title.set(item.getField('shortTitle') || item.getField('title'), ',', '(no title)');
      }

      try {
        title.setlaw(item.getField('authority'), ',');
      } catch (error1) {}
      try {
        title.setlaw(item.getField('volume'));
      } catch (error2) {}
      try {
        title.setlaw(item.getField('reporter'));
      } catch (error3) {}
      title.setlaw(item.getField('pages'));

      const year = new ScannableCiteMem(isLegal);
      try {
        year.setlaw(item.getField('court'), ',');
      } catch (error4) {}
      const date = Zotero.Date.strToDate(item.getField('date'));
      year.set((date.year ? date.year : item.getField('date')), '', 'no date');

      let label = (title.get() + ' ' + year.get()).trim();
      if (citation['suppress-author']) { label = `-${label}`; }

      formatted.push(`{${citation.prefix}|${label}|${locator}|${citation.suffix}|${id}}`);
    }
    return formatted.join('');
  }

  $atom_zotero_citations() {
    const citekeys = this.citations.map(citation => citation.citekey);
    const itemIDs = this.citations.map(citation => citation.id);

    const style = this.getStyle(this.options.style);

    const cp = style.getCiteProc();
    cp.setOutputFormat('markdown');
    cp.updateItems(itemIDs);
    const label = cp.appendCitationCluster({citationItems: itemIDs.map(id => ({ id })), properties: {}}, true)[0][1];

    if (citekeys.length === 1) {
      return `[${label}](#@${citekeys.join(',')})`;
    } else {
      return `[${label}](?@${citekeys.join(',')})`;
    }
  }

  // async
  *$translate() {
    let needle, needle1;
    const items = yield getItemsAsync(this.citations.map(citation => citation.id));

    if ((this.options.translator || 'biblatex') === 'biblatex') { this.options.translator = 'BetterBibLeTeX'; }
    if (Translators.byLabel[this.options.translator]) { this.options.translator = Translators.byLabel[this.options.translator].translatorID; }

    const exportOptions = {
      exportNotes: (needle = (this.options.exportNotes || '').toLowerCase(), ['yes', 'y', 'true'].includes(needle)),
      useJournalAbbreviation: (needle1 = (this.options.useJournalAbbreviation || '').toLowerCase(), ['yes', 'y', 'true'].includes(needle1))
    };

    return yield Translators.translate(this.options.translator, {items}, exportOptions);
  }
}
CAYW.initClass();

Zotero.Server.Endpoints['/better-bibtex/cayw'] = (function() {
  const Cls = class {
    static initClass() {
      this.prototype.supportedMethods = ['GET'];
    }

    // async
    *init(options) {
      if (options.query.probe) { return [200, 'text/plain', 'ready']; }

      try {
        return [200, 'text/plain', (yield (new CAYW(options)).ready)];
      } catch (error) {
        return [500, "application/text", `debug-bridge failed: ${err}\n${err.stack}`];
      }
    }
  };
  Cls.initClass();
  return Cls;
})();

//=======
//function main()
//{
//  var host = "192.168.1.2";
//  var port = 9999;
//  var delay = new Array();
//  var lung_pkt = 288;
//  var num_pkg = 100;
//  var num_str = 12;
//  var nPkg = 0;
//
//  try {
//    window.open("http://"+host+"/socket_server.php","Socket","width=500,height=400");
//
//    var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
//    var transport = transportService.createTransport(null, 0,host,port,null);
//
//    var stream = transport.openInputStream(0,0,0);
//    var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
//    instream.init(stream);
//
//    var dataListener = {
//      onStartRequest: function(request, context){},
//      onStopRequest: function(request, context, status) {
//        instream.close();
//        outstream.close();
//        var stampa="";
//        var i=0;
//        for(i=0; i<delay.length; i++) {
//          stampa+=(delay[i].toString()+"\n");
//        }
//        alert(stampa);
//
//      },
//      onDataAvailable: function(request, context, inputStream, offset, count) {
//        var ora = new Date();
//        var partenza = parseInt(instream.read(lung_pkt).substring(0,13));
//        var arrivo = ora.getTime();
//        var d = arrivo - partenza;
//        delay.push(d);
//      },
//    };
//
//    var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
//    pump.init(stream, -1, -1, 0, 0, false);
//    pump.asyncRead(dataListener,null);
//  } catch (ex){
//    alert(ex);
//  }
//  return null;
//}
//
//====
