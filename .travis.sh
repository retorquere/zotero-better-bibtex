#!/bin/bash

OTHERS=$1

python travis_after_all.py
export $(cat .to_export_back)
if [ "$BUILD_LEADER" = "YES" ]; then
  if [ "$BUILD_AGGREGATE_STATUS" = "others_$OTHERS" ]; then
    if [ "$OTHERS" = "succeeded" ]; then
      echo "All Succeeded! PUBLISHING..."
    else
      echo "All Failed"
    fi
  else
    echo "Some Failed"
  fi
fi
