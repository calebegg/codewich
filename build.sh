#!/bin/sh

# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

TAG=`date "+%Y%m%d%H%M%S"`
ENV=$1

case $ENV in
  prod)
    ANALYTICS_ID="UA-315420-12"
    ;;
  dev)
    ANALYTICS_ID="UA-315420-12"
    ;;
  standalone)
    ANALYTICS_ID=""
    ;;
  *)
    echo "Unexpected env \"$ENV\". Must specify one of: prod, dev, standalone."
    exit 1
    ;;
esac

echo "-*[})] CodeWich $ENV build $TAG"

echo "Transpiling with typecript...."
./node_modules/.bin/tsc

echo "Combining sources with r.js...."
./node_modules/.bin/r.js -o \
    baseDir=. \
    paths.pako=node_modules/pako/dist/pako \
    paths.vs=empty: \
    paths.lodash=node_modules/lodash/lodash \
    paths.loop-protect=node_modules/loop-protect/loop-protect \
    paths.dialog-polyfill=node_modules/dialog-polyfill/dialog-polyfill \
    name=build/out/main \
    out=build/bundle-max.js \
    optimize=none

echo "Uglfiying..."
./node_modules/.bin/uglifyjs build/bundle-max.js > build/bundle.js

echo "Deleting old $ENV builds...."
rm -r build/$ENV || true

echo "Creating directory structure...."
mkdir -p build/$ENV/$TAG/{build,node_modules/{requirejs,dialog-polyfill,monaco-editor/min/vs}}

echo "Interpolating index.html with Handlebars...."
./node_modules/.bin/handlebars \
    --TAG=$TAG \
    --GA_ID=$ANALYTICS_ID \
    < src/index.html > build/$ENV/index.html

echo "Copying files to the tagged directory...."
cp src/404.html build/$ENV/
cp build/bundle.js build/$ENV/$TAG/build/
cp src/*.css src/*.svg src/*.png build/$ENV/$TAG/
cp src/opengraph.png build/$ENV/
cp -R node_modules/monaco-editor/min/vs/ build/$ENV/$TAG/node_modules/monaco-editor/min/vs/
cp node_modules/dialog-polyfill/dialog-polyfill.css build/$ENV/$TAG/node_modules/dialog-polyfill/

echo "Done in $SECONDS seconds"
