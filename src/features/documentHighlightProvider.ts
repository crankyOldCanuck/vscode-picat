import {
    CancellationToken,
    DocumentHighlight,
    DocumentHighlightProvider,
    Position,
    Range,
    TextDocument,
} from "vscode";

export default class PicatDocumentHighlightProvider implements DocumentHighlightProvider {
    public provideDocumentHighlights(
        doc: TextDocument,
        position: Position,
        _token: CancellationToken,
    ): Thenable<DocumentHighlight[]> | DocumentHighlight[] {
        const docHilite: DocumentHighlight[] = [];
        const wordRange = doc.getWordRangeAtPosition(position);

        if (!wordRange) {
            return [];
        }

        const symbol = doc.getText(wordRange);
        const symbolLen = symbol.length;
        let line = 0;
        const re = new RegExp("\\b" + symbol + "\\b", "g");

        while (line < doc.lineCount) {
            const lineTxt = doc.lineAt(line).text;
            let match = re.exec(lineTxt);

            while (match) {
                docHilite.push(
                    new DocumentHighlight(
                        new Range(line, match.index, line, match.index + symbolLen),
                    ),
                );
                match = re.exec(lineTxt);
            }

            line++;
        }

        return docHilite;
    }
}
