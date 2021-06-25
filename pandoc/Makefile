all: bundle

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")
MAIN=pandoc-zotero-live-citemarkers.lua
DEPLOYED=../site/content/exporting/zotero.lua
BUNDLED=bundle.lua

count:
	pandoc --lua-filter count-cite.lua main.md | pandoc --bibliography=biblio.bib --citeproc

bundle:
ifeq ($(shell grep '^local pl =' *.lua), )
	echo "-- $(shell git rev-parse --short HEAD)" > $(DEPLOYED)
	~/.luarocks/bin/amalg.lua -o $(BUNDLED) -s $(MAIN) lunajson lunajson.decoder lunajson.encoder lunajson.sax locator utils zotero
	cat $(BUNDLED) >> $(DEPLOYED)
	rm $(BUNDLED)
else
	@echo $(MAIN) contains debugging code
	@exit 1
endif

test:
	@rm -f *.docx *.odt *.json
	#@pandoc -s --lua-filter=$(MAIN) -o paper$(TIMESTAMP).docx main.md
	@pandoc -s --lua-filter=$(MAIN) -o paper$(TIMESTAMP).odt main.md
	pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=$(MAIN) -o paper$(TIMESTAMP)-scannable-cite.odt main.md

jurism:
	@rm -f *.docx *.odt *.json
	@pandoc -s --lua-filter=$(MAIN) -o paper$(TIMESTAMP).odt jurism.md

1581:
	@rm -f *.docx *.odt *.json content.xml
	@curl -H 'Cache-Control: no-cache' -L https://gist.githubusercontent.com/retorquere/dbfcc3e51f2aaf82333bddb38cf5e4de/raw/zotero.lua -o zotero-bundled.lua
	@echo "[@wrigstad2017mastery]" > ww.md
	pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=./zotero-bundled.lua -o paper$(TIMESTAMP)-scannable-cite.odt ww.md
	#unzip paper$(TIMESTAMP)-scannable-cite.odt content.xml
	#grep @wrigstad2017mastery content.xml

%.md:
	cp test.md $@

ZOTERO_TRANSFERABLE = true

odt-scannable-cite.odt:    ZOTERO_OPTIONS = --metadata=zotero_scannable_cite:true \
                                          --metadata=zotero_transferable:$(ZOTERO_TRANSFERABLE) # don't care

odt-with-csl-style.odt:    ZOTERO_CSL_STYLE = chicago-author-date
odt-with-csl-style.odt:    ZOTERO_OPTIONS = --metadata=zotero_csl_style:$(ZOTERO_CSL_STYLE) \
                                          --metadata=zotero_transferable:$(ZOTERO_TRANSFERABLE) 

odt-without-csl-style.odt: ZOTERO_OPTIONS = --metadata=zotero_transferable:$(ZOTERO_TRANSFERABLE) # don't care

%.odt: %.md
	make clean
	@echo ""
	@echo "---------------- CONTENTS OF $< ----------------"
	@cat  $<
	@echo ""
	@echo "---------------- AST FOR $< ----------------"
	@echo ""
	pandoc -s $(ZOTERO_OPTIONS) -L  $(MAIN) -t native  $<
	@echo ""
	@echo "---------------- Making $@ ----------------"
	@echo ""
	pandoc -s $(ZOTERO_OPTIONS) -L  $(MAIN) -o $@ $<
	unzip $@ content.xml meta.xml
	@echo ""
	@echo "content.xml:"
	@cat content.xml | tail
	@echo ""
	@echo "meta.xml:"
	@cat meta.xml | tail -50

test-odt: clean odt-scannable-cite.odt odt-without-csl-style.odt odt-with-csl-style.odt

clean:
	@rm -f *.docx *.odt *.json *.xml

1528: clean
	@rm -f *.docx *.odt *.json
	@pandoc -s --lua-filter=$(MAIN) -o 1528-$(TIMESTAMP).docx gh-1528.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx

mwe: clean mwe.md
	@pandoc -s --metadata=zotero_csl_style=chicago-author-date --lua-filter=$(MAIN) -o mwe.odt mwe.md

rocks:
	luarocks install lunajson
	luarocks install penlight
	luarocks install amalg

start:
	ZOTERO_IMPORT=$(PWD)/biblio.bib npm start
