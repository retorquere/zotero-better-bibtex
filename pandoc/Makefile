all: paper

TIMESTAMP=$(shell date "+%Y-%m-%dT%H:%M:%S")

paper:
	@rm -f *.docx *.odt
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).docx main.md
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper$(TIMESTAMP).odt main.md

unpack: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper*.docx
