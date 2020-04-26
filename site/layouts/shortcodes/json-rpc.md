## autoexport.add(collection, translator, path, displayOptions, replace)

Add an auto-export for the given collection. The target collection will be created if it does not exist

* collection: The forward-slash separated path to the collection. The first part of the path must be the library name; 'My Library' is your personal library. Intermediate collections that do not exist will be created as needed.
* translator: The name or GUID of a BBT translator
* path: The absolute path to which the collection will be auto-exported
* displayOptions: Options which you would be able to select during an interactive export
* replace: Replace the auto-export if it exists

 returns: Collection ID of the target collection

## collection.scanAUX(collection, aux)

Scan an AUX file for citekeys and populate a Zotero collection from them. The target collection will be cleared if it exists.

* collection: The forward-slash separated path to the collection. The first part of the path must be the library name; 'My Library' is your personal library. Intermediate collections that do not exist will be created as needed.
* aux: The absolute path to the AUX file on disk


## item.attachments(citekey)

List attachments for an item with the given citekey

* citekey: The citekey to search for

## item.bibliography(citekeys, format)

Generate a bibliography for the given citekeys

* citekeys: An array of citekeys
* format: A specification of how the bibliography should be formatted

 returns: A formatted bibliography

## item.citationkey(item\_keys)

Fetch citationkeys given item keys

* item\_keys: A list of [libraryID]:[itemKey] strings. If [libraryID] is omitted, assume 'My Library'

## item.export(citekeys, translator, libraryID)

Generate an export for a list of citekeys

* citekeys: Array of citekeys
* translator: BBT translator name or GUID
* libraryID: ID of library to select the items from. When omitted, assume 'My Library'

## item.notes(citekeys)

Fetch the notes for a range of citekeys

* citekeys: An array of citekeys

## item.search(terms)

Quick-search for items in Zotero.

* terms: Terms as typed into the search box in Zotero

## user.groups()

List the libraries (also known as groups) the user has in Zotero

