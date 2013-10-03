
all: Makefile.in

-include Makefile.in

RELEASE:=$(shell xsltproc version.xsl install.rdf)

zotero.xpi: FORCE
	rm -rf $@
	#zip -r $@ chrome chrome.manifest defaults install.rdf
	zip -r $@ chrome chrome.manifest install.rdf resources bootstrap.js

zotero-better-bibtex-%.xpi: zotero.xpi
	rm -f zotero-*.xpi
	mv $< $@
	xsltproc -stringparam xpi $@ update.xsl install.rdf > update.rdf

publish:
	git add .
	git commit -am ${RELEASE}
	git push

Makefile.in: install.rdf
	echo "all: zotero-better-bibtex-${RELEASE}.xpi" > Makefile.in

FORCE:
