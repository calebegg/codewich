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


import {deflateRaw, inflateRaw} from 'pako';

import {StrictLevel, ViewType, WichData} from './model';

function toUrlKey(code: string) {
  return btoa(deflateRaw(code, {to: 'string'}))
      .replace(/=*$/, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '.');
}

export function decodeUrlData(fragment: string, defaults = {
  viewType: ViewType.OUTPUT,
  strictLevel: StrictLevel.STRICT,
  scriptSource: '',
  cssSource: '',
  htmlSource: '',
}): WichData {
  const [version, ...data] = fragment.split(',');
  switch (version) {
    case '':  // Starting fresh
      return defaults;
    case 'v1':
      // Code is always last in the URL, to allow for more values below.
      const code = data.pop()!;
      const [maybeViewType, maybeStrictLevel] = data;
      const viewType = Number(maybeViewType || 0) as ViewType;
      const strictLevel = Number(maybeStrictLevel || 0) as StrictLevel;

      let inflated;
      if (code) {
        inflated = inflateRaw(
            atob(code.replace(/\./g, '+').replace(/_/g, '/')), {to: 'string'});
      } else {
        inflated = '\0\0';
      }
      const [scriptSource, cssSource, htmlSource] = inflated.split('\0');
      return {viewType, strictLevel, scriptSource, cssSource, htmlSource};
    default:
      throw new Error(`Unexpected version ${version}`);
  }
}

export function encodeUrlData(
    {viewType, strictLevel, scriptSource, cssSource, htmlSource}: WichData) {
  if (viewType || strictLevel || scriptSource || cssSource || htmlSource) {
    const key = toUrlKey(`${scriptSource}\0${cssSource}\0${htmlSource}`);
    return [
      '#v1',
      viewType || '',
      strictLevel || '',
      key == toUrlKey('\0\0') ? '' : key,
    ].join(',');
  } else {
    return '#';
  }
}
