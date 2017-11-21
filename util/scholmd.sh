#!/bin/bash

curl http://localhost:23119/better-bibtex/scholmd -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "libraries" }'

