all: paper

paper:
	@rm -f *.docx *.odt
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper`date "+%Y-%m-%dT%H:%M:%S"`.docx main.md
	@pandoc -s --lua-filter=add-zotero-refs.lua -o paper.odt main.md

tidy: paper
	rm -rf docx && mkdir docx && cd docx && unzip ../paper.docx
	#cat docx/word/document.xml | tidy -xml -q -utf8 > document.xml
	#mv document.xml docx/word/document.xml
	#cd docx && zip ../paper-tidy.docx *
