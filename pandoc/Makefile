all: paper

paper:
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper.docx main.md
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper.odt main.md
