#!/bin/bash

set -e

cd "$(dirname "$0")"
cd ..

. .env

git pull

npm run --silent s3form

curl \
  --header "Content-Type: application/json" \
  --data '{"build_parameters": {"NIGHTLY": "true" }}' \
  --request POST \
  https://circleci.com/api/v1.1/project/github/retorquere/zotero-better-bibtex/tree/master?circle-token=$CIRCLE_TOKEN -o rebuild.log

