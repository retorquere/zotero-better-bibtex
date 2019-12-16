{
	"translatorID": "248bebf1-46ab-4067-9f93-ec3d2960d0cd",
	"label": "Scannable Cite",
	"creator": "Scott Campbell, Avram Lyon, Nathan Schneider, Sebastian Karcher, Frank Bennett",
	"target": "html",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportCharset": "UTF-8"
	},
	"inRepository": true,
	"translatorType": 2,
	"browserSupport": "",
	"lastUpdated": "2013-04-16 11:10:08"
}

// legal types are weird
const LEGAL_TYPES = ["bill","case","gazette","hearing","patent","regulation","statute","treaty"];
const Mem = function (item) {
    let lst = [];
    const isLegal = LEGAL_TYPES.includes(item.itemType);
    this.set = function (str, punc, slug) { if (!punc) {punc="";} if (str) {lst.push((str + punc));} else if (!isLegal) {lst.push(slug);}};
    this.setlaw = function (str, punc) { if (!punc) {punc="";} if (str && isLegal) {lst.push(str + punc);}};
    this.get = function () { return lst.join(" "); };
};

function doExport() {
    let item;
    while (item = Zotero.nextItem()) {
        let mem = new Mem(item);
        let memdate = new Mem(item);
        Zotero.write("{ |");
        let library_id = item.libraryID ? item.libraryID : 0;
        if (item.creators.length >0){
            mem.set(item.creators[0].lastName,",");
            if (item.creators.length > 2) mem.set("et al.", ",");
            else if (item.creators.length == 2) mem.set("& " + item.creators[1].lastName, ",");
        }
        else {
            mem.set(false, ",","anon.");
        }
        if (Zotero.getHiddenPref("ODFScan.includeTitle") || item.creators.length === 0) {
            mem.set(item.title,",","(no title)");
        }
        mem.setlaw(item.authority, ",");
        mem.setlaw(item.volume);
        mem.setlaw(item.reporter);
        mem.setlaw(item.pages);
        memdate.setlaw(item.court,",");
        let date = Zotero.Utilities.strToDate(item.date);
        let dateS = (date.year) ? date.year : item.date;
        memdate.set(dateS,"","no date");
        Zotero.write(" " + mem.get() + " " + memdate.get() + " | | |");
        if (Zotero.getHiddenPref("ODFScan.useZoteroSelect")) {
            Zotero.write("zotero://select/items/" + library_id + "_" + item.key + "}");
        } else {
            let m = item.uri.match(/http:\/\/zotero\.org\/(users|groups)\/([^\/]+)\/items\/(.+)/);
            let prefix;
            let lib;
            let key;
            if (m) {
                if (m[1] === "users") {
                    prefix = "zu:";
                    if (m[2] === "local") {
                        lib = "0";
                    } else {
                        lib = m[2];
                    }
                } else {
                    prefix = "zg:";
                    lib = m[2];
                }
            } else {
                prefix = "zu:";
                lib = "0";
            }
            Zotero.write(prefix + lib + ":" + item.key + "}");
        }
    }
}
