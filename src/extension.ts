// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import PicatLinter from "./features/picatLinter";

export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "picat" is now active!');

    let linter = new PicatLinter(context);
    linter.activate();

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.open", () => {
            let terminal = vscode.window.createTerminal("Picat");
            terminal.sendText("picat");
            terminal.show();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.hide", () => {
            let terminal = vscode.window.activeTerminal;

            if (terminal) {
                terminal.hide();
            }
            else {
                vscode.window.showErrorMessage("No active terminal");
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.show", () => {
            let terminal = vscode.window.activeTerminal;
            let config = vscode.workspace.getConfiguration("picat", null);
            let preserveFocus = config.get<boolean>("preserveFocus", true);

            if (terminal) {
                terminal.show(preserveFocus);
            }
            else {
                vscode.window.showErrorMessage("No active terminal");
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.run", () => {
            let terminal = vscode.window.activeTerminal;
            let editor = vscode.window.activeTextEditor;

            if (!terminal) {
                vscode.window.showErrorMessage("No active terminal");
            }
            else {
                if (editor) {
                    let config = vscode.workspace.getConfiguration("picat", null);
                    let clearPreviousOutput = config.get<boolean>("clearPreviousOutput", true);
                    let preserveFocus = config.get<boolean>("preserveFocus", true);

                    let goals = "cl('" + editor.document.fileName.replace(/\\/g, "\\\\") + "'), main.";

                    if (editor.document.isDirty) {
                        editor.document.save().then(_ => {
                            if (clearPreviousOutput) {
                                vscode.commands.executeCommand("workbench.action.terminal.clear");
                            }
                            if (terminal) {
                                terminal.sendText(goals);
                            }
                        });
                    }
                    else {
                        if (clearPreviousOutput) {
                            vscode.commands.executeCommand("workbench.action.terminal.clear");
                        }

                        terminal.sendText(goals);
                    }

                    terminal.show(preserveFocus);
                }
                else {
                    vscode.window.showErrorMessage("No active editor");
                }
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.dispose", () => {
            let terminal = vscode.window.activeTerminal;

            if (terminal) {
                terminal.dispose();
            }
            else {
                vscode.window.showErrorMessage("No active terminals");
            }
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
