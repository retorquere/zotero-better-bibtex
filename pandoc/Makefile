all: bundle

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")
MAIN=pandoc-zotero-live-citemarkers.lua

bundle:
ifeq ($(shell grep '^local pl =' *.lua), )
	amalg.lua -o ../site/content/exporting/zotero.lua -s $(MAIN) lunajson lunajson.decoder lunajson.encoder lunajson.sax locator utils zotero
else
	@echo $(MAIN) contains debugging code
	@exit 1
endif

paper:
	@rm -f *.docx *.odt *.json
	@pandoc -s --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP).docx main.md
	@pandoc -s --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP).odt main.md
	@pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP)-scannable-cite.odt main.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx

test:
	@pandoc -s --lua-filter=mwe.lua -o paper$(TIMESTAMP).docx main.md

rocks:
	luarocks install lunajson
	luarocks install penlight
	luarocks install amalg

start:
	ZOTERO_IMPORT=$(PWD)/biblio.bib npm start
