all: paper

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")
BIB=http://127.0.0.1:23119/better-bibtex/library?/1/library.json

paper:
	@rm -f *.docx *.odt
	@pandoc -s --metadata=zotero:$(BIB) --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).docx main.md
	#@pandoc -s --metadata=zotero:$(BIB) --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).odt main.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx
