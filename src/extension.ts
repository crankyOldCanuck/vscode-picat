// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import PicatDocumentHighlightProvider from "./features/documentHighlightProvider";
import { loadEditHelpers } from "./features/editHelpers";
import PicatHoverProvider from "./features/hoverProvider";
import PicatLinter from "./features/picatLinter";
import { Utils } from "./utils/utils";

export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "picat" is now active!');

    const PICAT_MODE: vscode.DocumentFilter = { language: "picat", scheme: "file" };

    loadEditHelpers(context.subscriptions);

    const linter = new PicatLinter(context);
    linter.activate();

    Utils.init(context);

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            PICAT_MODE,
            new PicatHoverProvider(),
        ),
    );
    context.subscriptions.push(
        vscode.languages.registerDocumentHighlightProvider(
            PICAT_MODE,
            new PicatDocumentHighlightProvider(),
        ),
    );
    context.subscriptions.push(
        // The active terminal is the one that currently has focus
        // or most recently had focus. Thus it must be given
        // the focus when opened.
        vscode.commands.registerCommand("extension.open", () => {
            const terminal = vscode.window.createTerminal("Picat");
            const config = vscode.workspace.getConfiguration("picat");
            const path = config.get<string>("executablePath", "picat");

            terminal.sendText(path);
            terminal.show();
        }),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.hide", () => {
            const terminal = vscode.window.activeTerminal;

            if (terminal) {
                terminal.hide();
            } else {
                vscode.window.showErrorMessage("No active terminal");
            }
        }),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.show", () => {
            const terminal = vscode.window.activeTerminal;
            const config = vscode.workspace.getConfiguration("picat", null);
            const preserveFocus = config.get<boolean>("preserveFocus", true);

            if (terminal) {
                terminal.show(preserveFocus);
            } else {
                vscode.window.showErrorMessage("No active terminal.");
            }
        }),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.run", () => {
            const terminal = vscode.window.activeTerminal;
            const editor = vscode.window.activeTextEditor;

            if (!terminal || terminal.name !== "Picat") {
                vscode.window.showErrorMessage("Please open a Picat terminal first.");
            } else {
                if (editor) {
                    const config = vscode.workspace.getConfiguration("picat", null);
                    const clearPreviousOutput = config.get<boolean>("clearPreviousOutput", true);
                    const preserveFocus = config.get<boolean>("preserveFocus", true);

                    const goals = "cl('" + editor.document.fileName.replace(/\\/g, "\\\\") + "'), main.";

                    if (editor.document.isDirty) {
                        editor.document.save().then((_) => {
                            if (clearPreviousOutput) {
                                vscode.commands.executeCommand("workbench.action.terminal.clear");
                            }
                            if (terminal) {
                                terminal.sendText(goals);
                            }
                        });
                    } else {
                        if (clearPreviousOutput) {
                            vscode.commands.executeCommand("workbench.action.terminal.clear");
                        }

                        terminal.sendText(goals);
                    }

                    terminal.show(preserveFocus);
                } else {
                    vscode.window.showErrorMessage("No active editor.");
                }
            }
        }),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.dispose", () => {
            const terminal = vscode.window.activeTerminal;

            if (terminal) {
                terminal.dispose();
            } else {
                vscode.window.showErrorMessage("No active terminals");
            }
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
