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

  export CHANGELOG_GITHUB_TOKEN="$GITHUB_TOKEN"
  rm -f *.xpi
  DEBUGBUILD=false rake

  sed -i.bak -e 's/git@github.com:/https:\/\/github.com\//' .gitmodules
  if [ -f .git/modules/www/config ] ; then # how can this be absent?!
    sed -i.bak -e 's/git@github.com:/https:\/\/github.com\//' .git/modules/www/config
  fi
  echo "https://${GITHUB_TOKEN}:@github.com" > /tmp/credentials
  git config --global credential.helper "store --file=/tmp/credentials"

  git submodule update --init
  (cd www && git checkout master && git pull)
  git config --global user.name "retorquere"
  git config --global user.email "retorquere@ZotPlus.github.com"
  git config --global push.default matching
  bundle exec rake deploy
else
  STATUS=`travis_parallel_sentinel script || true`
  if [ "$STATUS" != "deploy" ] ; then
    exit
  fi

  ./bin/xpi-to-s3
fi
