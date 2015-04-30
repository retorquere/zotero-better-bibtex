#!/bin/bash

set -e
set -u


case $1 in
  build)
    case $CIRCLE_NODE_INDEX in
      [012])
        bundle exec cucumber --tag ~@noci --tags @test-cluster-$CIRCLE_NODE_INDEX
        ;;
      *)
        bundle exec cucumber --tag ~@noci --tag ~@test-cluster-0 --tag ~@test-cluster-1 --tag ~@test-cluster-2
        ;;
    esac
    ;;

  deploy)
    bundle exec rake
    XPI=`ls *.xpi`
    RELEASE="$CIRCLE_SHA1 release: $XPI"
    CHECKIN=`git log -n 1 --pretty=oneline`
    echo "release: $CHECKIN"
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
