import {
	createConnection,BrowserMessageReader, BrowserMessageWriter,TextDocuments,Diagnostic,DiagnosticSeverity,ProposedFeatures,
	InitializeParams, DidChangeConfigurationNotification, CompletionItem, CompletionItemKind, TextDocumentPositionParams, TextDocumentSyncKind, InitializeResult
} from 'vscode-languageserver/browser'

import { TextDocument} from 'vscode-languageserver-textdocument'

console.log('running server lsp-web with completionProvider')

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self)
const messageWriter = new BrowserMessageWriter(self)
const connection = createConnection(messageReader, messageWriter)

const documents = new TextDocuments(TextDocument)

jb.extension('workspace', {
    $phase: 60,
    vsContentChanged(textDocument, change) {
        jb.workspace.validate(TextDocument)
    },
    validate(textDocument) {
        const diagnostics = [{
            severity: DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(10),
                end: textDocument.positionAt(15)
            },
            message: `message`,
            source: 'ex'
        }];
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics })
    }
})

connection.onInitialize( params => { 
    return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: { resolveProvider: true },
            workspace: { workspaceFolders: { supported: true } }
		}
    }
})

connection.onInitialized(() => {
	connection.client.register(DidChangeConfigurationNotification.type, undefined)
	connection.workspace.onDidChangeWorkspaceFolders(_event => {
		console.log('Workspace folder change event received.')
    })
})

connection.onDidChangeConfiguration(change => 
	documents.all().forEach(textDocument => jb.workspace.vsContentChanged(textDocument, change) ))

documents.onDidClose(e => {})

documents.onDidChangeContent(change => jb.workspace.vsContentChanged(change.document,globalSettings, change))

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	console.log('We received an file change event')
})


connection.onCompletion((_textDocumentPosition) => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
        {
            label: 'TypeScript',
            kind: CompletionItemKind.Text,
            data: 1
        },
        {
            label: 'JavaScript',
            kind: CompletionItemKind.Text,
            data: 2
        }
    ]
})
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
    if (item.data === 1) {
        item.detail = 'TypeScript details'
        item.documentation = 'TypeScript documentation'
    }
    else if (item.data === 2) {
        item.detail = 'JavaScript details'
        item.documentation = 'JavaScript documentation'
    }
    return item
})    

documents.listen(connection)
connection.listen()
