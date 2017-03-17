# CodeWich

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
        `#`), the CodeWich webserver doesn't even log your code snippets.
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

[Pako]: https://github.com/nodeca/pako
[Monaco Editor]: https://github.com/Microsoft/monaco-editor
[Loop Protect]: https://github.com/jsbin/loop-protect
[JSBin]: http://jsbin.com/

## Development

    yarn install

### Building

    ./build.sh

### Testing

    tsc --watch
    ./test.sh
