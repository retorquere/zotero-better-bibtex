#!/bin/bash

#curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "item.bibliography", "params": [["bentley_academic_2011", "ShelahnoteHanfnumbers1970" ], { "quickCopy": true }] }'
#curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "autoexport.add", "params": ["//thesis/aux" , "bibtex", "/Users/emile/Downloads/output.bib"] }'
#curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "item.export", "params": [["shelah1970c"], "jzon"] }'
curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "item.collections", "params": {"citekeys": ["bentley_academic_2011"] }}'
