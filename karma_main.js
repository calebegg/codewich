/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var allTestFiles = []
var TEST_REGEXP = /build\/dev.*_test\.js$/i

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file.replace(/^\/base\/|\.js$/g, ''))
  }
})

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',
  deps: allTestFiles,
  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start,

  paths: {
    pako: 'node_modules/pako/dist/pako',
    vs: 'node_modules/monaco-editor/min/vs',
    lodash: 'node_modules/lodash/lodash',
    'loop-protect': 'node_modules/loop-protect/loop-protect',
    'dialog-polyfill': 'node_modules/dialog-polyfill/dialog-polyfill'
  }
})
