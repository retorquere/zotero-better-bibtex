#!/bin/bash

set -e
set -u

DEBUGBUILD=false XPI=`rake xpi`

RELEASE="$TRAVIS_COMMIT release: $XPI"
CHECKIN=`git log -n 1 --pretty=oneline`
echo "checkin: $CHECKIN"
echo "release: $RELEASE"
if [ "$CHECKIN" = "$RELEASE" ] ; then
  STATUS=`travis_parallel_sentinel script`
  if [ "$STATUS" != "deploy" ] ; then
    exit
  fi

  rm -f *.xpi
  DEBUGBUILD=false rake

  bundle exec rake deploy
else
  STATUS=`travis_parallel_sentinel script || true`
  if [ "$STATUS" != "deploy" ] ; then
    exit
  fi

  ./bin/xpi-to-s3
fi
