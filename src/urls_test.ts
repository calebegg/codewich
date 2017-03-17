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

/// <reference path="../node_modules/@types/jasmine/index.d.ts" />

import {StrictLevel, ViewType} from './model';
import {decodeUrlData, encodeUrlData} from './urls';

const BLANK_WICH = {
  viewType: ViewType.OUTPUT,
  strictLevel: StrictLevel.STRICT,
  scriptSource: '',
  cssSource: '',
  htmlSource: '',
};

const SIMPLE_WICH = {
  viewType: ViewType.OUTPUT,
  strictLevel: StrictLevel.STRICT,
  scriptSource: `console.log('hello');`,
  cssSource: '',
  htmlSource: '',
};

const COMPLEX_WICH = {
  viewType: ViewType.ES5,
  strictLevel: StrictLevel.LOOSE,
  scriptSource: 'let a;',
  cssSource: 'body { margin: 0; }',
  htmlSource: 'hi',
};

describe('urls', () => {
  describe('decodeUrlData', () => {
    it('returns defaults with blank strings', () => {
      expect(decodeUrlData('')).toEqual(BLANK_WICH);
      expect(decodeUrlData('', SIMPLE_WICH)).toEqual(SIMPLE_WICH);
    });

    it('decodes a simple URL', () => {
      expect(decodeUrlData('v1,,,S87PK87PSdXLyU_XUM9IzcnJV9e0ZmAAAA'))
          .toEqual(SIMPLE_WICH);
    });

    it('decodes a complex URL', () => {
      expect(decodeUrlData('v1,2,1,y0ktUUi0ZkjKT6lUqFbITSxKz8yzUjCwVqhlyMgEAA'))
          .toEqual(COMPLEX_WICH);
    });

    it('throws on junk', () => {
      expect(() => decodeUrlData('junk')).toThrowError();
    });
  });

  describe('encodeUrlData', () => {
    it('returns # for default data', () => {
      expect(encodeUrlData(BLANK_WICH)).toBe('#');
    });

    it('encodes simple data', () => {
      expect(encodeUrlData(SIMPLE_WICH))
          .toBe('#v1,,,S87PK87PSdXLyU_XUM9IzcnJV9e0ZmAAAA');
    });

    it('encodes complex data', () => {
      expect(encodeUrlData(COMPLEX_WICH))
          .toBe('#v1,2,1,y0ktUUi0ZkjKT6lUqFbITSxKz8yzUjCwVqhlyMgEAA');
    });
  });
});
