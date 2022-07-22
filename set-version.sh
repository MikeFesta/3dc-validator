#!/bin/bash

version=$1
if [ "$version" = "" ]
then
  echo "The new version number needs to be provided as an argument"
  exit 1
fi
echo "Changing the version to ${version}"

commandCodePackageJson="s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"${version}\"/g"
sed -i '' "${commandCodePackageJson}" package.json

commandCodeValidator="s/version = '[a-z0-9.-]*';/version = '${version}';/g"
sed -i '' "${commandCodeValidator}" src/Validator.ts

commandCodeTestValidator="s/.version).to.equal('[a-z0-9.-]*/.version).to.equal('${version}/g"
sed -i '' "${commandCodeTestValidator}" tests/validator.ts

