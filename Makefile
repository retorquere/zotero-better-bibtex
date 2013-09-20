all: Makefile.in

-include Makefile.in

RELEASE:=$(shell grep em:version install.rdf | head -n 1 | sed -r 's/^.*>(.*)<.*$$/\1/')
ID:=$(shell grep em:id install.rdf | head -n 1 | sed -r 's/^.*>(.*)<.*$$/\1/')

zotero.xpi: FORCE
	rm -rf $@
	#zip -r $@ chrome chrome.manifest defaults install.rdf
	zip -r $@ chrome chrome.manifest install.rdf resources bootstrap.js

zotero-%-zotero-better-bibtex.xpi: zotero.xpi
	rm -f zotero-*.xpi
	mv $< $@
	xsltproc -stringparam xpi $@ update.xsl install.rdf > update.rdf

publish:
	git add .
	git commit -am ${RELEASE}
	git push

Makefile.in: install.rdf
	echo "all: zotero-${RELEASE}-zotero-better-bibtex.xpi" > Makefile.in

FORCE:
