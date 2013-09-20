const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

/**
 * Handle the add-on being installed
 */
function install(data, reason) {
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
    Components.utils.import("resource://gre/modules/NetUtil.jsm");
    var file =
    FileUtils.getFile('ProfD',['extensions','zotero-better-bibtex@iris-advies.com','resources','translators','Better BibTex.js']);
    NetUtil.asyncFetch(file, function(inputStream, status) {
        if (!Components.isSuccessCode(status)) {
            // Handle error!
            return;
        }
        // The file data is contained within inputStream.
        // You can read it into a string with
        var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());

        var splitTranslator = function (data) {
            var nest_level = 0;
            var split_ok = false;
            for (var i=0,ilen=data.length;i<ilen;i+=1) {
                if (data[i] === '{') {
                    nest_level += 1;
                    split_ok = true;
                } else if (data[i] === '}') {
                    nest_level += -1;
                }
                if (nest_level === 0 && split_ok) {
                    return {
                        header:JSON.parse(data.slice(0,i+1)),
                        code:data.slice(i+1).replace(/^\s+/,'').replace(/\s+$/,'')
                    }
                }
            }
            return null;
        }
        
        var data = splitTranslator(data);
        var Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
        Zotero.Translators.save(data.header, data.code);
        //re-initialize Zotero translators so Better Bibtex shows up right away
        Zotero.Translators.init()
        dump("XXX Saved translator\n");
    });
}

function load() { install(data, reason); }

function unload() {}

function startup(data, reason) { install(data, reason); }

function shutdown(data, reason) { }

/**
 * Handle the add-on being uninstalled
 */
function uninstall(data, reason) {}
