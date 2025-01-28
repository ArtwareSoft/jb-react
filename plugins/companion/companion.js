using('llm-api','tgp-lang-service')

extension('companion','main', {
    initCompanion({context}) {
        jb.companion.vsCodeContext = context
    },

    async openView() { // ctrl-shift-C
        vscodeNS.commands.executeCommand('workbench.action.editorLayoutTwoRows')
        const compProps = jb.tgpTextEditor.host.compTextAndCursor()

        const view = vscodeNS.window.createWebviewPanel(
            'companion.main', 'Fix Component', vscodeNS.ViewColumn.Two, { enableScripts: true })
        
          view.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Fix Component</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
                textarea { width: 100%; height: 200px; }
                button { margin-top: 10px; padding: 10px; background: #007acc; color: white; }
              </style>
            </head>
            <body>
              <h3>Specify Fixes for Component</h3>
              <textarea id="inputBox" placeholder="Enter your fixes here..."></textarea>
              <button id="submit">Submit</button>
              <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('submit').addEventListener('click', () => {
                  const input = document.getElementById('inputBox').value;
                  vscode.postMessage({ type: 'submit', value: input });
                });
              </script>
            </body>
            </html>
          `;
        
          // Listen for messages from the webview
          view.webview.onDidReceiveMessage(
            (message) => {
              if (message.type === 'submit') {
                const fixesRequest = message.value.trim()
                if (fixesRequest) {
                  vscodeNS.window.showInformationMessage(`Fix request received: "${fixesRequest}"`);
                  // Handle the fix logic here (e.g., send the request to your LLM)
                } else {
                  vscodeNS.window.showWarningMessage("Input cannot be empty.");
                }
              }
            },
            undefined,
            jb.companion.vsCodeContext.subscriptions
          )
    },

    fixComponent() { // how is it activated?
    
    }
})