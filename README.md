# CodeWich

[![Build Status]](https://travis-ci.org/calebegg/codewich)

[Build Status]: https://travis-ci.org/calebegg/codewich.svg?branch=master

CodeWich is a web app you can use to write small, self-contained snippets of
TypeScript/JavaScript, CSS, and HTML, and to preview a simple page that combines
them. The preview updates live as you type. It's similar to JSFiddle, JSBin,
CodePen, and others.

This is not an official Google product.

## Features

 *  Native support for TypeScript, including error highlighting and
    autocompletion.
 *  Your code is automatically run as you type.
 *  Code snippets you write are automatically saved in a compressed form in the
    URL. This has a few benefits:
     *  Your code never leaves your machine unless you decide to share your URL.
        Since the snippet is stored in the URL fragment (the part after the
        `#`), the CodeWich web server doesn't even log your code snippets.
     *  You don't have to rely on CodeWich's availability. You can download your
        own copy and run it locally, or host it somewhere you control, and
        you'll always be able to decode your CodeWich URLs to get the original
        code.

## CodeWich uses

 *  [Pako] for compression
 *  [Monaco Editor] for the editor (as well as error highlighting,
    autocompletion, and TypeScript transpilation).
 *  [Loop Protect] from [JSBin] to prevent accidental infinite for/while loops
    from breaking your tab.
 *  [Firebase] for static hosting

[Pako]: https://github.com/nodeca/pako
[Monaco Editor]: https://github.com/Microsoft/monaco-editor
[Loop Protect]: https://github.com/jsbin/loop-protect
[JSBin]: https://jsbin.com/
[Firebase]: https://firebase.google.com/docs/hosting/

## Development

### Setup

 *  [Install yarn]
 *  `yarn install`

 [Install yarn]: https://yarnpkg.com/lang/en/docs/install/

### Running locally

    ./build.sh dev
    ./node_modules/.bin/live-server build/dev

### Testing

    tsc --watch &
    ./test.sh

### Deploying

    ./build.sh prod
    ./node_modules/.bin/firebase deploy
