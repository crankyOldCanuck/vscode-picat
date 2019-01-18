import {
    HoverProvider,
    TextDocument,
    Position,
    CancellationToken,
    Hover,
    MarkedString
} from "vscode";
import { Utils } from "../utils/utils";

type Nullable<T> = T | null;

export default class PicatHoverProvider implements HoverProvider {
    public provideHover(
        doc: TextDocument,
        position: Position,
        token: CancellationToken
    ): Nullable<Hover> {
        let wordRange: any = doc.getWordRangeAtPosition(position);

        if (!wordRange) {
            return null;
        }

        const pi = Utils.getPredicateUnderCursor(doc, position);
        const descs = Utils.getPredDescriptions(pi);
        let contents: MarkedString[] = [];

        if (descs) {
            contents.push({
                language: "picat",
                value: descs
            });
        }

        return contents === [] ? null : new Hover(contents, wordRange);
    }
}
