#!/bin/bash

OTHERS=$1

echo SHA1=$TRAVIS_COMMIT

python travis_after_all.py
export $(cat .to_export_back)
if [ "$BUILD_LEADER" = "YES" ]; then
  if [ "$BUILD_AGGREGATE_STATUS" = "others_$OTHERS" ]; then
    if [ "$OTHERS" = "succeeded" ]; then
      echo "All Succeeded! PUBLISHING..."

      bundle exec rake
      XPI=`ls *.xpi`
      RELEASE="$TRAVIS_COMMIT release: $XPI"
      CHECKIN=`git log -n 1 --pretty=oneline`
      echo "checkin: $CHECKIN"
      echo "release: $RELEASE"
      if [ "$CHECKIN" = "$RELEASE" ] ; then
        sed -i.bak -e 's/git@github.com:/https:\/\/github.com\//' .gitmodules
        git submodule update --init
        (cd www && git checkout master && git pull)
        git config credential.helper "store --file=.git/credentials"
        echo "https://${GITHUB_TOKEN}:@github.com" > .git/credentials
        git config --global user.name "retorquere"
        git config --global user.email "retorquere@ZotPlus.github.com"
        git config --global push.default matching
        bundle exec rake deploy
      else
        echo 'not a tagged release'
      fi

    else
      echo "All Failed"
    fi
  else
    echo "Some Failed"
  fi
fi
