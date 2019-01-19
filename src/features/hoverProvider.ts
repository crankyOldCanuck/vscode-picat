import {
    CancellationToken,
    Hover,
    HoverProvider,
    MarkedString,
    Position,
    TextDocument,
} from "vscode";
import { Utils } from "../utils/utils";

type Nullable<T> = T | null;

export default class PicatHoverProvider implements HoverProvider {
    public provideHover(
        doc: TextDocument,
        position: Position,
        _token: CancellationToken,
    ): Nullable<Hover> {
        const wordRange: any = doc.getWordRangeAtPosition(position);

        if (!wordRange) {
            return null;
        }

        const pi = Utils.getPredicateUnderCursor(doc, position);
        const descs = Utils.getPredDescriptions(pi);
        const contents: MarkedString[] = [];

        if (descs) {
            contents.push({
                language: "picat",
                value: descs,
            });
        }

        return contents === [] ? null : new Hover(contents, wordRange);
    }
}
