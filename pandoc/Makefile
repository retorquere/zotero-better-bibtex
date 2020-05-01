all: bundle

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")

bundle:
	amalg.lua -o ../site/content/citing/zotero.lua -s pandoc-zotero-live-citemarkers.lua lunajson lunajson.decoder lunajson.encoder locator

paper: bundle
	@rm -f *.docx *.odt *.json
	@pandoc -s --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP).docx main.md
	@pandoc -s --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP).odt main.md
	@pandoc -s --metadata=zotero_scannable_cite:true --lua-filter=pandoc-zotero-live-citemarkers.lua -o paper$(TIMESTAMP)-scannable-cite.odt main.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx

rocks:
	luarocks install lunajson
	luarocks install penlight
	luarocks install amalg
