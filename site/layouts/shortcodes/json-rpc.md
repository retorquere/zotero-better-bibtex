## api.ready(): { betterbibtex: string; zotero: string }

Returns the Zotero and BetterBibTeX version to show the JSON-RPC API is ready.


## autoexport.add(collection: string, translator: string, path: string, displayOptions: Record<string, boolean> = {}, replace: boolean = false): { id: number; key: string; libraryID: number }

Add an auto-export for the given collection. The target collection will be created if it does not exist


## collection.scanAUX(collection: string, aux: string): { key: string; libraryID: number }

Scan an AUX file for citekeys and populate a Zotero collection from them. The target collection will be cleared if it exists.


## item.attachments(citekey: string, library?: (string | number)): any

List attachments for an item with the given citekey


## item.bibliography(citekeys: string[], format: { contentType: ("text" | "html"); id: string; locale: string; quickCopy: boolean } = {}, library?: (string | number)): string

Generate a bibliography for the given citekeys


## item.citationkey(item_keys: string[]): Record<string, string>

Fetch citationkeys given item keys


## item.collections(citekeys: string[], includeParents?: boolean): Record<string, { key: string; name: string }>

Fetch the collections containing a range of citekeys


## item.export(citekeys: string[], translator: string, libraryID?: (string | number)): string

Generate an export for a list of citekeys


## item.notes(citekeys: string[]): Record<string, { note: string }[]>

Fetch the notes for a range of citekeys


## item.pandoc_filter(citekeys: string[], asCSL: boolean, libraryID?: (string | number | string[]), style?: string, locale?: string): any

Generate an export for a list of citekeys, tailored for the pandoc zotero filter


## item.search(terms: (string | ([ string ] | [ string,string ] | [ string,string,(string | number) ] | [ string,string,(string | number),boolean ])[]), library?: (string | number)): any

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


## user.groups(includeCollections?: boolean): { collections: any[]; id: number; name: string }[]

List the libraries (also known as groups) the user has in Zotero


## viewer.viewPDF(id: string, page: number)

Open the PDF associated with an entry with a given id.
the id can be retrieve with e.g. item.search("mypdf") -> result[0].id

