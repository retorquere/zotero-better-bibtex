all: bundle

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")
BIB=http://127.0.0.1:23119/better-bibtex/library?/1/library.json

bundle:
	amalg.lua -o zotero.lua -s pandoc-zotero-live-citemarkers.lua lunajson lunajson.decoder lunajson.encoder

paper: bundle
	@rm -f *.docx *.odt *.json
	@pandoc -s --metadata=zotero:$(BIB) --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP).docx main.md
	#@pandoc -s --metadata=zotero:$(BIB) --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).json main.md
	#@pandoc -s --metadata=zotero:$(BIB) --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).odt main.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx

rocks:
	luarocks install lunajson
	luarocks install penlight
	luarocks install amalg
