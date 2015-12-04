#!/bin/bash

set -e
set -u

export DEBUGBUILD=false

rake
XPI=`ls *.xpi`

# force re-signing later
rm -f $XPI

RELEASE="$TRAVIS_COMMIT release: $XPI"
CHECKIN=`git log -n 1 --pretty=oneline`
echo "checkin: $CHECKIN"
echo "release: $RELEASE"
if [ "$CHECKIN" = "$RELEASE" ] ; then
  export CHANGELOG_GITHUB_TOKEN="$GITHUB_TOKEN"
  #PUBLISHED=`ruby -e 'require "open-uri"; require "json"; puts JSON.parse(open("https://api.github.com/repos/ZotPlus/zotero-better-bibtex/releases/latest").read)["tag_name"]'`
  #PUBLISHED="$TRAVIS_COMMIT release: zotero-better-bibtex-$PUBLISHED.xpi"
  #echo "published: $PUBLISHED"
  #if [ "$PUBLISHED" = "$RELEASE" ] ; then
  #  echo "Why is Travis re-publishing my releases?"
  #else
    STATUS=`travis_parallel_sentinel script`
    if [ "$STATUS" = "deploy" ] ; then
      rake sign

      ls *.xpi
      exit

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
    fi
  #fi
else
  echo 'not a tagged release'
fi
