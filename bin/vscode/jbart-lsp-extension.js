
allExtensionsJsons.push({
	"extensionPath": "jbart-serverless-lsp",
	"packageJSON": {
		"name": "jbart-serverless-lsp",
		"version": "1.0.0",
		"description": "jbart TGP langauge",
		"author": "Shai Ben-Yehuda",
		"license": "MIT",
		"publisher": "artwaresoft",
		"categories": [],
		"keywords": [
			"jbart tgp ui builder low coding"
		],
		"engines": {
			"vscode": "^1.43.0"
		},
		"activationEvents": [
			"onLanguage:jbart"
		],
		"browser": "./jbart-serverless-lsp.js",
		"contributes": {
			"commands": [
				{
					"command": "jbart.applyCompChange",
					"title": "apply component change from text editor"
				},
				{
					"command": "jbart.gotoPath",
					"title": "goto path"
				},
				{
					"command": "jbart.formatComponent",
					"title": "format component"
				},
			],
			"languages": [
				{
					"id": "jbart",
					"extensions": [
						".jb",
						".tgp"
					],
					"aliases": [
						"jBart",
						"tgp"
					],
					"configuration": "./javascript-language-configuration.json"
				}
			],
			"grammars": [
				{
					"language": "jbart",
					"scopeName": "source.js",
					"path": "./syntaxes/JavaScript.tmLanguage.json"
				},
				{
					"scopeName": "source.js.regexp",
					"path": "./syntaxes/Regular Expressions (JavaScript).tmLanguage"
				}
			]
		}
	}
})	
	

