#!/bin/bash

if [ "$CI" = "true" ]; then
  rm -f build/manifest.json
fi

