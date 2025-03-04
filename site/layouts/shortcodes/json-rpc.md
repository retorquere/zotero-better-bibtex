**api.ready**(): { betterbibtex: string; zotero: string }

Returns the Zotero and BetterBibTeX version to show the JSON-RPC API is ready.



**autoexport.add**(collection: string, translator: string, path: string, displayOptions: Record<string, boolean> = {}, replace: boolean = false): { id: number; key: string; libraryID: number }

* collection: The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
* translator: The name or GUID of a BBT translator
* path: The absolute path to which the collection will be auto-exported
* displayOptions: Options which you would be able to select during an interactive export; `exportNotes`, default `false`, and `useJournalAbbreviation`, default `false`
* replace: Replace the auto-export if it exists, default `false`
Add an auto-export for the given collection. The target collection will be created if it does not exist



**collection.scanAUX**(collection: string, aux: string): { key: string; libraryID: number }

* collection: The forward-slash separated path to the collection. The first part of the path must be the library name, or empty (`//`); empty is your personal library. Intermediate collections that do not exist will be created as needed.
* aux: The absolute path to the AUX file on disk
Scan an AUX file for citekeys and populate a Zotero collection from them. The target collection will be cleared if it exists.



**item.attachments**(citekey: string, library?: (string | number)): any

* citekey: The citekey to search for
* library: The libraryID to search in (optional). Pass `*` to search across your library and all groups.
List attachments for an item with the given citekey



**item.bibliography**(citekeys: string[], format: { contentType: ("text" | "html"); id: string; locale: string; quickCopy: boolean } = {}, library?: (string | number)): string

* citekeys: An array of citekeys
* format: A specification of how the bibliography should be formatted
Generate a bibliography for the given citekeys



**item.citationkey**(item_keys: string[]): Record<string, string>

* item_keys: A list of [libraryID]:[itemKey] strings. If [libraryID] is omitted, assume 'My Library'
Fetch citationkeys given item keys



**item.collections**(citekeys: string[], includeParents?: boolean): Record<string, { key: string; name: string }>

* citekeys: An array of citekeys
* includeParents: Include all parent collections back to the library root
Fetch the collections containing a range of citekeys



**item.export**(citekeys: string[], translator: string, libraryID?: (string | number)): string

* citekeys: Array of citekeys
* translator: BBT translator name or GUID
* libraryID: ID of library to select the items from. When omitted, assume 'My Library'
Generate an export for a list of citekeys



**item.notes**(citekeys: string[]): Record<string, { note: string }[]>

* citekeys: An array of citekeys
Fetch the notes for a range of citekeys



**item.pandoc_filter**(citekeys: string[], asCSL: boolean, libraryID?: (string | number | string[]), style?: string, locale?: string): any

* citekeys: Array of citekeys
* asCSL: Return the items as CSL
* libraryID: ID of library to select the items from. When omitted, assume 'My Library'
Generate an export for a list of citekeys, tailored for the pandoc zotero filter



**item.search**(terms: (string | ([ string ] | [ string, string ] | [ string, string, (string | number) ] | [ string, string, (string | number), boolean ])[]), library?: (string | number)): any

* terms: Single string as typed into the search box in Zotero (search for Title Creator Year)
              Array of tuples similar as typed into the advanced search box in Zotero
              (https://github.com/zotero/zotero/blob/9971f15e617f19f1bc72f8b24bb00b72d2a4736f/chrome/content/zotero/xpcom/data/searchConditions.js#L72-L610)
Search for items in Zotero.

Examples

- search('') or search([]): return every entries
- search('Zotero'): quick search for 'Zotero'
- search([['title', 'contains', 'Zotero']]): search for 'Zotero' in the Title
- search([['library', 'is', 'My Library']]): search for entries in 'My Library'
  (this function try to resolve the string 'My Library' into is own libraryId number)
- search([['ignore_feeds']]): custom action for ignoring the feeds
- search([['ignore_feeds'], ['quicksearch-titleCreatorYear', 'contains', 'Zotero']]): quick search for 'Zotero' ignoring the Feeds
- search([['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero']]): search for entries with Creator 'Johnny' AND Title 'Zotero'
- search([['joinMode', 'any'], ['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero']]): search for entries with Creator 'Johnny' OR Title 'Zotero'
- search([['joinMode', 'any'], ['creator', 'contains', 'Johnny'], ['title', 'contains', 'Zotero'], ['creator', 'contains', 'Smith', true]]): search for entries with (Creator 'Johnny' OR Title 'Zotero') AND (Creator 'Smith')



**user.groups**(includeCollections?: boolean): { collections: any[]; id: number; name: string }[]

* includeCollections: Wether or not the result should inlcude a list of collection for each library (default is false)
List the libraries (also known as groups) the user has in Zotero



**viewer.viewPDF**(id: string, page: number)

* id: id in the form of http://zotero.org/users/12345678/items/ABCDEFG0
* page: Page Number, counting from zero
Open the PDF associated with an entry with a given id.
the id can be retrieve with e.g. item.search("mypdf") -> result[0].id


