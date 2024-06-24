all: bundle

rule bundle:
rule test:
rule rocks:

bundle:
	snakemake bundle

test:
	snakemake test

rocks:
	snakemake rocks

start:
	snakemake start

this:
	snakemake this

reverse:
	/opt/homebrew/bin/amalg.lua -o docx+citations.lua -s reverse.lua lunajson lunajson.decoder lunajson.encoder lunajson.sax utils
	pandoc -s --lua-filter=docx+citations.lua -o reverse.md -f docx+citations d4dasia_country-report_lk_v2.docx
