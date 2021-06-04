Components.utils.import("resource://gre/modules/FileUtils.jsm");
import "./startup";
import { ZoteroPane } from "./ZoteroPane";
import { ExportOptions } from "./ExportOptions";
import { ItemPane } from "./ItemPane";
import { FirstRun } from "./FirstRun";
import { PrefPane } from "./Preferences";
import { ErrorReport } from "./ErrorReport";
import { patch as $patch$ } from "./monkey-patch";
import { clean_pane_persist } from "./clean_pane_persist";
import { flash } from "./flash";
import { Deferred } from "./deferred";
import { Preference } from "../gen/preferences";
require("./pull-export");
require("./json-rpc");
import { AUXScanner } from "./aux-scanner";
import * as Extra from "./extra";
import { sentenceCase } from "./case";
Components.utils.import("resource://gre/modules/AddonManager.jsm");
import { log } from "./logger";
import { Events, itemsChanged as notifyItemsChanged } from "./events";
import { Translators } from "./translators";
import { DB } from "./db/main";
import { DB as Cache, selector as cacheSelector } from "./db/cache";
import { Serializer } from "./serializer";
import { JournalAbbrev } from "./journal-abbrev";
import { AutoExport } from "./auto-export";
import { KeyManager } from "./key-manager";
import { TestSupport } from "./test-support";
import { TeXstudio } from "./tex-studio";
import { $and } from "./db/loki";
const format = require("string-template");
AddonManager.addAddonListener({
  onUninstalling(addon, _needsRestart) {
    console.log('enter' + ' ' + '<anonymous:34>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (addon.id !== "better-bibtex@iris-advies.com")
        return null;
      clean_pane_persist();
      const quickCopy = Zotero.Prefs.get("export.quickCopy.setting");
      for (const [label, metadata] of Object.entries(Translators.byName)) {
        if (quickCopy === `export=${metadata.translatorID}`)
          Zotero.Prefs.clear("export.quickCopy.setting");
        try {
          Translators.uninstall(label);
        } catch (error) {
        }
      }
      Zotero.BetterBibTeX.uninstalled = true;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:34>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:34>');
    }
  },
  onDisabling(addon, needsRestart) {
    console.log('enter' + ' ' + '<anonymous:49>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.onUninstalling(addon, needsRestart);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:49>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:49>');
    }
  },
  async onOperationCancelled(addon, _needsRestart) {
    console.log('enter' + ' ' + '<anonymous:52>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (addon.id !== "better-bibtex@iris-advies.com")
        return null;
      if (addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE))
        return null;
      for (const header of Object.values(Translators.byId)) {
        try {
          await Translators.install(header);
        } catch (err) {
          log.error(err);
        }
      }
      delete Zotero.BetterBibTeX.uninstalled;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:52>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:52>');
    }
  }
});
if (Preference.citeprocNoteCitekey) {
  $patch$(Zotero.Utilities, "itemToCSLJSON", original => {
    console.log('enter' + ' ' + '<anonymous:68>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      {
        const cslItem = original.apply(this, arguments);
        if (typeof Zotero.Item !== "undefined" && !(zoteroItem instanceof Zotero.Item)) {
          const citekey = Zotero.BetterBibTeX.KeyManager.get(zoteroItem.itemID);
          if (citekey) {
            cslItem.note = citekey.citekey;
          } else {
            delete cslItem.note;
          }
        }
        return cslItem;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:68>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:68>');
    }
  });
}
$patch$(Zotero.Items, "merge", original => {
  console.log('enter' + ' ' + '<anonymous:81>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      try {
        const merge = {
          citationKey: Preference.extraMergeCitekeys,
          tex: Preference.extraMergeTeX,
          kv: Preference.extraMergeCSL
        };
        if (merge.citationKey || merge.tex || merge.kv) {
          const extra = Extra.get(item.getField("extra"), "zotero", { citationKey: merge.citationKey, aliases: merge.citationKey, tex: merge.tex, kv: merge.kv });
          if (!extra.extraFields.citationKey) {
            const pinned = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ itemID: item.id }));
            if (pinned.pinned)
              extra.extraFields.citationKey = pinned.citekey;
          }
          if (merge.citationKey) {
            const otherIDs = otherItems.map(i => {
              console.log('enter' + ' ' + '<anonymous:96>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {} catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:96>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:96>');
              }
            });
            extra.extraFields.aliases = [...extra.extraFields.aliases, ...Zotero.BetterBibTeX.KeyManager.keys.find($and({ itemID: { $in: otherIDs } })).map(i => {
              console.log('enter' + ' ' + '<anonymous:97>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {} catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:97>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:97>');
              }
            })];
          }
          for (const i of otherItems) {
            const otherExtra = Extra.get(i.getField("extra"), "zotero", { citationKey: merge.citationKey, aliases: merge.citationKey, tex: merge.tex, kv: merge.kv });
            if (merge.citationKey) {
              extra.extraFields.aliases = [...extra.extraFields.aliases, ...otherExtra.extraFields.aliases];
              if (otherExtra.extraFields.citationKey)
                extra.extraFields.aliases.push(otherExtra.extraFields.citationKey);
            }
            if (merge.tex) {
              for (const [name, value] of Object.entries(otherExtra.extraFields.tex)) {
                if (!extra.extraFields.tex[name])
                  extra.extraFields.tex[name] = value;
              }
            }
            if (merge.kv) {
              for (const [name, value] of Object.entries(otherExtra.extraFields.kv)) {
                const existing = extra.extraFields.kv[name];
                if (!existing) {
                  extra.extraFields.kv[name] = value;
                } else if (Array.isArray(existing) && Array.isArray(value)) {
                  for (const creator in value) {
                    if (!existing.includes(creator))
                      existing.push(creator);
                  }
                }
              }
            }
          }
          if (merge.citationKey) {
            const citekey = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ itemID: item.id })).citekey;
            extra.extraFields.aliases = extra.extraFields.aliases.filter(alias => {
              console.log('enter' + ' ' + '<anonymous:128>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {} catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:128>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:128>');
              }
            });
          }
          item.setField("extra", Extra.set(extra.extra, {
            citationKey: merge.citationKey ? extra.extraFields.citationKey : void 0,
            aliases: merge.citationKey ? extra.extraFields.aliases : void 0,
            tex: merge.tex ? extra.extraFields.tex : void 0,
            kv: merge.kv ? extra.extraFields.kv : void 0
          }));
        }
      } catch (err) {
        log.error("Zotero.Items.merge:", err);
      }
      return await original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:81>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:81>');
  }
});
$patch$(Zotero.DataObjects.prototype, "parseLibraryKeyHash", original => {
  console.log('enter' + ' ' + '<anonymous:142>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      try {
        const decoded_id = decodeURIComponent(id);
        if (decoded_id[0] === "@") {
          const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ citekey: decoded_id.substring(1) }));
          if (item)
            return { libraryID: item.libraryID, key: item.itemKey };
        }
        const m = decoded_id.match(/^bbt:(?:{([0-9]+)})?(.*)/);
        if (m) {
          const [_libraryID, citekey] = m.slice(1);
          const libraryID = !_libraryID || _libraryID === "1" ? Zotero.Libraries.userLibraryID : parseInt(_libraryID);
          const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID, citekey }));
          if (item)
            return { libraryID: item.libraryID, key: item.itemKey };
        }
      } catch (err) {
        log.error("parseLibraryKeyHash:", id, err);
      }
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:142>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:142>');
  }
});
$patch$(Zotero.ItemFields, "isFieldOfBase", original => {
  console.log('enter' + ' ' + '<anonymous:163>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      if (["citekey", "itemID"].includes(field))
        return false;
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:163>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:163>');
  }
});
$patch$(Zotero.Item.prototype, "setField", original => {
  console.log('enter' + ' ' + '<anonymous:168>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      if (["citekey", "itemID"].includes(field))
        return false;
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:168>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:168>');
  }
});
$patch$(Zotero.Item.prototype, "getField", original => {
  console.log('enter' + ' ' + '<anonymous:173>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      try {
        switch (field) {
          case "citekey":
          case "citationKey":
            if (Zotero.BetterBibTeX.ready.isPending())
              return "";
            return Zotero.BetterBibTeX.KeyManager.get(this.id).citekey;
          case "itemID":
            return `${this.id}`;
        }
      } catch (err) {
        log.error("patched getField:", { field, unformatted, includeBaseMapped, err });
      }
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:173>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:173>');
  }
});
$patch$(Zotero.Item.prototype, "clone", original => {
  console.log('enter' + ' ' + '<anonymous:189>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      const item = original.apply(this, arguments);
      try {
        if (item.isRegularItem())
          item.setField("extra", (item.getField("extra") || "").split("\n").filter(line => {
            console.log('enter' + ' ' + '<anonymous:193>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

            try {} catch (trace$error) {
              console.log('error' + ' ' + '<anonymous:193>' + ': ' + trace$error.message);
              throw trace$error;
            } finally {
              console.log('exit' + ' ' + '<anonymous:193>');
            }
          }).join("\n"));
      } catch (err) {
        log.error("patched clone:", { libraryID, options, err });
      }
      return item;
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:189>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:189>');
  }
});
const itemTreeViewWaiting = {};
$patch$(Zotero.ItemTreeView.prototype, "getCellText", original => {
  console.log('enter' + ' ' + '<anonymous:200>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      if (col.id !== "zotero-items-column-citekey")
        return original.apply(this, arguments);
      const item = this.getRow(row).ref;
      if (item.isNote() || item.isAttachment() || item.isAnnotation?.())
        return "";
      if (Zotero.BetterBibTeX.ready.isPending()) {
        if (!itemTreeViewWaiting[item.id]) {
          Zotero.BetterBibTeX.ready.then(() => {
            console.log('enter' + ' ' + '<anonymous:208>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

            try {} catch (trace$error) {
              console.log('error' + ' ' + '<anonymous:208>' + ': ' + trace$error.message);
              throw trace$error;
            } finally {
              console.log('exit' + ' ' + '<anonymous:208>');
            }
          });
          itemTreeViewWaiting[item.id] = true;
        }
        return "\u231B";
      }
      const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id);
      return `${citekey.citekey || "\u26A0"}${citekey.pinned ? " \u{1F4CC}" : ""}`;
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:200>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:200>');
  }
});
import * as CAYW from "./cayw";
$patch$(Zotero.Integration, "getApplication", original => {
  console.log('enter' + ' ' + '<anonymous:217>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      if (agent === "BetterBibTeX")
        return CAYW.Application;
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:217>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:217>');
  }
});
import * as DateParser from "./dateparser";
import { qualityReport } from "./qr-check";
import { titleCase } from "./case";
import { HTMLParser } from "./markupparser";
Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(_sandbox, value, test, params = null) {
    console.log('enter' + ' ' + '<anonymous:227>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return qualityReport(value, test, params);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:227>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:227>');
    }
  },
  parseDate(_sandbox, date) {
    console.log('enter' + ' ' + '<anonymous:230>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:230>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:230>');
    }
  },
  getLocaleDateOrder(_sandbox) {
    console.log('enter' + ' ' + '<anonymous:233>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return Zotero.BetterBibTeX.localeDateOrder;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:233>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:233>');
    }
  },
  isEDTF(_sandbox, date, minuteLevelPrecision = false) {
    console.log('enter' + ' ' + '<anonymous:236>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return DateParser.isEDTF(date, minuteLevelPrecision);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:236>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:236>');
    }
  },
  titleCase(_sandbox, text) {
    console.log('enter' + ' ' + '<anonymous:239>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return titleCase(text);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:239>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:239>');
    }
  },
  parseHTML(_sandbox, text, options) {
    console.log('enter' + ' ' + '<anonymous:242>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      options = {
        ...options,
        exportBraceProtection: Preference.exportBraceProtection,
        csquotes: Preference.csquotes,
        exportTitleCase: Preference.exportTitleCase
      };
      return HTMLParser.parse(text.toString(), options);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:242>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:242>');
    }
  },
  debugEnabled(_sandbox) {
    console.log('enter' + ' ' + '<anonymous:251>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return Zotero.Debug.enabled;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:251>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:251>');
    }
  },
  cacheFetch(_sandbox, itemID, options, prefs) {
    console.log('enter' + ' ' + '<anonymous:254>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      const collection = Cache.getCollection(_sandbox.translator[0].label);
      if (!collection)
        return false;
      const query = cacheSelector(itemID, options, prefs);
      const cloneObjects = collection.cloneObjects;
      collection.cloneObjects = false;
      const cached = collection.findOne($and(query));
      collection.cloneObjects = cloneObjects;
      if (!cached)
        return false;
      cached.meta.updated = new Date().getTime();
      collection.dirty = true;
      return Object.freeze(cached);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:254>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:254>');
    }
  },
  cacheStore(sandbox, itemID, options, prefs, reference, metadata) {
    console.log('enter' + ' ' + '<anonymous:269>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (!metadata)
        metadata = {};
      const collection = Cache.getCollection(sandbox.translator[0].label);
      if (!collection) {
        log.error("cacheStore: cache", sandbox.translator[0].label, "not found");
        return false;
      }
      const selector = cacheSelector(itemID, options, prefs);
      let cached = collection.findOne($and(selector));
      if (cached) {
        cached.reference = reference;
        cached.metadata = metadata;
        cached = collection.update(cached);
      } else {
        cached = collection.insert({ ...selector, reference, metadata });
      }
      return true;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:269>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:269>');
    }
  },
  strToISO(_sandbox, str) {
    console.log('enter' + ' ' + '<anonymous:288>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return DateParser.strToISO(str, Zotero.BetterBibTeX.localeDateOrder);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:288>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:288>');
    }
  }
};
Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  debugEnabled(_sandbox) {
    console.log('enter' + ' ' + '<anonymous:293>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return Zotero.Debug.enabled;
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:293>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:293>');
    }
  },
  parseHTML(_sandbox, text, options) {
    console.log('enter' + ' ' + '<anonymous:296>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      options = {
        ...options,
        exportBraceProtection: Preference.exportBraceProtection,
        csquotes: Preference.csquotes,
        exportTitleCase: Preference.exportTitleCase
      };
      return HTMLParser.parse(text.toString(), options);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:296>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:296>');
    }
  },
  parseDate(_sandbox, date) {
    console.log('enter' + ' ' + '<anonymous:305>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder);
    } catch (trace$error) {
      console.log('error' + ' ' + '<anonymous:305>' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + '<anonymous:305>');
    }
  }
};
$patch$(Zotero.Utilities.Internal, "itemToExportFormat", original => {
  console.log('enter' + ' ' + '<anonymous:309>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      const serialized = original.apply(this, arguments);
      return Serializer.enrich(serialized, zoteroItem);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:309>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:309>');
  }
});
$patch$(Zotero.Utilities.Internal, "extractExtraFields", original => {
  console.log('enter' + ' ' + '<anonymous:313>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      if (extra && extra.startsWith("BBT")) {
        return { itemType: null, fields: new Map(), creators: [], extra: extra.replace("BBT", "") };
      }
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:313>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:313>');
  }
});
$patch$(Zotero.Translate.Export.prototype, "translate", original => {
  console.log('enter' + ' ' + '<anonymous:319>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    {
      try {
        let translatorID = this.translator[0];
        if (translatorID.translatorID)
          translatorID = translatorID.translatorID;
        const translator = Translators.byId[translatorID];
        if (translator) {
          if (this.location) {
            if (this._displayOptions.exportFileData) {
              this._displayOptions.exportDir = this.location.path;
              this._displayOptions.exportPath = OS.Path.join(this.location.path, `${this.location.leafName}.${translator.target}`);
            } else {
              this._displayOptions.exportDir = this.location.parent.path;
              this._displayOptions.exportPath = this.location.path;
            }
            let postscript = Preference.postscriptOverride;
            if (postscript) {
              postscript = OS.Path.join(this._displayOptions.exportDir, postscript);
              try {
                if (new FileUtils.File(postscript).exists()) {
                  this._displayOptions.preference_postscript = `// postscript override in Translator.exportDir ${this._displayOptions.exportDir}

    ${Zotero.File.getContents(postscript)}`;
                }
              } catch (err) {
                log.error("failed to load postscript override", postscript, err);
              }
            }
          }
          let capture = this._displayOptions?.keepUpdated;
          if (capture) {
            if (!this.location?.path) {
              flash("Auto-export not registered", "Auto-export only supported for exports to file -- please report this, you should not have seen this message");
              capture = false;
            }
            if (this._displayOptions.exportFileData) {
              flash("Auto-export not registered", "Auto-export does not support file data export -- please report this, you should not have seen this message");
              capture = false;
            }
            if (!["library", "collection"].includes(this._export?.type)) {
              flash("Auto-export not registered", "Auto-export only supported for groups, collections and libraries");
              capture = false;
            }
          }
          if (capture) {
            AutoExport.add({
              type: this._export.type,
              id: this._export.type === "library" ? this._export.id : this._export.collection.id,
              path: this.location.path,
              status: "done",
              translatorID,
              exportNotes: this._displayOptions.exportNotes,
              useJournalAbbreviation: this._displayOptions.useJournalAbbreviation
            });
          }
          let disabled = "";
          if (this.noWait) {
            disabled = "noWait is active";
          } else if (!Preference.workersMax) {
            disabled = "user has disabled worker export";
          } else if (Translators.workers.disabled) {
            disabled = "failed to start a chromeworker, disabled until restart";
          } else if (this.location && this.location.path.startsWith("\\\\")) {
            disabled = "chrome workers fail on smb paths";
          } else {
            disabled = Object.keys(this._handlers).filter(handler => {
              console.log('enter' + ' ' + '<anonymous:384>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {} catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:384>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:384>');
              }
            }).join(", ");
            if (disabled)
              disabled = `handlers: ${disabled}`;
          }
          log.debug("worker translation:", !disabled, disabled);
          if (!disabled) {
            const path = this.location?.path;
            this._currentState = "translate";
            this.saveQueue = [];
            this._savingAttachments = [];
            return Translators.exportItemsByQueuedWorker(translatorID, this._displayOptions, { translate: this, scope: { ...this._export, getter: this._itemGetter }, path }).then((result) => {
              console.log('enter' + ' ' + '<anonymous:394>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {
                log.debug("worker translation done, result:", !!result);
                this.string = result;
                this.complete(result || true);
              } catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:394>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:394>');
              }
            }).catch((err) => {
              console.log('enter' + ' ' + '<anonymous:398>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

              try {
                log.error("worker translation failed, error:", err);
                this.complete(null, err);
              } catch (trace$error) {
                console.log('error' + ' ' + '<anonymous:398>' + ': ' + trace$error.message);
                throw trace$error;
              } finally {
                console.log('exit' + ' ' + '<anonymous:398>');
              }
            });
          }
        }
      } catch (err) {
        log.error("Zotero.Translate.Export::translate error:", err);
      }
      return original.apply(this, arguments);
    }
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:319>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:319>');
  }
});
function notify(event, handler) {
  console.log('enter' + ' ' + 'notify' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    Zotero.Notifier.registerObserver({
      notify(...args) {
        console.log('enter' + ' ' + '<anonymous:411>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

        try {
          Zotero.BetterBibTeX.ready.then(() => {
            console.log('enter' + ' ' + '<anonymous:412>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

            try {
              handler.apply(null, args);
            } catch (trace$error) {
              console.log('error' + ' ' + '<anonymous:412>' + ': ' + trace$error.message);
              throw trace$error;
            } finally {
              console.log('exit' + ' ' + '<anonymous:412>');
            }
          });
        } catch (trace$error) {
          console.log('error' + ' ' + '<anonymous:411>' + ': ' + trace$error.message);
          throw trace$error;
        } finally {
          console.log('exit' + ' ' + '<anonymous:411>');
        }
      }
    }, [event], "BetterBibTeX", 1);
  } catch (trace$error) {
    console.log('error' + ' ' + 'notify' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + 'notify');
  }
}
notify("item-tag", (_action, _type, ids, _extraData) => {
  console.log('enter' + ' ' + '<anonymous:418>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    ids = ids.map(item_tag => {
      console.log('enter' + ' ' + '<anonymous:419>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

      try {} catch (trace$error) {
        console.log('error' + ' ' + '<anonymous:419>' + ': ' + trace$error.message);
        throw trace$error;
      } finally {
        console.log('exit' + ' ' + '<anonymous:419>');
      }
    });
    Cache.remove(ids, `item ${ids} changed`);
    Events.emit("items-changed", ids);
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:418>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:418>');
  }
});
notify("item", (action, type, ids, extraData) => {
  console.log('enter' + ' ' + '<anonymous:423>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    if (action === "modify") {
      ids = ids.filter(id => {
        console.log('enter' + ' ' + '<anonymous:425>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

        try {} catch (trace$error) {
          console.log('error' + ' ' + '<anonymous:425>' + ': ' + trace$error.message);
          throw trace$error;
        } finally {
          console.log('exit' + ' ' + '<anonymous:425>');
        }
      });
      if (!ids.length)
        return;
    }
    Cache.remove(ids, `item ${ids} changed`);
    const parents = [];
    const items = action === "delete" ? [] : Zotero.Items.get(ids).filter((item) => {
      console.log('enter' + ' ' + '<anonymous:431>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

      try {
        if (item.isNote() || item.isAttachment() || item.isAnnotation?.()) {
          if (typeof item.parentID !== "boolean")
            parents.push(item.parentID);
          return false;
        }
        return true;
      } catch (trace$error) {
        console.log('error' + ' ' + '<anonymous:431>' + ': ' + trace$error.message);
        throw trace$error;
      } finally {
        console.log('exit' + ' ' + '<anonymous:431>');
      }
    });
    if (parents.length)
      Cache.remove(parents, `parent items ${parents} changed`);
    switch (action) {
      case "delete":
      case "trash":
        Zotero.BetterBibTeX.KeyManager.remove(ids);
        Events.emit("items-removed", ids);
        break;
      case "add":
      case "modify":
        let warn_titlecase = Preference.warnTitleCased ? 0 : null;
        for (const item of items) {
          Zotero.BetterBibTeX.KeyManager.update(item);
          if (typeof warn_titlecase === "number" && !item.isNote() && !item.isAttachment() && !item.isAnnotation?.()) {
            const title = item.getField("title");
            if (title !== sentenceCase(title))
              warn_titlecase += 1;
          }
        }
        if (typeof warn_titlecase === "number" && warn_titlecase) {
          const actioned = action === "add" ? "added" : "saved";
          const msg = warn_titlecase === 1 ? `${warn_titlecase} item ${actioned} which looks like it has a title-cased title` : `${warn_titlecase} items ${actioned} which look like they have title-cased titles`;
          flash(`Possibly title-cased title${warn_titlecase > 1 ? "s" : ""} ${actioned}`, msg, 3);
        }
        break;
      default:
        return;
    }
    notifyItemsChanged(items);
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:423>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:423>');
  }
});
notify("collection", (event, _type, ids, _extraData) => {
  console.log('enter' + ' ' + '<anonymous:469>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    if (event === "delete" && ids.length)
      Events.emit("collections-removed", ids);
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:469>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:469>');
  }
});
notify("group", (event, _type, ids, _extraData) => {
  console.log('enter' + ' ' + '<anonymous:473>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    if (event === "delete" && ids.length)
      Events.emit("libraries-removed", ids);
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:473>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:473>');
  }
});
notify("collection-item", (_event, _type, collection_items) => {
  console.log('enter' + ' ' + '<anonymous:477>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

  try {
    const changed = new Set();
    for (const collection_item of collection_items) {
      let collectionID = parseInt(collection_item.split("-")[0]);
      if (changed.has(collectionID))
        continue;
      while (collectionID) {
        changed.add(collectionID);
        collectionID = Zotero.Collections.get(collectionID).parentID;
      }
    }
    if (changed.size)
      Events.emit("collections-changed", Array.from(changed));
  } catch (trace$error) {
    console.log('error' + ' ' + '<anonymous:477>' + ': ' + trace$error.message);
    throw trace$error;
  } finally {
    console.log('exit' + ' ' + '<anonymous:477>');
  }
});
class Progress {
  constructor() {
    console.log('enter' + ' ' + 'constructor' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.name = "Startup progress";
    } catch (trace$error) {
      console.log('error' + ' ' + 'constructor' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'constructor');
    }
  }
  start(msg) {
    console.log('enter' + ' ' + 'start' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.timestamp = Date.now();
      this.msg = msg || "Initializing";
      if (!["progressbar", "popup"].includes(Preference.startupProgress))
        Preference.startupProgress = "popup";
      this.mode = Preference.startupProgress;
      log.debug(`${this.name}: waiting for Zotero locks...`);
      log.debug(`${this.name}: ${msg}...`);
      if (this.mode === "popup") {
        this.progressWin = new Zotero.ProgressWindow({ closeOnClick: false });
        this.progressWin.changeHeadline("Better BibTeX: Initializing");
        const icon = `chrome://zotero/skin/treesource-unfiled${Zotero.hiDPI ? "@2x" : ""}.png`;
        this.progress = new this.progressWin.ItemProgress(icon, `${this.msg}...`);
        this.progressWin.show();
      } else {
        document.getElementById("better-bibtex-progress").hidden = false;
        this.progressmeter = document.getElementById("better-bibtex-progress-meter");
        this.progressmeter.value = 0;
        this.label = document.getElementById("better-bibtex-progress-label");
        this.label.value = msg;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + 'start' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'start');
    }
  }
  update(msg, progress) {
    console.log('enter' + ' ' + 'update' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.bench(msg);
      log.debug(`${this.name}: ${msg}...`);
      if (this.mode === "popup") {
        this.progress.setText(msg);
      } else {
        this.progressmeter.value = progress;
        this.label.value = msg;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + 'update' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'update');
    }
  }
  done() {
    console.log('enter' + ' ' + 'done' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.bench(null);
      if (this.mode === "popup") {
        this.progress.setText("Ready");
        this.progressWin.startCloseTimer(500);
      } else {
        document.getElementById("better-bibtex-progress").hidden = true;
      }
      log.debug(`${this.name}: done`);
    } catch (trace$error) {
      console.log('error' + ' ' + 'done' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'done');
    }
  }
  bench(msg) {
    console.log('enter' + ' ' + 'bench' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      const ts = Date.now();
      if (this.msg)
        log.debug(`${this.name}:`, this.msg, "took", (ts - this.timestamp) / 1e3, "s");
      this.msg = msg;
      this.timestamp = ts;
    } catch (trace$error) {
      console.log('error' + ' ' + 'bench' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'bench');
    }
  }
}
export class BetterBibTeX {
  constructor() {
    console.log('enter' + ' ' + 'constructor' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.TestSupport = new TestSupport();
      this.KeyManager = new KeyManager();
      this.ZoteroPane = ZoteroPane;
      this.ExportOptions = ExportOptions;
      this.ItemPane = ItemPane;
      this.FirstRun = FirstRun;
      this.ErrorReport = ErrorReport;
      this.PrefPane = PrefPane;
      this.localeDateOrder = Zotero.Date.getLocaleDateOrder();
      this.debugEnabledAtStart = Zotero.Debug.enabled;
    } catch (trace$error) {
      console.log('error' + ' ' + 'constructor' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'constructor');
    }
  }
  debugEnabled() {
    console.log('enter' + ' ' + 'debugEnabled' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      return Zotero.Debug.enabled;
    } catch (trace$error) {
      console.log('error' + ' ' + 'debugEnabled' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'debugEnabled');
    }
  }
  getString(id, params = null) {
    console.log('enter' + ' ' + 'getString' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (!this.strings || typeof this.strings.getString !== "function") {
        log.error("getString called before strings were loaded", id);
        return id;
      }
      try {
        const str = this.strings.getString(id);
        return params ? format(str, params) : str;
      } catch (err) {
        log.error("getString", id, err);
        return id;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + 'getString' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'getString');
    }
  }
  async scanAUX(target) {
    console.log('enter' + ' ' + 'scanAUX' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (!this.loaded)
        return;
      await this.loaded;
      const aux = await AUXScanner.pick();
      if (!aux)
        return;
      switch (target) {
        case "collection":
          await AUXScanner.scan(aux);
          break;
        case "tag":
          const ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
          let name = OS.Path.basename(aux);
          name = name.lastIndexOf(".") > 0 ? name.substr(0, name.lastIndexOf(".")) : name;
          const tag = { value: name };
          if (!ps.prompt(null, this.getString("BetterBibTeX.auxScan.title"), this.getString("BetterBibTeX.auxScan.prompt"), tag, null, {}))
            return;
          if (!tag.value)
            return;
          await AUXScanner.scan(aux, { tag: tag.value });
          break;
        default:
          flash(`Unsupported aux-scan target ${target}`);
          break;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + 'scanAUX' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'scanAUX');
    }
  }
  openDialog(url, title, properties, params) {
    console.log('enter' + ' ' + 'openDialog' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.globals.window.openDialog(url, title, properties, params);
    } catch (trace$error) {
      console.log('error' + ' ' + 'openDialog' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'openDialog');
    }
  }
  async load(globals) {
    console.log('enter' + ' ' + 'load' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.globals = globals;
      if (this.loaded)
        return;
      this.strings = globals.document.getElementById("zotero-better-bibtex-strings");
      const deferred = {
        loaded: new Deferred(),
        ready: new Deferred()
      };
      this.ready = deferred.ready.promise;
      this.loaded = deferred.loaded.promise;
      if (typeof this.ready.isPending !== "function")
        throw new Error("Zotero.Promise is not using Bluebird");
      log.debug("Loading Better BibTeX: starting...");
      await TeXstudio.init();
      for (const node of [...globals.document.getElementsByClassName("bbt-texstudio")]) {
        node.hidden = !TeXstudio.enabled;
      }
      if (!Preference.citekeyFormat)
        Preference.citekeyFormat = Preference.default.citekeyFormat;
      const citekeyFormat = Preference.citekeyFormat;
      if (citekeyFormat.includes("\u200B")) {
        const params = {
          wrappedJSObject: {
            citekeyFormat: "bbt",
            dragndrop: true,
            unabbreviate: Preference.importJabRefAbbreviations,
            strings: Preference.importJabRefStrings
          }
        };
        const ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
        ww.openWindow(null, "chrome://zotero-better-bibtex/content/FirstRun.xul", "better-bibtex-first-run", "chrome,centerscreen,modal", params);
        this.firstRun = params.wrappedJSObject;
        log.debug("firstRun:", this.firstRun);
        Preference.citekeyFormat = this.firstRun.citekeyFormat === "zotero" ? "[zotero:clean]" : citekeyFormat.replace(/\u200B/g, "");
        Preference.importJabRefAbbreviations = this.firstRun.unabbreviate;
        Preference.importJabRefStrings = this.firstRun.strings;
      } else {
        this.firstRun = null;
      }
      if (Zotero.BBTTRacer) {
        flash("BBT TRACE LOGGING IS ENABLED", "BBT trace logging is enabled in this build.\nZotero will run very slowly.\nThis is intended for debugging ONLY.", 20);
      }
      const progress = new Progress();
      progress.start(this.getString("BetterBibTeX.startup.waitingForZotero"));
      await Zotero.Schema.schemaUpdatePromise;
      this.dir = OS.Path.join(Zotero.DataDirectory.dir, "better-bibtex");
      await OS.File.makeDir(this.dir, { ignoreExisting: true });
      log.debug("Zotero ready, let's roll!");
      progress.update(this.getString("BetterBibTeX.startup.loadingKeys"), 10);
      await Promise.all([Cache.init(), DB.init()]);
      await this.KeyManager.init();
      progress.update(this.getString("BetterBibTeX.startup.serializationCache"), 20);
      Serializer.init();
      progress.update(this.getString("BetterBibTeX.startup.autoExport.load"), 30);
      await AutoExport.init();
      deferred.loaded.resolve(true);
      progress.update(this.getString("BetterBibTeX.startup.waitingForTranslators"), 40);
      await Zotero.Schema.schemaUpdatePromise;
      progress.update(this.getString("BetterBibTeX.startup.journalAbbrev"), 60);
      await JournalAbbrev.init();
      progress.update(this.getString("BetterBibTeX.startup.installingTranslators"), 70);
      await Translators.init();
      progress.update(this.getString("BetterBibTeX.startup.keyManager"), 80);
      await this.KeyManager.start();
      progress.update(this.getString("BetterBibTeX.startup.autoExport"), 90);
      AutoExport.start();
      deferred.ready.resolve(true);
      progress.done();
      if (this.firstRun && this.firstRun.dragndrop)
        Zotero.Prefs.set("export.quickCopy.setting", `export=${Translators.byLabel.BetterBibTeXCitationKeyQuickCopy.translatorID}`);
      Events.emit("loaded");
      Events.on("export-progress", (percent, translator) => {
        console.log('enter' + ' ' + '<anonymous:676>' + '(' + JSON.stringify(Array.from(arguments)) + ')');

        try {
          if (percent && percent < 100) {
            document.getElementById("better-bibtex-progress").hidden = false;
            const progressmeter = document.getElementById("better-bibtex-progress-meter");
            progressmeter.value = Math.abs(percent);
            const label = document.getElementById("better-bibtex-progress-label");
            label.value = `${percent < 0 ? this.getString("Preferences.auto-export.status.preparing") : ""} ${translator}`.trim();
          } else {
            document.getElementById("better-bibtex-progress").hidden = true;
          }
        } catch (trace$error) {
          console.log('error' + ' ' + '<anonymous:676>' + ': ' + trace$error.message);
          throw trace$error;
        } finally {
          console.log('exit' + ' ' + '<anonymous:676>');
        }
      });
    } catch (trace$error) {
      console.log('error' + ' ' + 'load' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'load');
    }
  }
}
Zotero.BetterBibTeX = Zotero.BetterBibTeX || new BetterBibTeX();

