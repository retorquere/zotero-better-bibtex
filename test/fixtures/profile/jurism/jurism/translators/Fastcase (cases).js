{
	"translatorID": "bb3cdc98-300e-4c66-a3d3-63ba6a87bf01",
	"label": "Fastcase (cases)",
	"creator": "Frank Bennett",
	"target": "https?://apps.fastcase.com/Research/Pages/(?:Document|Results).aspx?.*LTID=",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-07-27 08:04:04"
}

var staterex = /(?:^|.*\s+)(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|west virginia|virginia|washington|wisconsin|wyoming)[.,]*(?:$|\s+.*)/i;

var statemap = {
    "alabama": "us;al",
    "alaska": "us;ak",
    "arizona": "us;az",
    "arkansas": "us;ar",
    "california": "us;ca",
    "colorado": "us;co",
    "connecticut": "us;ct",
    "delaware": "us;de",
    "florida": "us;fl",
    "georgia": "us;ga",
    "hawaii": "us;hi",
    "idaho": "us;id",
    "illinois": "us;il",
    "indiana": "us;in",
    "iowa": "us;ia",
    "kansas": "us;ks",
    "kentucky": "us;ky",
    "louisiana": "us;la",
    "maine": "us;me",
    "maryland": "us;md",
    "massachusetts": "us;ma",
    "michigan": "us;mi",
    "minnesota": "us;mn",
    "mississippi": "us;ms",
    "missouri": "us;mo",
    "montana": "us;mt",
    "nebraska": "us;ne",
    "nevada": "us;nv",
    "new hampshire": "us;nh",
    "new jersey": "us;nj",
    "new mexico": "us;nm",
    "new york": "us;ny",
    "north carolina": "us;nc",
    "north dakota": "us;nd",
    "ohio": "us;oh",
    "oklahoma": "us;ok",
    "oregon": "us;or",
    "pennsylvania": "us;pa",
    "rhode island": "us;ri",
    "south carolina": "us;sc",
    "south dakota": "us;sd",
    "tennessee": "us;tn",
    "texas": "us;tx",
    "utah": "us;ut",
    "vermont": "us;vt",
    "virginia": "us;va",
    "washington": "us;wa",
    "west virginia": "us;wv",
    "wisconsin": "us;wi",
    "wyoming": "us;wy"
}

var fedrex = /.*?(C.A.11|C.A.10|C.A.2|C.A.3|C.A.4|C.A.5|C.A.6|C.A.7|C.A.8|C.A.9|C.A.1|D.PuertoRico|S.D.Miss.|W.D.Wash.|E.D.Okla.|W.D.Mich.|M.D.Tenn.|E.D.Wash.|S.D.W.Va.|E.D.Tenn.|N.D.Okla.|N.D.W.Va.|N.D.Miss.|E.D.Mich.|W.D.Okla.|W.D.Tenn.|W.D.Wis.|S.D.Ala.|E.D.N.Y.|W.D.N.Y.|W.D.Ark.|N.D.Tex.|N.D.Ohio|S.D.Ill.|N.D.Ala.|E.D.Ark.|S.D.Tex.|M.D.Fla.|S.D.Fla.|10thCir.|S.D.Ind.|D.Alaska|S.D.Cal.|W.D.N.C.|N.D.Ind.|N.D.Iowa|E.D.N.C.|S.D.Iowa|M.D.N.C.|N.D.Fla.|E.D.Wis.|E.D.Tex.|E.D.Cal.|M.D.Ala.|N.D.Cal.|N.D.N.Y.|C.D.Ill.|N.D.Ill.|11thCir.|W.D.Tex.|C.D.Cal.|S.D.Ohio|S.D.N.Y.|5thCir.|M.D.Ga.|D.Conn.|W.D.Mo.|7thCir.|D.Colo.|E.D.Va.|1stCir.|E.D.Pa.|E.D.Ky.|E.D.La.|E.D.Mo.|N.D.Ga.|D.Mont.|D.Ariz.|D.Idaho|6thCir.|M.D.Pa.|9thCir.|4thCir.|8thCir.|W.D.La.|W.D.Pa.|W.D.Va.|M.D.La.|S.D.Ga.|D.Minn.|W.D.Ky.|D.Mass.|D.S.D.|D.S.C.|D.N.D.|D.N.H.|D.D.C.|D.N.M.|D.Kan.|D.Del.|D.Haw.|D.R.I.|3dCir.|D.Wyo.|D.Neb.|D.N.J.|D.Nev.|2dCir.|D.Utah|D.Vt.|D.Me.|D.Md.|D.Or.|U.S.).*/;

var fedmap = {
  "C.A.1": "us;federal;1-cir", 
  "C.A.2": "us;federal;2-cir", 
  "C.A.3": "us;federal;3-cir", 
  "C.A.4": "us;federal;4-cir", 
  "C.A.5": "us;federal;5-cir", 
  "C.A.6": "us;federal;6-cir", 
  "C.A.7": "us;federal;7-cir", 
  "C.A.8": "us;federal;8-cir", 
  "C.A.9": "us;federal;9-cir", 
  "C.A.10": "us;federal;10-cir", 
  "C.A.11": "us;federal;11-cir", 
  "N.D.Ga.": "us;federal;ga.northern", 
  "W.D.Mich.": "us;federal;mi.western", 
  "D.Me.": "us;federal;me", 
  "W.D.Tenn.": "us;federal;tn.western", 
  "S.D.Ohio": "us;federal;oh.southern", 
  "D.S.C.": "us;federal;sc", 
  "S.D.Ill.": "us;federal;il.southern", 
  "S.D.Fla.": "us;federal;fl.southern", 
  "E.D.N.Y.": "us;federal;ny.eastern", 
  "S.D.W.Va.": "us;federal;wv.southern", 
  "N.D.Ala.": "us;federal;al.northern", 
  "D.S.D.": "us;federal;sd", 
  "D.N.H.": "us;federal;nh", 
  "D.Kan.": "us;federal;ks", 
  "D.Md.": "us;federal;md", 
  "D.Del.": "us;federal;de", 
  "E.D.La.": "us;federal;la.eastern", 
  "M.D.Ga.": "us;federal;ga.middle", 
  "E.D.Mich.": "us;federal;mi.eastern", 
  "D.Utah": "us;federal;ut", 
  "N.D.Tex.": "us;federal;tx.northern", 
  "S.D.N.Y.": "us;federal;ny.southern", 
  "5thCir.": "us;federal;5-cir", 
  "W.D.Pa.": "us;federal;pa.western", 
  "W.D.Tex.": "us;federal;tx.western", 
  "D.PuertoRico": "us;federal;pr", 
  "N.D.Iowa": "us;federal;ia.northern", 
  "E.D.Wash.": "us;federal;wa.eastern", 
  "W.D.Ky.": "us;federal;ky.western", 
  "N.D.Okla.": "us;federal;ok.northern", 
  "3dCir.": "us;federal;3-cir", 
  "M.D.La.": "us;federal;la.middle", 
  "D.R.I.": "us;federal;ri", 
  "S.D.Ala.": "us;federal;al.southern", 
  "2dCir.": "us;federal;2-cir", 
  "S.D.Ga.": "us;federal;ga.southern", 
  "D.Conn.": "us;federal;ct", 
  "10thCir.": "us;federal;10-cir", 
  "U.S.": "us", 
  "E.D.Ky.": "us;federal;ky.eastern", 
  "W.D.N.C.": "us;federal;nc.western", 
  "W.D.Va.": "us;federal;va.western", 
  "S.D.Ind.": "us;federal;in.southern", 
  "9thCir.": "us;federal;9-cir", 
  "E.D.N.C.": "us;federal;nc.eastern", 
  "S.D.Cal.": "us;federal;ca.southern", 
  "D.Minn.": "us;federal;mn", 
  "N.D.N.Y.": "us;federal;ny.northern", 
  "D.Neb.": "us;federal;ne", 
  "W.D.N.Y.": "us;federal;ny.western", 
  "S.D.Iowa": "us;federal;ia.southern", 
  "1stCir.": "us;federal;1-cir", 
  "W.D.Wash.": "us;federal;wa.western", 
  "D.Alaska": "us;federal;ak", 
  "4thCir.": "us;federal;4-cir", 
  "6thCir.": "us;federal;6-cir", 
  "D.Idaho": "us;federal;id", 
  "D.Wyo.": "us;federal;wy", 
  "M.D.N.C.": "us;federal;nc.middle", 
  "N.D.Ill.": "us;federal;il.northern", 
  "8thCir.": "us;federal;8-cir", 
  "N.D.Miss.": "us;federal;ms.northern", 
  "E.D.Tex.": "us;federal;tx.eastern", 
  "E.D.Va.": "us;federal;va.eastern", 
  "S.D.Miss.": "us;federal;ms.southern", 
  "D.N.D.": "us;federal;nd", 
  "E.D.Tenn.": "us;federal;tn.eastern", 
  "D.N.M.": "us;federal;nm", 
  "D.Mont.": "us;federal;mt", 
  "N.D.Ohio": "us;federal;oh.northern", 
  "E.D.Mo.": "us;federal;mo.eastern", 
  "W.D.Okla.": "us;federal;ok.western", 
  "D.Colo.": "us;federal;co", 
  "C.D.Ill.": "us;federal;il.central", 
  "D.Or.": "us;federal;or", 
  "E.D.Okla.": "us;federal;ok.eastern", 
  "D.D.C.": "us;federal;dc", 
  "N.D.Fla.": "us;federal;fl.northern", 
  "W.D.Mo.": "us;federal;mo.western", 
  "M.D.Pa.": "us;federal;pa.middle", 
  "D.Haw.": "us;federal;hi", 
  "D.Nev.": "us;federal;nv", 
  "N.D.Cal.": "us;federal;ca.northern", 
  "E.D.Cal.": "us;federal;ca.eastern", 
  "W.D.Wis.": "us;federal;wi.western", 
  "W.D.Ark.": "us;federal;ar.western", 
  "7thCir.": "us;federal;7-cir", 
  "M.D.Tenn.": "us;federal;tn.middle", 
  "D.Vt.": "us;federal;vt", 
  "N.D.W.Va.": "us;federal;wv.northern", 
  "D.N.J.": "us;federal;nj", 
  "M.D.Ala.": "us;federal;al.middle", 
  "D.Ariz.": "us;federal;az", 
  "D.Mass.": "us;federal;ma", 
  "S.D.Tex.": "us;federal;tx.southern", 
  "E.D.Pa.": "us;federal;pa.eastern", 
  "11thCir.": "us;federal;11-cir", 
  "N.D.Ind.": "us;federal;in.northern", 
  "E.D.Wis.": "us;federal;wi.eastern", 
  "E.D.Ark.": "us;federal;ar.eastern", 
  "W.D.La.": "us;federal;la.western", 
  "M.D.Fla.": "us;federal;fl.middle", 
  "C.D.Cal.": "us;federal;ca.central"
}

var daterex = /.*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*\s+([0-9]{1,2}|term),*\s+([0-9]{4})(?:[^0-9]|$)/i;
var daterexstrict = /^\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*\s+([0-9]{1,2}|term),*\s+([0-9]{4})\.?\s*$/i;

/*
 * Top of the parsing engine
 */
var Engine = function (doc, url) {
    this.doc = doc;
    this.fields = {url:url};
    this.cites = [];
    this.items = [];
    var citation = doc.getElementById("ViewDocumentCitationHdr1_lblCitation");
    if (citation) {
        this.citation = citation.textContent;
        this.getCaseName();
        this.dropNestedParensFromCitation();
        this.tryForSubordinateFederalJurisdiction();
        this.getHeader();
        this.getDecisionDate();
        this.getCourtName();
        this.getJurisdictionFromCourt();
        this.cleanUpCourtName();
        this.getCites();

        // Fix up orthodox vendor neutral cites
        this.fixOhioVendorNeutral();
        this.fixSouthDakotaVendorNeutral();
        this.fixGeneralVendorNeutral();

        this.purgeCaseNameFromHeader();

        this.getDocketNumber();

        // Get vendor neutral cites that use docketNumber
        this.getLouisianaVendorNeutral();
        this.getMississippiVendorNeutral();
        this.getNewMexicoVendorNeutral();

        this.reverseCites();
    }
}

/* 
 * Utility functions
 */
Engine.prototype.onOrAfter = function(datestr) {
    if (this.fields.dateDecided) {
        var casedate = new Date(this.fields.dateDecided.replace("-","/","g"));
        var startdate = new Date(datestr.replace("-","/","g"));
        if (casedate >= startdate) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

Engine.prototype.fixTextCase = function(str) {
    var skips = ["but", "or", "yet", "so", "for", "and", "nor", "a", "an", "the", "at", "by", "from", "in", "into", "of", "on", "to", "with", "up", "down", "as", "via", "onto", "over","v","v."];
    if (str) {
        var lst = str.split(/\s+/);
        lst[0] = lst[0].slice(0,1).toUpperCase() + lst[0].slice(1).toLowerCase();
        for (var i=1,ilen=lst.length;i<ilen;i+=1) {
            if (skips.indexOf(lst[i].toLowerCase()) > -1) {
                lst[i] = lst[i].toLowerCase();
            } else {
                lst[i] = lst[i].slice(0,1).toUpperCase() + lst[i].slice(1).toLowerCase();
            }
        }
        str = lst.join(" ");
    }
    return str;
}

/* 
 * General parsing methods called from the master parse function
*/
Engine.prototype.getCaseName = function() {
	this.fields.caseName = this.citation.replace(/(.*?)(?:,\s+[0-9]+\s+[^,]+?\s+[0-9]+|\s+\().*/,"$1");
}

Engine.prototype.dropNestedParensFromCitation = function() {
    var lst = this.citation.split("");
    var lev = 0;
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        if (lst[i] === "(") {
            if (lev) {
                lst[i] = " ";
            }
            lev += 1;
        } else if (lst[i] === ")") {
            lev += -1;
            if (lev) {
                lst[i] = " ";
            }
        }
    }
    this.citation = lst.join("");
}

Engine.prototype.tryForSubordinateFederalJurisdiction = function() {
	var caseTrailer = this.citation.replace(/.*\((.*?),*(?:\s+[0-9]{4}\s*\).*).*/,"$1");
    if (caseTrailer !== this.citation) {
        caseTrailer = caseTrailer.replace(/([23])rd/g, "$1d");
        caseTrailer = caseTrailer.replace(" ","", "g");
        var m = caseTrailer.match(fedrex);
        if (m) {
            this.fields.jurisdiction = fedmap[m[1]];
        }
    }
}

Engine.prototype.getHeader = function() {
    var blocks = this.doc.getElementsByTagName("center");
    var str;
    var lst = [];
    for (var i=0,ilen=blocks.length;i<ilen;i+=1) {
        lst.push(blocks[i].innerHTML);
    }
    str = lst.join("\n");
    str = str.replace(/<\/*(?:center|br|p)(?:[^>\/]+|\/|)>/g,"\n");
    str = str.replace(/<[^>]*>/g,"");
    lst = str.split("\n");
    for (var i=lst.length-1;i>-1;i+=-1) {
        if (lst[i]) {
            lst[i] = lst[i].replace(/^\s*$/);
        }
        if (!lst[i]) {
            lst = lst.slice(0,i).concat(lst.slice(i+1));
        }
    }
    this.header = lst;
}

Engine.prototype.getDecisionDate = function() {
    var monthnames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    var lst = this.header;
    // TODO: use bare cite in preference to prefixed entries
    for (var i=lst.length-1;i>-1;i+=-1) {
        var m = lst[i].match(daterex);
        if (m) {
            var monthname = m[1].toLowerCase();
            month = (monthnames.indexOf(monthname) + 1);
            if (m[2].toLowerCase() === "term") {
                day = "1";
            } else {
                day = m[2];
            }
            while (day.length < 2) {
                day = "0" + day;
            }
            year = m[3];
            this.fields.dateDecided = year + "-" + month + "-" + day;
            if (lst[i].replace(/^\s*(?:filed|decided|dated)[:.]?\s+/i,"").match(daterexstrict)) {
                lst = lst.slice(0,i);
                break;
            }
            lst = lst.slice(0,i);
        }
    }
    this.header = lst;
}

Engine.prototype.getCourtName = function() {
    var court = [];
    var lst = this.header;
    for (var i=lst.length-1;i>-1;i+=-1) {
        if (!lst[i].match(daterex)) {
            court.push(lst[i]);
        }
        if (lst[i].match(/(?:court|panel)/i)) {
            lst = lst.slice(0,i);
            court.reverse();
            court = court.join(", ");
            break;
        }
    }
    // kinda crappy here
    if (typeof court === "object") {
        court = "";
    }
    this.header = lst;
    this.fields.court = court;
}

Engine.prototype.getJurisdictionFromCourt = function() {
    if (!this.fields.jurisdiction) {
        var m = this.fields.court.match(/united states/i);
        if (m) {
            this.fields.jurisdiction = "us";
        }
    }
    if (!this.fields.jurisdiction) {
        // If jurisdiction is not US, try for a state
        var m = this.fields.court.match(staterex);
        if (m) {
            this.fields.jurisdiction = statemap[m[1].toLowerCase()];
        }
    }
    // Fallback
    if (!this.fields.jurisdiction) {
        this.fields.jurisdiction = "us";
    }
}


Engine.prototype.cleanUpCourtName = function() {
    var court = this.fields.court.replace(/(?:(the\s+)*state of|(the\s+)united states)\s*\s+/ig,"");
    var lst = court.split(/,\s*/);
    for (var i=lst.length-1;i>-1;i+=-1) {
        if (lst[i].match(/.*(?:court|panel|circuit|district).*/i)) {
            lst = lst.slice(0,i+1);
            break;
        }
    }
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        lst[i] = this.fixTextCase(lst[i]);
    }
    court = lst.join("|").replace(/\s*\.\s*$/g,"");
    this.fields.court = court;
}

Engine.prototype.getCites = function() {
    var lst = this.header;
    for (var i=lst.length-1;i>-1;i+=-1) {
        var hit = false;
        // Pick up New Mexico vendor neutral cites here
        if (this.fields.jurisdiction.slice(0,5) === "us;nm") {
            var m = lst[i].match(/^.*?([0-9]+)-(NMCA|MCA|NMSC|NMCERT|NM[A-Z])-([0-9]+)\s*$/);
            if (m) {
                this.cites.push( { neutral:true, volume:m[1], page:m[3] } );
                this.fields.extra = "Court code: " + m[2];
                lst = lst.slice(0,i).concat(lst.slice(i+1));
                continue;
            }
        }
        var sublst = lst[i].replace(/^\s*(.*?)\s*$/,"$1").split(/\s*,\s*/);
        for (var j=0,jlen=sublst.length;j<jlen;j+=1) {
            var m = sublst[j].match(/^([0-9]+)\s+(.*?)\s+([0-9]+)$/);
            if (m) {
                this.cites.push( { volume:m[1], reporter:m[2], page:m[3] } );
                hit = true;
            }
        }
        if (hit) {
            lst = lst.slice(0,i).concat(lst.slice(i+1));
        }
    }
    this.header = lst;
}

Engine.prototype.reverseCites = function() {
    this.cites.reverse();
}

Engine.prototype.purgeCaseNameFromHeader = function() {
    var lst = this.header;
    var dropidx = false;
    // This will leave behind cruft, where there are multiple
    // lines in a case name.
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        if (lst[i].match(/^\s*v\.\s*$/i)) {
            dropidx = [(i+1),i,(i-1)];
        } else if (lst[i].match(/.*\s+v\.\s+.*/)) {
            dropidx = [i]
        }
    }
    if (dropidx) {
        for (var i=0,ilen=dropidx.length;i<ilen;i+=1) {
            lst = lst.slice(0,dropidx[i]).concat(lst.slice(dropidx[i]+1));
        }
    }
    this.header = lst;
}

Engine.prototype.getDocketNumber = function(multipleOK) {
    var candidates = [];
    var numbers = [];
    var lst = this.header;
    for (var i=lst.length-1;i>-1;i+=-1) {
        // This could throw false positives. We'll see how it goes.
        //
        // We look for the best docket number, accepting multiples only
        // under a set of narrow-ish conditions.
        //
        // We strip bare "No." and "Nos." and "Number" from the start of the strings,
        // since it contributes no information.
        lst[i] = lst[i].replace(/^\s*(?:no|nos|number)[:.]\s+/i,"");
        // Normalize en-dash to hyphen
        lst[i] = lst[i].replace("–","-","g");
        // Normalize double-hyphen to hyphen
        lst[i] = lst[i].replace("--","-","g");
        // Test for terminal string with no spaces that contains at least one number 
        if (lst[i].match(/.*[0-9][^ ]*$/)) {
            var docketNumber = lst[i].replace(/\s*\.\s*$/g,"");
            candidates.push(docketNumber);
        } else {
            break;
        }
    }
    // We then accept everything that is a bare number, with no
    // "no." label showing before the number itself.
    for (var i=0,ilen=candidates.length;i<ilen;i+=1) {
        if (!candidates[i].match(/.*?(?:no|number|nos)[:.]\s+/i)) {
            numbers.push(candidates[i]);
        }
    }
    // If we didn't get anything on the first pass, we accept
    // the top-listed number only.
    if (!numbers.length && candidates.length) {
        numbers.push(candidates.slice(-1)[0]);
    }
    // Finally, clean up some lurking cruft
    // This may lose information, but the numbers themselves
    // will not be affected.
    for (var i=0,ilen=numbers.length;i<ilen;i+=1) {
        numbers[i] = numbers[i].replace(/^.*?(?:no|number|nos)[:.]\s+/i,"");
    }
    numbers.reverse();
    this.fields.docketNumber = numbers.join("; ");
}

/*
 * Functions for vendor-neutral cites
 *
 * There are seventeen of 'em, most turn up as normal cites, some need
 * special handling.  See the master function above for the order and
 * position of invocation. Note that handling for one jurisdiction
 * (New Mexico) is embedded in the getCites() function.
 */
Engine.prototype.getLouisianaVendorNeutral = function() {
    // Louisiana: from July 1, 1994, docketNumber and full date as mm/dd/yy in yearAsVolume NOT IN HEADER.
    if (this.fields.jurisdiction.slice(0,5) === "us;la" && this.fields.docketNumber) {
        if (this.onOrAfter("1994/07/01")) {
            var newlst = [];
            var lst = this.fields.dateDecided.split(/[-\/]/);
            for (var i=0,ilen=lst.length;i<ilen;i+=1) {
                lst[i] = lst[i].replace(/^[0]+/,"");
            }
            lst[0] = lst[0].slice(2,4);
            newlst = [lst[1], lst[2], lst[0]];
            var datestr = newlst.join("/");
            var cite = {neutral: true,volume:datestr}
            this.cites.push(cite);
        }
    }
}

Engine.prototype.getMississippiVendorNeutral = function() {
    // Mississipi: from July 1, 1997, case numbers (possibly multiples in a single judgement) ARE the neutral citation format.
    //   ** For MLZ, split off first segment delimited by "-" and store in yearAsVolume, the remainder in page.
    if (this.fields.jurisdiction.slice(0,5) === "us;ms" && this.fields.docketNumber) {
        if (this.onOrAfter("1997/07/01")) {
            var numbers = this.fields.docketNumber.split("; ");
            for (var i=0,ilen=numbers.length;i<ilen;i+=1) {
                var idx = numbers[i].indexOf("-");
                if (idx) {
                    var volume = numbers[i].slice(0,idx);
                    var page = numbers[i].slice(i+1);
                    var cite = { neutral:true, volume:volume, page: page };
                    this.cites.push(cite);
                }
            }
        }
    }
}

Engine.prototype.getNewMexicoVendorNeutral = function() {
    // New Mexico: extract from header stripping "Opinion Number:" etc. Normalize "MCA" to "NMCA" and "MSC" to "NMSC", split on "-" to volume and page.
    //   ** Patterns are: NM, NMSC, NMCA, NMCERT
    //   ** From August 15, 2005
    //   ** For MLZ, split off first segment delimited by "-" and store in yearAsVolume, the remainder in page.
    
    // New Mexico vendor neutral cites are handled in getCites()
}

Engine.prototype.fixOhioVendorNeutral = function() {
    // Ohio: from May 1, 2002, "Ohio" cites are neutral. In header.
    if (this.fields.jurisdiction.slice(0,5) === "us;oh") {
        if (this.onOrAfter("2002/05/01")) {
            for (var i=0,ilen=this.cites.length;i<ilen;i+=1) {
                if (this.cites[i].reporter === "Ohio") {
                    this.cites[i].neutral = true;
                    this.cites[i].reporter = false;
                }
            }
        }
    }
}

Engine.prototype.fixSouthDakotaVendorNeutral = function() {
    // South Dakota: matching neutralrex. In header. EXCEPTION: S.D. is South Dakota Reporter up to 1976.
    // (Umberger does not mention, not sure when South Dakota series starts. By CourtListener constants.py,
    // print version of S.D. runs to 1976.)
    if (this.fields.jurisdiction.slice(0,5) === "us;sd") {
        if (this.onOrAfter("1994/01/01")) {
            for (var i=0,ilen=this.cites.length;i<ilen;i+=1) {
                if (this.cites[i].reporter.match(/^(?:S\.D\. App\.|S\.D\.|SD App|SD)$/)) {
                    this.cites[i].neutral = true;
                    this.cites[i].reporter = false;
                }
            }
        }
    }
}

Engine.prototype.fixGeneralVendorNeutral = function() {
    // Oklahoma: matching neutralrex. In header.
    // North Dakota: matching neutralrex. In header.
    // Arkansas: matching neutralrex. In header.
    // Illinois: matching neutralrex. In header.
    // Colorado: matching neutralrex. In header.
    // Montana: matching neutralrex. In header.
    // Wyoming: matching neutralrex. In header.
    // Utah: matching neutralrex. In header.
    // Wisconsin: matching neutralrex. In header.
    // Pennsylvania: matching neutralrex. In header.
    // Vermont: matching neutralrex. In header.
    // Maine: matching neutralrex. In header.
    var neutralrex = /^\s*(?:OK CIV APP|OK CR|OK|ND App|ND|Ark\. App\.|Ark\.|IL App(?: \([0-9]+(?:st|nd|d|th)\))*|IL|COA|CO|MT|WY|UT|UT App|WI App|WI|PA Super|PA|VT|ME)\s*$/;
    var jurisdiction = this.fields.jurisdiction.slice(0,5);
    if (["us;ok","us;nd","us;ar","us;il","us;co","us;mt","us;wy","us;ut","us;wi","us;pa","us;vt","us;me"].indexOf(jurisdiction) > -1) {
        // Use a rough cut-off for these.
        if (this.onOrAfter("1994/01/01")) {
            for (var i=0,ilen=this.cites.length;i<ilen;i+=1) {
                if (this.cites[i].reporter.match(neutralrex)) {
                    this.cites[i].neutral = true;
                    this.cites[i].reporter = false;
                }
            }
        }
    }
}

/*
 * Master scrape function
 *
*/
function scrapeOneCase(doc, url) {
    var engine = new Engine(doc, url);

    // ** Attachment
    var blocks = doc.getElementsByClassName("DocumentText");
    if (blocks.length) {
        var block = blocks[0];

        var myns = "http://www.w3.org/1999/xhtml"

        // head (title and css)
        var head = doc.createElementNS(myns, "head");
        var titlenode = doc.createElementNS(myns, "title");
        head.appendChild(titlenode)
        titlenode.appendChild(doc.createTextNode("Fastcase: " + engine.citation));

        var style = doc.createElementNS(myns, "style");
        head.appendChild(style)
        style.setAttribute("type", "text/css")
        var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}div.Headnote-div{background:#f5f5f5;}";
        style.appendChild(doc.createTextNode(css));

        var attachmentdoc = ZU.composeDoc(doc, head, block);
        var spans = ZU.xpath(attachmentdoc, '//span[contains(@style,"background-color")]');
        for (var i=0,ilen=spans.length;i<ilen;i+=1) {
            spans[i].setAttribute("style","");
        }
    }

    // Remaining
    // ** Set item:
    var hasneutral = false;
    if (engine.cites.length) {
        for (var i=0,ilen=engine.cites.length;i<ilen;i+=1) {
            var cite = engine.cites[i];
            var item = new Zotero.Item("case");
            for (var key in engine.fields) {
                item[key] = engine.fields[key];
            }
            if (cite.neutral) {
                // **** vendor-neutral; or
                item.yearAsVolume = cite.volume;
                item.firstPage = cite.page;
                item.attachments.push( { title:engine.citation, document:attachmentdoc, snapshot:true } );
                hasneutral = true;
            } else {
                // **** nominate
                item.reporterVolume = cite.volume;
                item.reporter = cite.reporter;
                item.firstPage = cite.page;
            }
            engine.items.push(item);
        }
    } else {
        // **** unreported
        var item = new Zotero.Item("case");
        for (var key in engine.fields) {
            item[key] = engine.fields[key];
        }
        engine.items.push(item);
    }
    if (!hasneutral && engine.items.length) {
        engine.items[0].attachments.push( { title:engine.citation, document:attachmentdoc, snapshot:true } );
    }

    // ** Relations
    for (var i=0,ilen=engine.items.length;i<ilen;i+=1) {
        engine.items[i].itemID = "bogusItemID" + i;
    }
	for (var i=0,ilen=engine.items.length;i<ilen;i+=1) {
		for (var j=0,jlen=engine.items.length;j<jlen;j+=1) {
			if (i === j) {
				continue;
			}
			engine.items[i].seeAlso.push(engine.items[j].itemID);
		}
	}

    // Wrap it up
    for (var i=0,ilen=engine.items.length;i<ilen;i+=1) {
        engine.items[i].complete();
    }
}

/*
 * Translator detectWeb() and doWeb() functions.
 */
function detectWeb(doc, url) {
    if (url.match(/https?:\/\/apps\.fastcase\.com\/Research\/Pages\/Results\.aspx\?.*LTID=/)) {
        return "multiple";
    } else if (doc.getElementById("ViewDocumentCitationHdr1_lblCitation")) {
		return "case";
	}
}

function doWeb(doc, url) {

    if (url.match(/https?:\/\/apps\.fastcase\.com\/Research\/Pages\/Results\.aspx\?.*LTID=/)) {
        // Assemble items list
        ZU.doGet([url], function (txt) {
            var items = [];
            var anchors_m = txt.match(/<a[^>]+>.*?<\/a>/g);
            for (var i=0,ilen=anchors_m.length;i<ilen;i+=1) {
                if (anchors_m[i].indexOf("ucPageWrapper") === -1 || anchors_m[i].indexOf('target="_self"') === -1) {
                    continue;
                }
                var m = anchors_m[i].match(/<a[^>]+href="([^"]+)"[^>]+>(.*?)<\/a>/);
                var url = m[1];
                var title = m[2];
                items[url] = title;
            }
            Zotero.selectItems(items, function (chosen) {
                var urls = [];
	            for (var j in chosen) {
		            urls.push(j);
	            };
                ZU.processDocuments(urls, function (doc, url) {
                    scrapeOneCase(doc, url);
                });
            });
        }, Zotero.done);
  //      var node = document.evaluate('//span', iframe.contentDocument,
  //                                           null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
/*
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            try {
                Zotero.debug("XXX gotcha: "+nodes[i]);
                var url = nodes[i].getElementsByTagName("a")[0].getAttribute("href");
                var title = nodes.textContent;
                items[url] = title;
            } catch (e) {
                Zotero.debug("XXX Fastcase translator error: unable to read list node");
            }
            
        }
        Zotero.selectItems(items, function (chosen) {
            var urls = [];
	        for (var j in chosen) {
		        urls.push(j);
	        };
            ZU.processDocuments(urls, function (doc, url) {
                scrapeOneCase(doc, url);
            });
        });
*/
    } else {
        scrapeOneCase(doc, url);
    }
}
