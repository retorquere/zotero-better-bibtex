#!/bin/bash

set -e

cd "$(dirname "$0")"
cd ..

. .env

npm run --silent s3form
curl -s -X POST https://circleci.com/api/v1.1/project/github/retorquere/zotero-better-bibtex/tree/master?circle-token=$CIRCLE_TOKEN -o rebuild.log

