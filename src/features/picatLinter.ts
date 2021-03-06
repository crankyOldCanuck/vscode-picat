import { spawn } from "process-promises";
import {
    CancellationToken,
    CodeActionContext,
    CodeActionProvider,
    Command,
    Disposable,
    ExtensionContext,
    OutputChannel,
    Range,
    TextDocument,
    window,
    workspace,
} from "vscode";

type Nullable<T> = T | null;

export default class PicatLinter implements CodeActionProvider {
    private _executable: string;
    private _documentListener!: Disposable;
    private _openDocumentListener!: Disposable;
    private _outputChannel: Nullable<OutputChannel> = null;

    constructor(private context: ExtensionContext) {
        this._executable = "";
    }

    public provideCodeActions(
        _document: TextDocument,
        _range: Range,
        _context: CodeActionContext,
        _token: CancellationToken,
    ): Command[] | Thenable<Command[]> {
        const codeActions: Command[] = [];

        return codeActions;
    }

    public activate(): void {
        const subscriptions: Disposable[] = this.context.subscriptions;

        workspace.onDidChangeConfiguration(this.loadConfiguration, this, subscriptions);
        this.loadConfiguration();

        if (this._outputChannel === null) {
            this._outputChannel = window.createOutputChannel("PicatLinter");
            this._outputChannel.clear();
        }
    }

    public dispose(): void {
        if (this._documentListener) {
            this._documentListener.dispose();
        }

        if (this._openDocumentListener) {
            this._openDocumentListener.dispose();
        }
    }

    private outputMsg(msg: string) {
        if (this._outputChannel) {
            this._outputChannel.append(msg + "\n");
            this._outputChannel.show(true);
        }
    }

    private loadConfiguration(): void {
        const section = workspace.getConfiguration("picat");

        if (section) {
            this._executable = section.get<string>("executablePath", "picat");
            this.dispose();
        }

        this._documentListener = workspace.onDidSaveTextDocument(this.doPlint, this);
        this._openDocumentListener = workspace.onDidOpenTextDocument((e) => {
            this.doPlint(e);
        });

        workspace.textDocuments.forEach(this.doPlint, this);
    }

    private doPlint(doc: TextDocument) {
        if (doc.languageId !== "picat") {
            return;
        }

        const options = workspace.rootPath
            ? {
                  cwd: workspace.rootPath,
                  encoding: "utf8",
              }
            : undefined;

        const args: string[] = ["-g", `cl('${doc.fileName.replace(/\\/g, "\\\\")}')`];

        spawn(this._executable, args, options)
            .on("process", (proc: any) => {
                if (proc.pid) {
                    if (this._outputChannel) {
                        this._outputChannel.clear();
                    }
                }
            })
            .on("stderr", (err: string) => {
                if (/^\s*\*\*/.test(err)) {
                    this.outputMsg(err + "\n");
                }
            })
            .then(
                // tslint:disable-next-line:no-empty
                (_result) => {},
                (err) => {
                    let message = "";

                    if (err.code === "ENOENT") {
                        // tslint:disable-next-line:max-line-length
                        message = `Cannot lint the Picat file. The Picat executable was not found at ${this._executable}. Use the Picat Executable Path setting to configure.`;
                    } else {
                        message = err.message
                            ? err.message
                            : `Failed to run picat executable using path: ${
                                  this._executable
                              }. Reason is unknown.`;
                    }

                    this.outputMsg(message);
                },
            );
    }
}
