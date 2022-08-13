#!/bin/bash

version=$1
if [ "$version" = "" ]
then
  echo "The new version number needs to be provided as an argument"
  exit 1
fi
echo "Changing the version to ${version}"

packageJson="s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"${version}\"/g"
sed -i '' "${packageJson}" package.json

validator="s/version = '[a-z0-9.-]*';/version = '${version}';/g"
sed -i '' "${validator}" src/Validator.ts
