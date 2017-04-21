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

import {compilerOptionsForViewType, run} from './main';
import {StrictLevel, ViewType} from './model';

type JasmineSpyObj = {
  [k: string]: jasmine.Spy
};

describe('main', () => {
  describe('run', () => {
    let fakeEditor: JasmineSpyObj;
    let fakeDocument: JasmineSpyObj;
    let fakeLocalStorage: JasmineSpyObj;
    let fakeGa: jasmine.Spy;
    let fakeMonaco;
    const fakeGlobal: {[k: string]: any} = {};

    beforeEach(() => {
      fakeEditor = jasmine.createSpyObj('editor', [
        'saveViewState',
        'getDomNode',
        'layout',
        'setModel',
        'restoreViewState',
        'focus',
        'onDidChangeModelContent',
      ]);
      fakeEditor.getDomNode.and.returnValue(document.createElement('div'));
      fakeDocument = jasmine.createSpyObj(
          'document', ['querySelector', 'querySelectorAll', 'createElement']);
      fakeDocument.querySelectorAll.and.returnValue([]);
      fakeMonaco = jasmine.createSpyObj('monaco', ['editor']);
      fakeMonaco = {
        editor: jasmine.createSpyObj('editor', ['create', 'createModel']),
        Uri: jasmine.createSpyObj('Uri', ['file']),
        languages: {
          typescript: {
            typescriptDefaults: jasmine.createSpyObj(
                'typescriptDefaults', ['setCompilerOptions'])
          }
        }
      };
      fakeMonaco.editor.createModel.and.callFake(
          (_: string, language: string) => {
            const fakeModel =
                jasmine.createSpyObj('model', ['getValue', 'setValue']);
            fakeModel.getValue.and.returnValue(`fake ${language} source`);
            return fakeModel;
          });
      fakeLocalStorage = jasmine.createSpyObj(
          'localStorage', ['getItem', 'setItem', 'removeItem']);
      fakeGa = jasmine.createSpy('ga');
      run({
        localStorage: fakeLocalStorage as any,
        ga: fakeGa as any,
        document: fakeDocument as any,
        registerDialog: jasmine.createSpy('registerDialog'),
        body: document.createElement('body'),
        editor: fakeEditor as any,
        getById: jasmine.createSpy('getById').and.callFake(
            () => document.createElement('div')),
        global: fakeGlobal as any,
        monaco: fakeMonaco as any,
      });
    });

    it('initializes', () => {});

    describe('saveLocalWichSettings', () => {
      it('saves settings', () => {
        fakeGlobal['saveLocalWichSettings'](true);
        expect(fakeGa).toHaveBeenCalled();
        expect(fakeLocalStorage.setItem)
            .toHaveBeenCalledWith('starter-template', JSON.stringify({
              viewType: 0,
              strictLevel: 0,
              scriptSource: 'fake typescript source',
              cssSource: 'fake css source',
              htmlSource: 'fake html source'
            }));
      });

      it('resets settings', () => {
        fakeGlobal['saveLocalWichSettings'](false);
        expect(fakeLocalStorage.removeItem)
            .toHaveBeenCalledWith('starter-template');
      });
    });
  });

  describe('compilerOptionsForViewType', () => {
    it('varies strictness', () => {
      expect(compilerOptionsForViewType(ViewType.OUTPUT, StrictLevel.STRICT)
                 .noImplicitAny)
          .toBeTruthy();

      expect(compilerOptionsForViewType(ViewType.OUTPUT, StrictLevel.LOOSE)
                 .noImplicitAny)
          .toBeFalsy();

      expect(compilerOptionsForViewType(ViewType.OUTPUT, StrictLevel.NONE)
                 .noImplicitAny)
          .toBeFalsy();
    });

    it('varies output settings', () => {
      expect(compilerOptionsForViewType(ViewType.OUTPUT, StrictLevel.STRICT)
                 .inlineSourceMap)
          .toBeTruthy();

      expect(compilerOptionsForViewType(ViewType.ES5, StrictLevel.STRICT)
                 .inlineSourceMap)
          .toBeFalsy();
    });

    it('throws on junk', () => {
      expect(() => compilerOptionsForViewType(-1, 0)).toThrowError();
      expect(() => compilerOptionsForViewType(0, -1)).toThrowError();
    });
  });
});
