#!/bin/sh

curl -X POST -H 'Content-Type: application/json' -d '{"method":"bibtex","params":[["mises_liberalismus_1927","Adams2001", "mises_human_199","weber_wirtschaft_192"],{"translator":"biblatex"}]}' http://127.0.0.1:23119/better-bibtex/schomd
