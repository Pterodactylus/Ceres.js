#!/bin/bash

git config --local user.name "Pterodactylus"
git config --local user.email "59186787+Pterodactylus@users.noreply.github.com"
git checkout -b master
export GIT_TAG=0.1.$TRAVIS_BUILD_NUMBER
git tag $GIT_TAG -a -m "Generated tag from TravisCI for build $TRAVIS_BUILD_NUMBER [ci skip]"
git add ./build/Ceres.js -v
git commit -m "Generated tag from TravisCI for build $TRAVIS_BUILD_NUMBER [ci skip]" -v

git push https://$GITHUB_API_KEY@github.com/Pterodactylus/Ceres.js  --tags -v