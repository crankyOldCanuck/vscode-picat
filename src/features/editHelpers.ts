import {
    Disposable,
    IndentAction,
    languages,
    Position,
    Range,
    Selection,
    TextDocument,
    window,
    workspace,
} from "vscode";

export function loadEditHelpers(subscriptions: Disposable[]) {
    subscriptions.push(
        languages.setLanguageConfiguration("picat", {
            indentationRules: {
                decreaseIndentPattern: /(\s*\)|\s*\])$/,
                increaseIndentPattern: /(.*=>\s*|.*->\s*|.+\[|.+\()$/,
            },
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
            onEnterRules: [
                {
                    beforeText: /(^\s*|.*%.+)$/,
                    action: { indentAction: IndentAction.None },
                },
                {
                    beforeText: /=>|foreach.+|then|.+\([^\)]*$/,
                    action: { indentAction: IndentAction.Indent },
                },
                {
                    beforeText: /(.+\.|[^,;])$/,
                    action: { indentAction: IndentAction.Outdent },
                },
                {
                    // e.g. /** | */
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    afterText: /^\s*\*\/$/,
                    action: {
                        indentAction: IndentAction.IndentOutdent,
                        appendText: " * ",
                    },
                },
                {
                    // e.g. /** ...|
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    action: { indentAction: IndentAction.None, appendText: " * " },
                },
                {
                    // e.g.  * ...|
                    beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                    action: { indentAction: IndentAction.None, appendText: "* " },
                },
                {
                    // e.g.  */|
                    beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                    action: { indentAction: IndentAction.None, removeText: 1 },
                },
                {
                    // e.g.  *-----*/|
                    beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                    action: { indentAction: IndentAction.None, removeText: 1 },
                },
            ],
        }),
    );

    function getPreviousClauseHead(doc: TextDocument, line: number): string {
        if (line <= 0) {
            return "";
        }

        const txt = doc.lineAt(line).text;
        let regex = new RegExp("^\\s*(.+)(:-|-->)");

        if (regex.test(txt)) {
            const matches = txt.match(regex);

            if (matches !== null) {
                return matches[1];
            }
        }

        regex = new RegExp("^\\s*(.+)\\.$");

        if (regex.test(txt)) {
            let i = line - 1;

            while (/^\s*$/.test(doc.lineAt(i).text)) {
                i--;
            }

            if (doc.lineAt(i).text.endsWith(".")) {
                const matches = txt.match(regex);

                if (matches !== null) {
                    return matches[1];
                }
            }
        }

        return getPreviousClauseHead(doc, line - 1);
    }

    function isRecursive(doc: TextDocument, line: number) {
        if (line <= 0) {
            return false;
        }

        let i = line - 1;

        while (/^\s*$/.test(doc.lineAt(i).text)) {
            i--;
        }

        return /,$/.test(doc.lineAt(i).text) ? true : false;
    }

    function nextRecursiceParams(doc: TextDocument, line: number, originalHead: string): string {
        if (!/\(/.test(originalHead)) {
            return originalHead;
        }

        const regex = new RegExp("([^(]+)\\((.+)\\)\\s*$");
        const match = originalHead.match(regex);
        let origList: string[] = [];

        if (match !== null) {
            origList = match[2].split(",");
        }

        const newList = origList.map((param) => {
            const param1 = param.trim();
            const match1 = param1.match(/^\[.+\|(.+)\]$/);

            if (match1) {
                return match1[1];
            } else if (/^[A-Z]/.test(param1)) {
                let i = line;

                while (!/:-/.test(doc.lineAt(i).text)) {
                    const match2 = doc
                        .lineAt(i)
                        .text.match("^\\s*(\\w+)\\s+is\\s+.*\\b" + param1 + "\\b");
                    if (match2) {
                        return match2[1];
                    } else {
                        i--;
                    }
                }

                return param1;
            } else {
                return param1;
            }
        });

        let retStr = "";

        if (match !== null) {
            retStr = match[1] + "(" + newList.join(", ") + ")";
        }

        return retStr;
    }

    workspace.onDidChangeTextDocument(
        (e) => {
            const lastChange = e.contentChanges[0];
            const lastChar = lastChange.text;
            const range = lastChange.range;
            const start = range.start;
            const line = start.line;
            const col = start.character;
            const editor = window.activeTextEditor;
            const lineTxt = e.document.lineAt(line).text;

            if (lastChar === "_") {
                const before = lineTxt.substring(0, col);
                const after = lineTxt.substring(col + 1);
                if (
                    before.lastIndexOf(")") < before.lastIndexOf("(") &&
                    /\W$/.test(before) &&
                    /^\w/.test(after)
                ) {
                    let varLength: any = after.match("^(\\w+)\\b");
                    varLength = varLength[1].length;

                    if (editor) {
                        editor.edit((edit) => {
                            edit.delete(
                                new Range(
                                    new Position(line, col + 1),
                                    new Position(line, col + varLength + 1),
                                ),
                            );
                        });
                    }
                }
            } else if (/^\s*\.$/.test(lineTxt)) {
                let prevHead: string = getPreviousClauseHead(e.document, line - 1);

                if (isRecursive(e.document, line)) {
                    prevHead = nextRecursiceParams(e.document, line - 1, prevHead);
                }

                if (editor) {
                    editor
                        .edit((edit) => {
                            edit.replace(new Range(start, new Position(line, col + 1)), prevHead);
                        })
                        .then(() => {
                            let loc = prevHead.indexOf("(");
                            loc = loc > -1 ? loc + 1 : prevHead.length - 1;
                            const end = new Position(line, col + loc);

                            if (editor) {
                                editor.selection = new Selection(end, end);
                            }
                        });
                }
            } else {
                return;
            }
        },
        null,
        subscriptions,
    );
}
