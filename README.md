# vscode-picat README

Basically a fork of arthwang/vsc-picat. It wasn't working for me in Windows so instead of logging issues I thought I would take the opportunity to learn how to write my own vscode extension. Just for fun and seems to be working for me.
Note this is for my own use and I am not planning to publish
this extension to the marketplace.

## Features

  * [Syntax highlighting](#syntax-highlighting)
  * [Snippets](#predicate-snippets)
  * [Information Hovers](#information-hovers)
  * [Run active source file](#run-active-source-file)

## Feature descriptions and usages

### Syntax highlighting

  * Builtin pattern support


### Predicate snippets

  * Predicate templates auto-completion
  * flow controls snippets support
  * Produced from the documents of picat system


### Information hovers
  Hovers show Document information about the predicate under the mouse cursor.

### Grammar linter
  The grammar errors (if any) will display in OUTPUT channel when active source file is saved.

### Run active source file

  * Command `Picat: Open terminal`
    Opens the integrated terminal with the picat command preloaded.
    This is required before attempting to run code.
    This command is available from the command palette as
    well as the editor context menu.

  * Command `Picat: Run document`
    compile the source file in active editor into picat process in the integrated terminal and run the main/0. The picat process provides a real REPL console.
    This command is available from the command palette as
    well as the editor context menu. Also as a convenience
    it is available on the editor title bar. Click
    on the Picat icon.

  * Command `Picat: Show terminal`
    shows the integrated terminal if hidden.
    This command is available from the command palette as
    well as the editor context menu.

  * Command `Picat: Hide terminal`
    hides the integrated terminal if showing.
    This command is available from the command palette as
    well as the editor context menu.


## Extension Settings

This extension contributes the following settings:

* `picat.executablePath`: Points to the Picat executable on    your system. Leave at default (picat) if it is on your
   path. For Windows you need to escape backslashes,
   eg. C:\\\\...

* `picat.clearPreviousOutput`: clears the integrated
   terminal before running a document.

* `picat.preserveFocus`: keeps the focus in your active
   editor after running a document.

## Known Issues

* When you first open VS Code, if the active editor has a
  Picat file opened, the extension is not yet activated.
  This means you won't see the Picat icon in the title bar
  or the commands in the context menu (although they appear in the palette).
  You should switch tabs or open another Picat file to activate the extension.

## Acknowledgements

Arthur Wang who published the extension vsc-picat.

## License

[MIT](http://www.opensource.org/licenses/mit-license.php)

## Release Notes

### 0.0.1

Initial release.
