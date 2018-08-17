#!/bin/bash

set -e

. .env

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token $TRAVIS_TOKEN" \
  -d "{\"quiet\": true}" \
  https://api.travis-ci.org/job/$1/debug
