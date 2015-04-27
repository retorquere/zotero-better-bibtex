#!/bin/bash

bundle exec rake 

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
    TAGGED=`git log -n 1 --pretty=oneline`.strip
    XPI=`ls *.xpi`
    BUILD="$CIRCLE_SHA1 release: $XPI"
    if [ "$TAGGED" = "$BUILD" ] ; then
      git submodule update --init
      cd www; git checkout master; git pull
      git config --global user.name "$CIRCLE_USERNAME"
      git config --global user.email "$CIRCLE_USERNAME@$CIRCLE_PROJECT_USERNAME.github.com"
      git config --global push.default matching
      mv cucumber.status cucumber.0.status
      scp node1:zotero-better-bibtex/cucumber.status cucumber.1.status
      scp node2:zotero-better-bibtex/cucumber.status cucumber.2.status
      scp node3:zotero-better-bibtex/cucumber.status cucumber.3.status
      bundle exec rake deploy
    else
      echo 'not a tagged release'
    fi
    ;;

  *)
    echo 'Nothing to do'
    ;;
esac
