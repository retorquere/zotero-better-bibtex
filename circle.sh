#!/bin/bash

set -e
set -u

sudo apt-get update && sudo apt-get install libpango1.0-0 && sudo apt-get install firefox

case $1 in
  dependencies)
    ;;

  test)
    dpkg -l | grep firefox
    if [ "$CIRCLE_NODE_TOTAL" = "1" ]; then
      bundle exec rake test[ci-cluster-*]
    else
      bundle exec rake test[ci-cluster-$CIRCLE_NODE_INDEX]
    fi
    ;;

  deploy)
    bundle exec rake
    XPI=`ls *.xpi`
    RELEASE="DISABLED-$CIRCLE_SHA1 release: $XPI"
    CHECKIN=`git log -n 1 --pretty=oneline`
    echo "checkin: $CHECKIN"
    echo "release: $RELEASE"
    if [ "$CHECKIN" = "$RELEASE" ] ; then
      git submodule update --init
      (cd www && git checkout master && git pull)
      git config --global user.name "$CIRCLE_USERNAME"
      git config --global user.email "$CIRCLE_USERNAME@$CIRCLE_PROJECT_USERNAME.github.com"
      git config --global push.default matching
      bundle exec rake deploy
    else
      echo 'not a tagged release'
    fi
    ;;

  *)
    echo 'Nothing to do'
    ;;
esac
