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

/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
/// <reference path="../node_modules/@types/google.analytics/index.d.ts" />

import 'vs/editor/editor.main';
import 'loop-protect';
import {registerDialog} from 'dialog-polyfill';

import {debounce, throttle} from 'lodash';
import * as ts from 'typescript';

import {StrictLevel, ViewType} from './model';
import {decodeUrlData, encodeUrlData} from './urls';

document.body.style.display = 'block';

const DEFAULT_COMPILER_OPTIONS:
    monaco.languages.typescript.CompilerOptions = Object.freeze({
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  skipLibCheck: true,
  inlineSourceMap: true,
  allowJs: true,
  // Without this, Chrome tries to issue an HTTP request for file.ts that fails.
  inlineSources: true,
  // ng2
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
});

const STRICT_COMPILER_OPTIONS: monaco.languages.typescript.CompilerOptions =
    Object.freeze({
      ...DEFAULT_COMPILER_OPTIONS,
      noImplicitAny: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      strictNullChecks: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitThis: true,
      alwaysStrict: true,
    });

type WindowExports = Readonly<Window>&{[key: string]: {}};

const global = window as WindowExports;

export function compilerOptionsForViewType(type: ViewType, level: StrictLevel) {
  let compilerOptions;
  switch (level) {
    case StrictLevel.STRICT:
      compilerOptions = STRICT_COMPILER_OPTIONS;
      break;
    case StrictLevel.LOOSE:
    case StrictLevel.NONE:
      compilerOptions = DEFAULT_COMPILER_OPTIONS;
      break;
    default:
      throw new Error(`Unexpected strictLevel: ${level}`);
  }

  switch (type) {
    case ViewType.ES5:
      return {
        ...compilerOptions,
        inlineSourceMap: false,
        target: monaco.languages.typescript.ScriptTarget.ES5,
      };
    case ViewType.ESNEXT:
      return {
        ...compilerOptions,
        inlineSourceMap: false,
        target: monaco.languages.typescript.ScriptTarget.ESNext,
      };
    case ViewType.EDITOR_ONLY:
    case ViewType.OUTPUT:
    case ViewType.OUTPUT_ONLY:
      return compilerOptions;
    default:
      throw new Error(`Unexpected viewType: ${type}`);
  }
}

export function run(deps = {
  localStorage,
  ga,
  registerDialog,
  document,
  global,
  monaco,
  body: document.body,
  editor: monaco.editor.create(
      document.getElementById('monaco-container')!, {lineNumbersMinChars: 4}),
  getById(id: string) {
    return document.getElementById(id);
  }
}) {
  deps.registerDialog(deps.getById('settings'));
  deps.registerDialog(deps.getById('share'));

  function update(immediate = true) {
    deps.body.dataset['viewType'] = viewType.toString();

    deps.editor.getDomNode().style.display = 'none';
    deps.editor.layout();
    deps.editor.getDomNode().style.display = 'block';

    deps.monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
        compilerOptionsForViewType(viewType, strictLevel));

    const oldModel = models.script.model;
    switch (strictLevel) {
      case StrictLevel.STRICT:
      case StrictLevel.LOOSE:
        models.script.model = tsModel;
        deps.getById('ts-tab')!.textContent = 'ts';
        break;
      case StrictLevel.NONE:
        models.script.model = jsModel;
        deps.getById('ts-tab')!.textContent = 'js';
        break;
    }
    if (oldModel != models.script.model) {
      models.script.model.setValue(oldModel.getValue());
      oldModel.setValue('');
    }
    if (currentTab == 'script') {
      deps.editor.setModel(models.script.model);
    }

    updateUrl();
    if (immediate) {
      updateOutputNow();
    } else {
      updateOutput();
    }
  }

  function onViewChange(newType = viewType) {
    viewType = Number(newType);
    if (viewType == ViewType.ESNEXT || viewType == ViewType.ES5) {
      switchTab('script', deps.getById('ts-tab')!);
    }
    deps.ga('send', 'event', 'settings', 'changeViewType', ViewType[viewType]);
    update();
  }
  deps.global['onViewChange'] = onViewChange;

  function onStrictChange(level = strictLevel) {
    strictLevel = Number(level);
    deps.ga(
        'send', 'event', 'settings', 'changeStrictLevel',
        StrictLevel[strictLevel]);
    update();
  }
  deps.global['onStrictChange'] = onStrictChange;

  function showSettings() {
    (deps.getById('settings') as any).showModal();
  }
  deps.global['showSettings'] = showSettings;

  function share() {
    (deps.getById('share') as any).showModal();
  }
  deps.global['share'] = share;

  let currentTab: 'css'|'html'|'script' = 'script';
  function switchTab(tab: typeof currentTab, tabElement: HTMLElement) {
    models[currentTab].state = deps.editor.saveViewState();
    currentTab = tab;
    for (const elem of Array.from(
             deps.document.querySelectorAll('#tabbar > li'))) {
      elem.classList.remove('current');
    }
    tabElement.classList.add('current');
    const {model, state} = models[currentTab];
    deps.editor.setModel(model);
    deps.editor.restoreViewState(state);
    deps.editor.focus();
  }
  deps.global['switchTab'] = switchTab;

  function onChangeColorScheme(scheme: string) {
    deps.editor.updateOptions({theme: scheme});
    deps.document.body.dataset['scheme'] = scheme;
    deps.localStorage.setItem('monaco-theme', scheme);
  }
  deps.global['onChangeColorScheme'] = onChangeColorScheme;

  function saveLocalWichSettings(save: boolean) {
    if (save) {
      deps.ga('send', 'event', 'settings', 'saveLocalWichSettings');
      deps.localStorage.setItem('starter-template', JSON.stringify({
        viewType,
        strictLevel,
        scriptSource: models.script.model.getValue(),
        cssSource: models.css.model.getValue(),
        htmlSource: models.html.model.getValue(),
      }));
    } else {
      deps.ga('send', 'event', 'settings', 'clearLocalWichSettings');
      deps.localStorage.removeItem('starter-template');
    }
  }
  deps.global['saveLocalWichSettings'] = saveLocalWichSettings;

  function newWich() {
    deps.ga('send', 'event', 'action', 'newWich', 'fromSidebar');
    window.open(location.toString().split('#')[0]);
  }
  deps.global['newWich'] = newWich;

  function turnOnAutoRun() {
    deps.localStorage.setItem('maybeCrashed', 'false');
    crashMessage.style.display = 'none';
    updateOutputNow();
  }
  deps.global['turnOnAutoRun'] = turnOnAutoRun;

  function updateUrl() {
    history.replaceState(undefined, '', encodeUrlData({
                           viewType,
                           strictLevel,
                           scriptSource: models.script.model.getValue(),
                           cssSource: models.css.model.getValue(),
                           htmlSource: models.html.model.getValue(),
                         }));
  }

  let viewType: ViewType = ViewType.OUTPUT;
  let strictLevel: StrictLevel = StrictLevel.STRICT;

  function decodeUrl() {
    const starterTemplate = deps.localStorage.getItem('starter-template');
    const {
      viewType: newViewType,
      strictLevel: newStrictLevel, scriptSource, cssSource, htmlSource
    } =
        decodeUrlData(
            location.hash.substring(1),
            starterTemplate ? JSON.parse(starterTemplate) : undefined);
    viewType = newViewType;
    strictLevel = newStrictLevel;
    models.script.model.setValue(scriptSource);
    models.css.model.setValue(cssSource);
    models.html.model.setValue(htmlSource);
    (deps.getById('view-type-select') as HTMLSelectElement).value =
        viewType.toString();
    (deps.getById('strict-level-select') as HTMLSelectElement).value =
        strictLevel.toString();
    let startState = 'BLANK';
    if (location.hash.length > 1) startState = 'LOAD';
    if (starterTemplate) startState = 'TEMPLATE';
    deps.ga('set', 'page', '/');
    deps.ga('send', 'pageview', {
      dimension1: startState,
      metric1: scriptSource.length.toString(),
      metric2: cssSource.length.toString(),
      metric3: htmlSource.length.toString(),
      metric4: location.hash.length.toString(),
    });
    deps.ga(
        'send', 'timing', 'JS Dependencies', 'load',
        Math.round(performance.now()));
    update();
  }

  const loopProtectModel = deps.monaco.editor.createModel(
      '', 'typescript', deps.monaco.Uri.file('main.ts'));

  const jsModel = deps.monaco.editor.createModel(
      '', 'javascript', deps.monaco.Uri.file('main_raw.js'));
  const tsModel = deps.monaco.editor.createModel(
      '', 'typescript', deps.monaco.Uri.file('main_raw.ts'));

  const models = {
    script: {model: tsModel, state: deps.editor.saveViewState()},
    css: {
      model: deps.monaco.editor.createModel(
          '', 'css', deps.monaco.Uri.file('style.css')),
      state: deps.editor.saveViewState()
    },
    html: {
      model: deps.monaco.editor.createModel(
          '', 'html', deps.monaco.Uri.file('index.html')),
      state: deps.editor.saveViewState()
    },
  };

  const outputFrame = deps.getById('output-iframe') as HTMLIFrameElement;
  const outputText =
      deps.document.querySelector('#output > pre') as HTMLElement;
  const crashMessage = deps.getById('crash-message')!;

  async function updateOutputNow() {
    if (viewType == ViewType.EDITOR_ONLY) return;
    if (deps.localStorage.getItem('maybeCrashed') == 'true') {
      crashMessage.style.display = 'block';
      return;
    }
    let transpiledScript = '';
    if (models.script.model.getValue() != '') {
      const worker =
          await deps.monaco.languages.typescript.getTypeScriptWorker();
      let client, o: ts.EmitOutput;
      if (viewType == ViewType.OUTPUT || viewType == ViewType.OUTPUT_ONLY) {
        // loopProtect the TS code *before* transpilation to keep sourcemaps
        // accurate.
        loopProtectModel.setValue(
            '(function(){' +
            loopProtect.rewriteLoops(models.script.model.getValue()) + '})()');
        client = await worker(loopProtectModel.uri);
        o = await client.getEmitOutput(loopProtectModel.uri.toString());
      } else {
        client = await worker(models.script.model.uri);
        o = await client.getEmitOutput(models.script.model.uri.toString());
      }
      transpiledScript = o.outputFiles[0].text;
    }
    switch (viewType) {
      case ViewType.OUTPUT:
      case ViewType.OUTPUT_ONLY:
        const scriptUrl = URL.createObjectURL(new Blob([transpiledScript]));
        (outputFrame as any).srcdoc = `
          <!doctype html>
          <title>Output</title>
          <script>
            window['runnerWindow'] = top['loopProtect'];
          </script>
          <style>
            ${models.css.model.getValue()}
          </style>
          <body>
            ${models.html.model.getValue()}
            <script src="${scriptUrl}"></script>
          </body>`;
        if (models.script.model.getValue()) {
          deps.localStorage.setItem('maybeCrashed', 'true');
          outputFrame.addEventListener('load', () => {
            // Experimentally confirmed that 'load' is fired *after* script
            // execution. Doesn't handle an infinite loop in a timeout or event,
            // of course.
            deps.localStorage.setItem('maybeCrashed', 'false');
          });
        }
        break;
      case ViewType.ES5:
      case ViewType.ESNEXT:
        outputText.innerText = transpiledScript;
        break;
    }
  }

  let updateOutput = debounce(updateOutputNow, 1000, {maxWait: 3000});
  decodeUrl();

  const resizeHandler = throttle(() => {
    deps.editor.getDomNode().style.display = 'none';
    deps.editor.layout();
    deps.editor.getDomNode().style.display = 'block';
  }, 1000);
  window.addEventListener('resize', resizeHandler);

  switchTab('script', deps.getById('ts-tab')!);

  const theme = deps.localStorage.getItem('monaco-theme');
  if (theme) {
    onChangeColorScheme(theme);
    (deps.getById('theme-select') as HTMLSelectElement).value = theme;
  }

  deps.editor.onDidChangeModelContent(updateUrl);
  let updateEvent = deps.editor.onDidChangeModelContent(updateOutput);

  let anyScript = true;
  deps.editor.onDidChangeModelContent(() => {
    if (anyScript != (models.script.model.getValue() != '')) {
      anyScript = models.script.model.getValue() != '';
      if (anyScript) {
        updateOutput = debounce(updateOutputNow, 1000, {maxWait: 3000});
      } else {
        updateOutput = debounce(updateOutputNow, 100, {maxWait: 100});
      }
      updateEvent.dispose();
      updateEvent = deps.editor.onDidChangeModelContent(updateOutput);
    }
  });

  let overlayTimeout: number;
  deps.body.addEventListener('keydown', (e) => {
    if (e.key == 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      clearTimeout(overlayTimeout);
      deps.getById('save-overlay')!.style.display = 'block';
      overlayTimeout = setTimeout(() => {
        deps.getById('save-overlay')!.style.display = 'none';
      }, 3000);
    }
  });
}
global['run'] = run;
