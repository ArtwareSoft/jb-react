
const vscode = require('vscode');
if (importScripts.native) { // browser worker
    jbBaseUrl = location.origin || ''
    jbFetchFile = fetch.native && (path => fetch.native(path).then(x=>x.text()))
    importScripts.native(location.origin+'/src/loader/jb-loader.js')
} else { // nodejs
    jbBaseUrl = __dirname.replace(/\/hosts\/vscode$/)
    const loaderCode = require('fs').readFileSync(`${jbBaseUrl}/src/loader/jb-loader.js`) + '\n//# sourceURL=jb-loader.js'
    require('vm').runInThisContext(loaderCode)
    jbFetchFile = url => require('util').promisify(require('fs').readFile)(url)
    // define fileSymbolsFunc      
}
 
async function activate(context) {
    globalThis.jb = globalThis.jb || (globalThis.jbInit && await jbInit('jbart-lsp-server',{}))

	const provider1 = vscode.languages.registerCompletionItemProvider('jbart', {

		async provideCompletionItems(document, position, token, context) {
            console.log('a',document.getText())
			// a simple completion item which inserts `Hello World!`
			const simpleCompletion = new vscode.CompletionItem('Hello World!');
			const simpleCompletion2 = new vscode.CompletionItem('Hey!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const commitCharacterCompletion = new vscode.CompletionItem('console');
			commitCharacterCompletion.commitCharacters = ['.'];
			commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after 
			// completion has been inserted. Also, the `insertText` is set so that 
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				simpleCompletion,
                simpleCompletion2,
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'jbart',
		{
			provideCompletionItems(document, position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider1, provider2);
}

module.exports = { activate }