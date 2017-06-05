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

importScripts('/{{TAG}}/node_modules/monaco-editor/min/vs/loader.js');

require.config({
  baseUrl: '/{{TAG}}',
  paths: {
    pako: 'node_modules/pako/dist/pako',
    vs: 'node_modules/monaco-editor/min/vs',
    lodash: 'node_modules/lodash/lodash',
    'loop-protect': 'node_modules/loop-protect/loop-protect',
    'build/out/urls': 'build/urls_bundle',
  }
});
require(['build/out/urls'], urls => {
  addEventListener('message', ({data}) => {
    postMessage(urls.encodeUrlData(data));
  });
});
