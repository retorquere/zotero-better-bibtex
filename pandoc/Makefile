all: bundle

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")
MAIN=pandoc-zotero-live-citemarkers.lua
BUNDLED=../site/content/exporting/zotero.lua

bundle:
ifeq ($(shell grep '^local pl =' *.lua), )
	amalg.lua -o $(BUNDLED) -s $(MAIN) lunajson lunajson.decoder lunajson.encoder lunajson.sax locator utils zotero
else
	@echo $(MAIN) contains debugging code
	@exit 1
endif

gist: bundle
	gist -u dbfcc3e51f2aaf82333bddb38cf5e4de $(BUNDLED)

paper:
	@rm -f *.docx *.odt *.json
	#@pandoc -s --lua-filter=$(MAIN) -o paper$(TIMESTAMP).docx main.md
	#@pandoc -s --lua-filter=$(MAIN) -o paper$(TIMESTAMP).odt main.md
	pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=$(MAIN) -o paper$(TIMESTAMP)-scannable-cite.odt main.md

1581:
	@rm -f *.docx *.odt *.json content.xml
	@curl -H 'Cache-Control: no-cache' -L https://gist.githubusercontent.com/retorquere/dbfcc3e51f2aaf82333bddb38cf5e4de/raw/zotero.lua -o zotero-bundled.lua
	@echo "[@wrigstad2017mastery]" > ww.md
	pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=./zotero-bundled.lua -o paper$(TIMESTAMP)-scannable-cite.odt ww.md
	#unzip paper$(TIMESTAMP)-scannable-cite.odt content.xml
	#grep @wrigstad2017mastery content.xml

1528:
	@rm -f *.docx *.odt *.json
	@pandoc -s --lua-filter=$(MAIN) -o 1528-$(TIMESTAMP).docx gh-1528.md

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
