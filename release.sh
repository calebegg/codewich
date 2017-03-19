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

maybe_dry=
if [[ "$1" != "wet" ]]; then
  echo "Dry run. Add 'wet' to command to do a real run"
  maybe_dry="echo Would run: "
fi

echo "Testing."
$maybe_dry yarn run test

echo "Ready to deploy to QA. ^C to stop, enter to continue."
read

$maybe_dry rm -r build/deploy || true
$maybe_dry mkdir -p build/deploy
$maybe_dry ./build.sh dev
$maybe_dry cp -r build/dev/* build/deploy
$maybe_dry ./node_modules/.bin/firebase deploy -P qa

echo "Deployed to QA. Maybe do manual testing? ^C to stop, enter to deploy to prod."
read

$maybe_dry rm -r build/deploy
$maybe_dry mkdir -p build/deploy
$maybe_dry ./build.sh prod
$maybe_dry cp -r build/prod/* build/deploy
$maybe_dry ./node_modules/.bin/firebase deploy -P prod

echo "Deployed to Prod. Create a new standalone build? ^C to stop, enter to continue."
read

$maybe_dry ./build.sh standalone
$maybe_dry rm build/codewich.zip
$maybe_dry zip -r build/codewich.zip build/standalone
$maybe_dry node release.js
