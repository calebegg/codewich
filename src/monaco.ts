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

import "monaco-editor/esm/vs/editor/browser/controller/coreCommands.js";
import "monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js";
import "monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js";
import "monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js";
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js";
import "monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js";
import "monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js";
import "monaco-editor/esm/vs/editor/contrib/colorPicker/colorDetector.js";
import "monaco-editor/esm/vs/editor/contrib/comment/comment.js";
import "monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js";
import "monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js";
import "monaco-editor/esm/vs/editor/contrib/dnd/dnd.js";
import "monaco-editor/esm/vs/editor/contrib/find/findController.js";
import "monaco-editor/esm/vs/editor/contrib/folding/folding.js";
import "monaco-editor/esm/vs/editor/contrib/format/formatActions.js";
// import "monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationCommands.js";
// import "monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationMouse.js";
import "monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js";
import "monaco-editor/esm/vs/editor/contrib/hover/hover.js";
import "monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/links/links.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js";
import "monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js";
// import "monaco-editor/esm/vs/editor/contrib/quickFix/quickFixCommands.js";
// import "monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js";
import "monaco-editor/esm/vs/editor/contrib/rename/rename.js";
import "monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js";
import "monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js";
import "monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js";
import "monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js";
import "monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js";
import "monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js";
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js";
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickOutline.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickOpen/gotoLine.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickCommand.js";
import "monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution.js";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";

(self as any).MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === "json") {
      return new Worker(
        "../node_modules/monaco-editor/esm/vs/language/json/json.worker.js",
      );
    }
    if (label === "css") {
      return new Worker(
        "../node_modules/monaco-editor/esm/vs/language/css/css.worker.js",
      );
    }
    if (label === "html") {
      return new Worker(
        "../node_modules/monaco-editor/esm/vs/language/html/html.worker.js",
      );
    }
    if (label === "typescript" || label === "javascript") {
      return new Worker(
        "../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js",
      );
    }
    return new Worker(
      "../node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
    );
  }
};

export { monaco };
