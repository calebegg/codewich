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

function getDeps() {
  return {
    localStorage,
    ga,
    body: document.body,
    editor: null as any as monaco.editor.IStandaloneCodeEditor,
  };
}

export function run() {
  const deps = getDeps();
  deps.body.style.display = 'block';
  deps.ga('create', 'UA-315420-12', 'auto');

  deps.editor = monaco.editor.create(
      document.getElementById('monaco-container')!, {lineNumbersMinChars: 4});

  registerDialog(document.getElementById('settings'));
  registerDialog(document.getElementById('share'));

  function update(immediate = true) {
    deps.body.dataset['viewType'] = viewType.toString();

    deps.editor.getDomNode().style.display = 'none';
    deps.editor.layout();
    deps.editor.getDomNode().style.display = 'block';

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
        compilerOptionsForViewType(viewType, strictLevel));

    let oldModel = models.script.model;
    switch (strictLevel) {
      case StrictLevel.STRICT:
      case StrictLevel.LOOSE:
        models.script.model = tsModel;
        document.getElementById('ts-tab')!.textContent = 'ts';
        break;
      case StrictLevel.NONE:
        models.script.model = jsModel;
        document.getElementById('ts-tab')!.textContent = 'js';
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
      switchTab('script', document.getElementById('ts-tab')!);
    }
    deps.ga('send', 'event', 'settings', 'changeViewType', ViewType[viewType]);
    update();
  }
  global['onViewChange'] = onViewChange;

  function onStrictChange(level = strictLevel) {
    strictLevel = Number(level);
    deps.ga(
        'send', 'event', 'settings', 'changeStrictLevel',
        StrictLevel[strictLevel]);
    update();
  }
  global['onStrictChange'] = onStrictChange;

  function showSettings() {
    (document.getElementById('settings') as any).showModal();
  }
  global['showSettings'] = showSettings;

  function share() {
    (document.getElementById('share') as any).showModal();
  }
  global['share'] = share;

  let currentTab: 'css'|'html'|'script' = 'script';
  function switchTab(tab: typeof currentTab, tabElement: HTMLElement) {
    models[currentTab].state = deps.editor.saveViewState();
    currentTab = tab;
    for (let elem of Array.from(document.querySelectorAll('#tabbar > li'))) {
      elem.classList.remove('current');
    }
    tabElement.classList.add('current');
    let {model, state} = models[currentTab];
    deps.editor.setModel(model);
    deps.editor.restoreViewState(state);
    deps.editor.focus();
  }
  global['switchTab'] = switchTab;

  function onChangeColorScheme(scheme: string) {
    deps.editor.updateOptions({theme: scheme});
    document.body.dataset['scheme'] = scheme;
    deps.localStorage.setItem('monaco-theme', scheme);
  }
  global['onChangeColorScheme'] = onChangeColorScheme;

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
  global['saveLocalWichSettings'] = saveLocalWichSettings;

  function newWich() {
    deps.ga('send', 'event', 'action', 'newWich', 'fromSidebar');
    window.open(location.toString().split('#')[0]);
  }
  global['newWich'] = newWich;

  // Chrome's scroll-to-go-back is super buggy with Monaco. Disable it.
  // editor.getDomNode().addEventListener('wheel', e => { e.preventDefault();
  // });

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
    let {
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
    (document.getElementById('view-type-select') as HTMLSelectElement).value =
        viewType.toString();
    (document.getElementById('strict-level-select') as HTMLSelectElement)
        .value = strictLevel.toString();
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

  const loopProtectModel =
      monaco.editor.createModel('', 'typescript', monaco.Uri.file('main.ts'));

  const jsModel = monaco.editor.createModel(
      '', 'javascript', monaco.Uri.file('main_raw.js'));
  const tsModel = monaco.editor.createModel(
      '', 'typescript', monaco.Uri.file('main_raw.ts'));

  const models = {
    script: {model: tsModel, state: deps.editor.saveViewState()},
    css: {
      model: monaco.editor.createModel('', 'css', monaco.Uri.file('style.css')),
      state: deps.editor.saveViewState()
    },
    html: {
      model:
          monaco.editor.createModel('', 'html', monaco.Uri.file('index.html')),
      state: deps.editor.saveViewState()
    },
  };

  const outputFrame = document.createElement('iframe');
  const outputText = document.querySelector('#output > pre') as HTMLElement;
  const outputContainer = document.getElementById('output')!;
  outputContainer.appendChild(outputFrame);

  async function updateOutputNow() {
    if (viewType == ViewType.EDITOR_ONLY) return;
    let transpiledScript = '';
    if (models.script.model.getValue() != '') {
      const worker = await monaco.languages.typescript.getTypeScriptWorker();
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
          <style>
            ${models.css.model.getValue()}
          </style>
          <body>
            ${models.html.model.getValue()}
            <script src="${scriptUrl}"></script>
          </body>`;
        setTimeout(() => {
          (outputFrame.contentWindow as WindowExports)['runnerWindow'] =
              loopProtect;
        }, 0);
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

  switchTab('script', document.getElementById('ts-tab')!);

  let theme = deps.localStorage.getItem('monaco-theme');
  if (theme) {
    onChangeColorScheme(theme);
    (document.getElementById('theme-select') as HTMLSelectElement).value =
        theme;
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
      document.getElementById('save-overlay')!.style.display = 'block';
      overlayTimeout = setTimeout(() => {
        document.getElementById('save-overlay')!.style.display = 'none';
      }, 3000);
    }
  });
}
global['run'] = run;
