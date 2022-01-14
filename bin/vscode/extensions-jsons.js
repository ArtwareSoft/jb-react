var allExtensionsJsons = [
	{
		"extensionPath": "extension-editing",
		"packageJSON": {
			"name": "extension-editing",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "^1.4.0"
			},
			"icon": "images/icon.png",
			"activationEvents": [
				"onLanguage:json",
				"onLanguage:markdown"
			],
			"main": "./dist/extensionEditingMain",
			"browser": "./dist/browser/extensionEditingBrowserMain",
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"contributes": {
				"jsonValidation": [
					{
						"fileMatch": "package.json",
						"url": "vscode://schemas/vscode-extensions"
					},
					{
						"fileMatch": "*language-configuration.json",
						"url": "vscode://schemas/language-configuration"
					},
					{
						"fileMatch": [
							"*icon-theme.json",
							"!*product-icon-theme.json"
						],
						"url": "vscode://schemas/icon-theme"
					},
					{
						"fileMatch": "*product-icon-theme.json",
						"url": "vscode://schemas/product-icon-theme"
					},
					{
						"fileMatch": "*color-theme.json",
						"url": "vscode://schemas/color-theme"
					}
				],
				"languages": [
					{
						"id": "ignore",
						"filenames": [
							".vscodeignore"
						]
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Extension Authoring",
			"description": "Provides linting capabilities for authoring extensions."
		}
	},
	{
		"extensionPath": "github-authentication",
		"packageJSON": {
			"name": "github-authentication",
			"displayName": "%displayName%",
			"description": "%description%",
			"publisher": "vscode",
			"license": "MIT",
			"version": "0.0.2",
			"engines": {
				"vscode": "^1.41.0"
			},
			"icon": "images/icon.png",
			"categories": [
				"Other"
			],
			"extensionKind": [
				"ui",
				"workspace"
			],
			"activationEvents": [
				"onAuthenticationRequest:github",
				"onAuthenticationRequest:github-enterprise"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"contributes": {
				"authentication": [
					{
						"label": "GitHub",
						"id": "github"
					},
					{
						"label": "GitHub Enterprise",
						"id": "github-enterprise"
					}
				],
				"configuration": {
					"title": "GitHub Enterprise Authentication Provider",
					"properties": {
						"github-enterprise.uri": {
							"type": "string",
							"description": "URI of your GitHub Enterprise Instance"
						}
					}
				}
			},
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"main": "./dist/extension.js",
			"browser": "./dist/browser/extension.js",
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "GitHub Authentication",
			"description": "GitHub Authentication Provider"
		},
		"readmePath": "github-authentication/README.md"
	},
	{
		"extensionPath": "html",
		"packageJSON": {
			"name": "html",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammar.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "html",
						"extensions": [
							".html",
							".htm",
							".shtml",
							".xhtml",
							".xht",
							".mdoc",
							".jsp",
							".asp",
							".aspx",
							".jshtm",
							".volt",
							".ejs",
							".rhtml"
						],
						"aliases": [
							"HTML",
							"htm",
							"html",
							"xhtml"
						],
						"mimetypes": [
							"text/html",
							"text/x-jshtm",
							"text/template",
							"text/ng-template",
							"application/xhtml+xml"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"scopeName": "text.html.basic",
						"path": "./syntaxes/html.tmLanguage.json",
						"embeddedLanguages": {
							"text.html": "html",
							"source.css": "css",
							"source.js": "javascript",
							"source.python": "python",
							"source.smarty": "smarty"
						},
						"tokenTypes": {
							"meta.tag string.quoted": "other"
						}
					},
					{
						"language": "html",
						"scopeName": "text.html.derivative",
						"path": "./syntaxes/html-derivative.tmLanguage.json",
						"embeddedLanguages": {
							"text.html": "html",
							"source.css": "css",
							"source.js": "javascript",
							"source.python": "python",
							"source.smarty": "smarty"
						},
						"tokenTypes": {
							"meta.tag string.quoted": "other"
						}
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "HTML Language Basics",
			"description": "Provides syntax highlighting, bracket matching & snippets in HTML files."
		}
	},
	{
		"extensionPath": "html-language-features",
		"packageJSON": {
			"name": "html-language-features",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "0.10.x"
			},
			"icon": "icons/html.png",
			"activationEvents": [
				"onLanguage:html",
				"onLanguage:handlebars"
			],
			"main": "./client/dist/node/htmlClientMain",
			"browser": "./client/dist/browser/htmlClientMain",
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"categories": [
				"Programming Languages"
			],
			"contributes": {
				"configuration": {
					"id": "html",
					"order": 20,
					"type": "object",
					"title": "HTML",
					"properties": {
						"html.completion.attributeDefaultValue": {
							"type": "string",
							"scope": "resource",
							"enum": [
								"doublequotes",
								"singlequotes",
								"empty"
							],
							"enumDescriptions": [
								"%html.completion.attributeDefaultValue.doublequotes%",
								"%html.completion.attributeDefaultValue.singlequotes%",
								"%html.completion.attributeDefaultValue.empty%"
							],
							"default": "doublequotes",
							"description": "%html.completion.attributeDefaultValue%"
						},
						"html.customData": {
							"type": "array",
							"markdownDescription": "%html.customData.desc%",
							"default": [],
							"items": {
								"type": "string"
							},
							"scope": "resource"
						},
						"html.format.enable": {
							"type": "boolean",
							"scope": "window",
							"default": true,
							"description": "%html.format.enable.desc%"
						},
						"html.format.wrapLineLength": {
							"type": "integer",
							"scope": "resource",
							"default": 120,
							"description": "%html.format.wrapLineLength.desc%"
						},
						"html.format.unformatted": {
							"type": [
								"string",
								"null"
							],
							"scope": "resource",
							"default": "wbr",
							"markdownDescription": "%html.format.unformatted.desc%"
						},
						"html.format.contentUnformatted": {
							"type": [
								"string",
								"null"
							],
							"scope": "resource",
							"default": "pre,code,textarea",
							"markdownDescription": "%html.format.contentUnformatted.desc%"
						},
						"html.format.indentInnerHtml": {
							"type": "boolean",
							"scope": "resource",
							"default": false,
							"markdownDescription": "%html.format.indentInnerHtml.desc%"
						},
						"html.format.preserveNewLines": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.format.preserveNewLines.desc%"
						},
						"html.format.maxPreserveNewLines": {
							"type": [
								"number",
								"null"
							],
							"scope": "resource",
							"default": null,
							"markdownDescription": "%html.format.maxPreserveNewLines.desc%"
						},
						"html.format.indentHandlebars": {
							"type": "boolean",
							"scope": "resource",
							"default": false,
							"markdownDescription": "%html.format.indentHandlebars.desc%"
						},
						"html.format.endWithNewline": {
							"type": "boolean",
							"scope": "resource",
							"default": false,
							"description": "%html.format.endWithNewline.desc%"
						},
						"html.format.extraLiners": {
							"type": [
								"string",
								"null"
							],
							"scope": "resource",
							"default": "head, body, /html",
							"markdownDescription": "%html.format.extraLiners.desc%"
						},
						"html.format.wrapAttributes": {
							"type": "string",
							"scope": "resource",
							"default": "auto",
							"enum": [
								"auto",
								"force",
								"force-aligned",
								"force-expand-multiline",
								"aligned-multiple",
								"preserve",
								"preserve-aligned"
							],
							"enumDescriptions": [
								"%html.format.wrapAttributes.auto%",
								"%html.format.wrapAttributes.force%",
								"%html.format.wrapAttributes.forcealign%",
								"%html.format.wrapAttributes.forcemultiline%",
								"%html.format.wrapAttributes.alignedmultiple%",
								"%html.format.wrapAttributes.preserve%",
								"%html.format.wrapAttributes.preservealigned%"
							],
							"description": "%html.format.wrapAttributes.desc%"
						},
						"html.format.wrapAttributesIndentSize": {
							"type": [
								"number",
								"null"
							],
							"scope": "resource",
							"default": null,
							"markdownDescription": "%html.format.wrapAttributesIndentSize.desc%"
						},
						"html.format.templating": {
							"type": "boolean",
							"scope": "resource",
							"default": false,
							"description": "%html.format.templating.desc%"
						},
						"html.format.unformattedContentDelimiter": {
							"type": "string",
							"scope": "resource",
							"default": "",
							"markdownDescription": "%html.format.unformattedContentDelimiter.desc%"
						},
						"html.suggest.html5": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.suggest.html5.desc%"
						},
						"html.validate.scripts": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.validate.scripts%"
						},
						"html.validate.styles": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.validate.styles%"
						},
						"html.autoCreateQuotes": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.autoCreateQuotes%"
						},
						"html.autoClosingTags": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.autoClosingTags%"
						},
						"html.hover.documentation": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.hover.documentation%"
						},
						"html.hover.references": {
							"type": "boolean",
							"scope": "resource",
							"default": true,
							"description": "%html.hover.references%"
						},
						"html.mirrorCursorOnMatchingTag": {
							"type": "boolean",
							"scope": "resource",
							"default": false,
							"description": "%html.mirrorCursorOnMatchingTag%",
							"deprecationMessage": "%html.mirrorCursorOnMatchingTagDeprecationMessage%"
						},
						"html.trace.server": {
							"type": "string",
							"scope": "window",
							"enum": [
								"off",
								"messages",
								"verbose"
							],
							"default": "off",
							"description": "%html.trace.server.desc%"
						}
					}
				},
				"configurationDefaults": {
					"[html]": {
						"editor.suggest.insertMode": "replace"
					},
					"[handlebars]": {
						"editor.suggest.insertMode": "replace"
					}
				},
				"jsonValidation": [
					{
						"fileMatch": "*.html-data.json",
						"url": "https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/master/docs/customData.schema.json"
					},
					{
						"fileMatch": "package.json",
						"url": "./schemas/package.schema.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "HTML Language Features",
			"description": "Provides rich language support for HTML and Handlebar files",
			"html.customData.desc": "A list of relative file paths pointing to JSON files following the [custom data format](https://github.com/microsoft/vscode-html-languageservice/blob/master/docs/customData.md).\n\nVS Code loads custom data on startup to enhance its HTML support for the custom HTML tags, attributes and attribute values you specify in the JSON files.\n\nThe file paths are relative to workspace and only workspace folder settings are considered.",
			"html.format.enable.desc": "Enable/disable default HTML formatter.",
			"html.format.wrapLineLength.desc": "Maximum amount of characters per line (0 = disable).",
			"html.format.unformatted.desc": "List of tags, comma separated, that shouldn't be reformatted. `null` defaults to all tags listed at https://www.w3.org/TR/html5/dom.html#phrasing-content.",
			"html.format.contentUnformatted.desc": "List of tags, comma separated, where the content shouldn't be reformatted. `null` defaults to the `pre` tag.",
			"html.format.indentInnerHtml.desc": "Indent `<head>` and `<body>` sections.",
			"html.format.preserveNewLines.desc": "Controls whether existing line breaks before elements should be preserved. Only works before elements, not inside tags or for text.",
			"html.format.maxPreserveNewLines.desc": "Maximum number of line breaks to be preserved in one chunk. Use `null` for unlimited.",
			"html.format.indentHandlebars.desc": "Format and indent `{{#foo}}` and `{{/foo}}`.",
			"html.format.endWithNewline.desc": "End with a newline.",
			"html.format.extraLiners.desc": "List of tags, comma separated, that should have an extra newline before them. `null` defaults to `\"head, body, /html\"`.",
			"html.format.wrapAttributes.desc": "Wrap attributes.",
			"html.format.wrapAttributes.auto": "Wrap attributes only when line length is exceeded.",
			"html.format.wrapAttributes.force": "Wrap each attribute except first.",
			"html.format.wrapAttributes.forcealign": "Wrap each attribute except first and keep aligned.",
			"html.format.wrapAttributes.forcemultiline": "Wrap each attribute.",
			"html.format.wrapAttributes.alignedmultiple": "Wrap when line length is exceeded, align attributes vertically.",
			"html.format.wrapAttributes.preserve": "Preserve wrapping of attributes.",
			"html.format.wrapAttributes.preservealigned": "Preserve wrapping of attributes but align.",
			"html.format.templating.desc": "Honor django, erb, handlebars and php templating language tags.",
			"html.format.unformattedContentDelimiter.desc": "Keep text content together between this string.",
			"html.format.wrapAttributesIndentSize.desc": "Indent wrapped attributes to after N characters. Use `null` to use the default indent size. Ignored if `#html.format.wrapAttributes#` is set to 'aligned'.",
			"html.suggest.html5.desc": "Controls whether the built-in HTML language support suggests HTML5 tags, properties and values.",
			"html.trace.server.desc": "Traces the communication between VS Code and the HTML language server.",
			"html.validate.scripts": "Controls whether the built-in HTML language support validates embedded scripts.",
			"html.validate.styles": "Controls whether the built-in HTML language support validates embedded styles.",
			"html.autoCreateQuotes": "Enable/disable auto creation of quotes for HTML attribute assignment.",
			"html.autoClosingTags": "Enable/disable autoclosing of HTML tags.",
			"html.completion.attributeDefaultValue": "Controls the default value for attributes when completion is accepted.",
			"html.completion.attributeDefaultValue.doublequotes": "Attribute value is set to \"\".",
			"html.completion.attributeDefaultValue.singlequotes": "Attribute value is set to ''.",
			"html.completion.attributeDefaultValue.empty": "Attribute value is not set.",
			"html.mirrorCursorOnMatchingTag": "Enable/disable mirroring cursor on matching HTML tag.",
			"html.mirrorCursorOnMatchingTagDeprecationMessage": "Deprecated in favor of `editor.linkedEditing`",
			"html.hover.documentation": "Show tag and attribute documentation in hover.",
			"html.hover.references": "Show references to MDN in hover."
		},
		"readmePath": "html-language-features/README.md"
	},
	{
		"extensionPath": "image-preview",
		"packageJSON": {
			"name": "image-preview",
			"displayName": "%displayName%",
			"description": "%description%",
			"extensionKind": [
				"ui",
				"workspace"
			],
			"version": "1.0.0",
			"publisher": "vscode",
			"icon": "icon.png",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "^1.39.0"
			},
			"main": "./dist/extension",
			"browser": "./dist/browser/extension.js",
			"categories": [
				"Other"
			],
			"activationEvents": [
				"onCustomEditor:imagePreview.previewEditor",
				"onCommand:imagePreview.zoomIn",
				"onCommand:imagePreview.zoomOut"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"contributes": {
				"customEditors": [
					{
						"viewType": "imagePreview.previewEditor",
						"displayName": "%customEditors.displayName%",
						"priority": "builtin",
						"selector": [
							{
								"filenamePattern": "*.{jpg,jpe,jpeg,png,bmp,gif,ico,webp,avif}"
							}
						]
					}
				],
				"commands": [
					{
						"command": "imagePreview.zoomIn",
						"title": "%command.zoomIn%",
						"category": "Image Preview"
					},
					{
						"command": "imagePreview.zoomOut",
						"title": "%command.zoomOut%",
						"category": "Image Preview"
					}
				],
				"menus": {
					"commandPalette": [
						{
							"command": "imagePreview.zoomIn",
							"when": "activeCustomEditorId == 'imagePreview.previewEditor'",
							"group": "1_imagePreview"
						},
						{
							"command": "imagePreview.zoomOut",
							"when": "activeCustomEditorId == 'imagePreview.previewEditor'",
							"group": "1_imagePreview"
						}
					]
				}
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Image Preview",
			"description": "Provides VS Code's built-in image preview",
			"customEditors.displayName": "Image Preview",
			"command.zoomIn": "Zoom in",
			"command.zoomOut": "Zoom out"
		},
		"readmePath": "image-preview/README.md"
	},
	{
		"extensionPath": "ini",
		"packageJSON": {
			"name": "ini",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/ini.tmbundle Syntaxes/Ini.plist ./syntaxes/ini.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "ini",
						"extensions": [
							".ini"
						],
						"aliases": [
							"Ini",
							"ini"
						],
						"configuration": "./ini.language-configuration.json"
					},
					{
						"id": "properties",
						"extensions": [
							".properties",
							".cfg",
							".conf",
							".directory",
							".gitattributes",
							".gitconfig",
							".gitmodules",
							".editorconfig"
						],
						"filenames": [
							"gitconfig"
						],
						"filenamePatterns": [
							"**/.config/git/config",
							"**/.git/config"
						],
						"aliases": [
							"Properties",
							"properties"
						],
						"configuration": "./properties.language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "ini",
						"scopeName": "source.ini",
						"path": "./syntaxes/ini.tmLanguage.json"
					},
					{
						"language": "properties",
						"scopeName": "source.ini",
						"path": "./syntaxes/ini.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Ini Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Ini files."
		}
	},
	{
		"extensionPath": "ipynb",
		"packageJSON": {
			"name": "ipynb",
			"displayName": "%displayName%",
			"description": "%description%",
			"publisher": "vscode",
			"version": "1.0.0",
			"license": "MIT",
			"engines": {
				"vscode": "^1.57.0"
			},
			"enabledApiProposals": [
				"notebookEditor",
				"notebookEditorEdit"
			],
			"activationEvents": [
				"onNotebook:jupyter-notebook"
			],
			"extensionKind": [
				"workspace",
				"ui"
			],
			"main": "./dist/ipynbMain.js",
			"browser": "./dist/browser/ipynbMain.js",
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"contributes": {
				"languages": [
					{
						"id": "jupyter",
						"aliases": [
							"Jupyter (JSON)"
						],
						"extensions": [
							".ipynb"
						]
					}
				],
				"grammars": [
					{
						"language": "jupyter",
						"scopeName": "source.jupyter",
						"path": "./syntaxes/jupyter.tmLanguage.json",
						"embeddedLanguages": {
							"source.json": "json"
						}
					}
				],
				"notebooks": [
					{
						"type": "jupyter-notebook",
						"displayName": "Jupyter Notebook",
						"selector": [
							{
								"filenamePattern": "*.ipynb"
							}
						],
						"priority": "default"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": ".ipynb support",
			"description": "Provides basic support for opening and reading Jupyter's .ipynb notebook files"
		},
		"readmePath": "ipynb/README.md"
	},
	{
		"extensionPath": "javascript",
		"packageJSON": {
			"name": "javascript",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"contributes": {
				"configurationDefaults": {
					"[javascript]": {
						"editor.maxTokenizationLineLength": 2500
					}
				},
				"languages": [
					{
						"id": "javascriptreact",
						"aliases": [
							"JavaScript React",
							"jsx"
						],
						"extensions": [
							".jsx"
						],
						"configuration": "./javascript-language-configuration.json"
					},
					{
						"id": "javascript",
						"aliases": [
							"JavaScript",
							"javascript",
							"js"
						],
						"extensions": [
							".js",
							".es6",
							".mjs",
							".cjs",
							".pac"
						],
						"filenames": [
							"jakefile"
						],
						"firstLine": "^#!.*\\bnode",
						"mimetypes": [
							"text/javascript"
						],
						"configuration": "./javascript-language-configuration.json"
					},
					{
						"id": "jsx-tags",
						"aliases": [],
						"configuration": "./tags-language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "javascriptreact",
						"scopeName": "source.js.jsx",
						"path": "./syntaxes/JavaScriptReact.tmLanguage.json",
						"embeddedLanguages": {
							"meta.tag.js": "jsx-tags",
							"meta.tag.without-attributes.js": "jsx-tags",
							"meta.tag.attributes.js.jsx": "javascriptreact",
							"meta.embedded.expression.js": "javascriptreact"
						},
						"tokenTypes": {
							"meta.template.expression": "other",
							"meta.template.expression string": "string",
							"meta.template.expression comment": "comment",
							"entity.name.type.instance.jsdoc": "other",
							"entity.name.function.tagged-template": "other",
							"meta.import string.quoted": "other",
							"variable.other.jsdoc": "other"
						}
					},
					{
						"language": "javascript",
						"scopeName": "source.js",
						"path": "./syntaxes/JavaScript.tmLanguage.json",
						"embeddedLanguages": {
							"meta.tag.js": "jsx-tags",
							"meta.tag.without-attributes.js": "jsx-tags",
							"meta.tag.attributes.js": "javascript",
							"meta.embedded.expression.js": "javascript"
						},
						"tokenTypes": {
							"meta.template.expression": "other",
							"meta.template.expression string": "string",
							"meta.template.expression comment": "comment",
							"entity.name.type.instance.jsdoc": "other",
							"entity.name.function.tagged-template": "other",
							"meta.import string.quoted": "other",
							"variable.other.jsdoc": "other"
						}
					},
					{
						"scopeName": "source.js.regexp",
						"path": "./syntaxes/Regular Expressions (JavaScript).tmLanguage"
					}
				],
				"semanticTokenScopes": [
					{
						"language": "javascript",
						"scopes": {
							"property": [
								"variable.other.property.js"
							],
							"property.readonly": [
								"variable.other.constant.property.js"
							],
							"variable": [
								"variable.other.readwrite.js"
							],
							"variable.readonly": [
								"variable.other.constant.object.js"
							],
							"function": [
								"entity.name.function.js"
							],
							"namespace": [
								"entity.name.type.module.js"
							],
							"variable.defaultLibrary": [
								"support.variable.js"
							],
							"function.defaultLibrary": [
								"support.function.js"
							]
						}
					},
					{
						"language": "javascriptreact",
						"scopes": {
							"property": [
								"variable.other.property.jsx"
							],
							"property.readonly": [
								"variable.other.constant.property.jsx"
							],
							"variable": [
								"variable.other.readwrite.jsx"
							],
							"variable.readonly": [
								"variable.other.constant.object.jsx"
							],
							"function": [
								"entity.name.function.jsx"
							],
							"namespace": [
								"entity.name.type.module.jsx"
							],
							"variable.defaultLibrary": [
								"support.variable.js"
							],
							"function.defaultLibrary": [
								"support.function.js"
							]
						}
					}
				],
				"snippets": [
					{
						"language": "javascript",
						"path": "./snippets/javascript.code-snippets"
					},
					{
						"language": "javascriptreact",
						"path": "./snippets/javascript.code-snippets"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "JavaScript Language Basics",
			"description": "Provides snippets, syntax highlighting, bracket matching and folding in JavaScript files."
		}
	},
	{
		"extensionPath": "json",
		"packageJSON": {
			"name": "json",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammars.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "json",
						"aliases": [
							"JSON",
							"json"
						],
						"extensions": [
							".json",
							".bowerrc",
							".jscsrc",
							".webmanifest",
							".js.map",
							".css.map",
							".ts.map",
							".har",
							".jslintrc",
							".jsonld",
							".geojson"
						],
						"filenames": [
							"composer.lock",
							".watchmanconfig"
						],
						"mimetypes": [
							"application/json",
							"application/manifest+json"
						],
						"configuration": "./language-configuration.json"
					},
					{
						"id": "jsonc",
						"aliases": [
							"JSON with Comments"
						],
						"extensions": [
							".jsonc",
							".eslintrc",
							".eslintrc.json",
							".jsfmtrc",
							".jshintrc",
							".swcrc",
							".hintrc",
							".babelrc"
						],
						"filenames": [
							"babel.config.json",
							".babelrc.json",
							".ember-cli"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "json",
						"scopeName": "source.json",
						"path": "./syntaxes/JSON.tmLanguage.json"
					},
					{
						"language": "jsonc",
						"scopeName": "source.json.comments",
						"path": "./syntaxes/JSONC.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "JSON Language Basics",
			"description": "Provides syntax highlighting & bracket matching in JSON files."
		}
	},
	{
		"extensionPath": "json-language-features",
		"packageJSON": {
			"name": "json-language-features",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "0.10.x"
			},
			"icon": "icons/json.png",
			"activationEvents": [
				"onLanguage:json",
				"onLanguage:jsonc",
				"onCommand:json.clearCache"
			],
			"main": "./client/dist/node/jsonClientMain",
			"browser": "./client/dist/browser/jsonClientMain",
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"enabledApiProposals": [
				"languageStatus"
			],
			"categories": [
				"Programming Languages"
			],
			"contributes": {
				"configuration": {
					"id": "json",
					"order": 20,
					"type": "object",
					"title": "JSON",
					"properties": {
						"json.schemas": {
							"type": "array",
							"scope": "resource",
							"description": "%json.schemas.desc%",
							"items": {
								"type": "object",
								"default": {
									"fileMatch": [
										"/myfile"
									],
									"url": "schemaURL"
								},
								"properties": {
									"url": {
										"type": "string",
										"default": "/user.schema.json",
										"description": "%json.schemas.url.desc%"
									},
									"fileMatch": {
										"type": "array",
										"items": {
											"type": "string",
											"default": "MyFile.json",
											"description": "%json.schemas.fileMatch.item.desc%"
										},
										"minItems": 1,
										"description": "%json.schemas.fileMatch.desc%"
									},
									"schema": {
										"$ref": "http://json-schema.org/draft-07/schema#",
										"description": "%json.schemas.schema.desc%"
									}
								}
							}
						},
						"json.format.enable": {
							"type": "boolean",
							"scope": "window",
							"default": true,
							"description": "%json.format.enable.desc%"
						},
						"json.trace.server": {
							"type": "string",
							"scope": "window",
							"enum": [
								"off",
								"messages",
								"verbose"
							],
							"default": "off",
							"description": "%json.tracing.desc%"
						},
						"json.colorDecorators.enable": {
							"type": "boolean",
							"scope": "window",
							"default": true,
							"description": "%json.colorDecorators.enable.desc%",
							"deprecationMessage": "%json.colorDecorators.enable.deprecationMessage%"
						},
						"json.maxItemsComputed": {
							"type": "number",
							"default": 5000,
							"description": "%json.maxItemsComputed.desc%"
						},
						"json.schemaDownload.enable": {
							"type": "boolean",
							"default": true,
							"description": "%json.enableSchemaDownload.desc%",
							"tags": [
								"usesOnlineServices"
							]
						}
					}
				},
				"configurationDefaults": {
					"[json]": {
						"editor.quickSuggestions": {
							"strings": true
						},
						"editor.suggest.insertMode": "replace"
					},
					"[jsonc]": {
						"editor.quickSuggestions": {
							"strings": true
						},
						"editor.suggest.insertMode": "replace"
					}
				},
				"jsonValidation": [
					{
						"fileMatch": "*.schema.json",
						"url": "http://json-schema.org/draft-07/schema#"
					}
				],
				"commands": [
					{
						"command": "json.clearCache",
						"title": "%json.command.clearCache%",
						"category": "JSON"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "JSON Language Features",
			"description": "Provides rich language support for JSON files.",
			"json.schemas.desc": "Associate schemas to JSON files in the current project.",
			"json.schemas.url.desc": "A URL to a schema or a relative path to a schema in the current directory",
			"json.schemas.fileMatch.desc": "An array of file patterns to match against when resolving JSON files to schemas. `*` can be used as a wildcard. Exclusion patterns can also be defined and start with '!'. A file matches when there is at least one matching pattern and the last matching pattern is not an exclusion pattern.",
			"json.schemas.fileMatch.item.desc": "A file pattern that can contain '*' to match against when resolving JSON files to schemas.",
			"json.schemas.schema.desc": "The schema definition for the given URL. The schema only needs to be provided to avoid accesses to the schema URL.",
			"json.format.enable.desc": "Enable/disable default JSON formatter",
			"json.tracing.desc": "Traces the communication between VS Code and the JSON language server.",
			"json.colorDecorators.enable.desc": "Enables or disables color decorators",
			"json.colorDecorators.enable.deprecationMessage": "The setting `json.colorDecorators.enable` has been deprecated in favor of `editor.colorDecorators`.",
			"json.schemaResolutionErrorMessage": "Unable to resolve schema.",
			"json.clickToRetry": "Click to retry.",
			"json.maxItemsComputed.desc": "The maximum number of outline symbols and folding regions computed (limited for performance reasons).",
			"json.maxItemsExceededInformation.desc": "Show notification when exceeding the maximum number of outline symbols and folding regions.",
			"json.enableSchemaDownload.desc": "When enabled, JSON schemas can be fetched from http and https locations.",
			"json.command.clearCache": "Clear schema cache"
		},
		"readmePath": "json-language-features/README.md"
	},
	{
		"extensionPath": "julia",
		"packageJSON": {
			"name": "julia",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin JuliaEditorSupport/atom-language-julia grammars/julia_vscode.json ./syntaxes/julia.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "julia",
						"aliases": [
							"Julia",
							"julia"
						],
						"extensions": [
							".jl"
						],
						"firstLine": "^#!\\s*/.*\\bjulia[0-9.-]*\\b",
						"configuration": "./language-configuration.json"
					},
					{
						"id": "juliamarkdown",
						"aliases": [
							"Julia Markdown",
							"juliamarkdown"
						],
						"extensions": [
							".jmd"
						]
					}
				],
				"grammars": [
					{
						"language": "julia",
						"scopeName": "source.julia",
						"path": "./syntaxes/julia.tmLanguage.json",
						"embeddedLanguages": {
							"meta.embedded.inline.cpp": "cpp",
							"meta.embedded.inline.javascript": "javascript",
							"meta.embedded.inline.python": "python",
							"meta.embedded.inline.r": "r",
							"meta.embedded.inline.sql": "sql"
						}
					}
				]
			}
		},
		"packageNLS": {
			"displayName": "Julia Language Basics",
			"description": "Provides syntax highlighting & bracket matching in Julia files."
		}
	},
	{
		"extensionPath": "latex",
		"packageJSON": {
			"name": "latex",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammars.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "tex",
						"aliases": [
							"TeX",
							"tex"
						],
						"extensions": [
							".sty",
							".cls",
							".bbx",
							".cbx"
						],
						"configuration": "latex-language-configuration.json"
					},
					{
						"id": "latex",
						"aliases": [
							"LaTeX",
							"latex"
						],
						"extensions": [
							".tex",
							".ltx",
							".ctx"
						],
						"configuration": "latex-language-configuration.json"
					},
					{
						"id": "bibtex",
						"aliases": [
							"BibTeX",
							"bibtex"
						],
						"extensions": [
							".bib"
						]
					},
					{
						"id": "cpp_embedded_latex",
						"configuration": "latex-cpp-embedded-language-configuration.json",
						"aliases": []
					},
					{
						"id": "markdown_latex_combined",
						"configuration": "markdown-latex-combined-language-configuration.json",
						"aliases": []
					}
				],
				"grammars": [
					{
						"language": "tex",
						"scopeName": "text.tex",
						"path": "./syntaxes/TeX.tmLanguage.json"
					},
					{
						"language": "latex",
						"scopeName": "text.tex.latex",
						"path": "./syntaxes/LaTeX.tmLanguage.json",
						"embeddedLanguages": {
							"source.cpp": "cpp_embedded_latex",
							"source.css": "css",
							"text.html": "html",
							"source.java": "java",
							"source.js": "javascript",
							"source.julia": "julia",
							"source.lua": "lua",
							"source.python": "python",
							"source.ruby": "ruby",
							"source.ts": "typescript",
							"text.xml": "xml",
							"source.yaml": "yaml",
							"meta.embedded.markdown_latex_combined": "markdown_latex_combined"
						}
					},
					{
						"language": "bibtex",
						"scopeName": "text.bibtex",
						"path": "./syntaxes/Bibtex.tmLanguage.json"
					},
					{
						"language": "markdown_latex_combined",
						"scopeName": "text.tex.markdown_latex_combined",
						"path": "./syntaxes/markdown-latex-combined.tmLanguage.json"
					},
					{
						"language": "cpp_embedded_latex",
						"scopeName": "source.cpp.embedded.latex",
						"path": "./syntaxes/cpp-grammar-bailout.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "LaTeX Language Basics",
			"description": "Provides syntax highlighting and bracket matching for TeX, LaTeX and BibTeX."
		}
	},
	{
		"extensionPath": "less",
		"packageJSON": {
			"name": "less",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin atom/language-less grammars/less.cson ./syntaxes/less.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "less",
						"aliases": [
							"Less",
							"less"
						],
						"extensions": [
							".less"
						],
						"mimetypes": [
							"text/x-less",
							"text/less"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "less",
						"scopeName": "source.css.less",
						"path": "./syntaxes/less.tmLanguage.json"
					}
				],
				"problemMatchers": [
					{
						"name": "lessc",
						"label": "Lessc compiler",
						"owner": "lessc",
						"source": "less",
						"fileLocation": "absolute",
						"pattern": {
							"regexp": "(.*)\\sin\\s(.*)\\son line\\s(\\d+),\\scolumn\\s(\\d+)",
							"message": 1,
							"file": 2,
							"line": 3,
							"column": 4
						}
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Less Language Basics",
			"description": "Provides syntax highlighting, bracket matching and folding in Less files."
		}
	},
	{
		"extensionPath": "log",
		"packageJSON": {
			"name": "log",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin emilast/vscode-logfile-highlighter syntaxes/log.tmLanguage ./syntaxes/log.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "log",
						"extensions": [
							".log",
							"*.log.?"
						],
						"aliases": [
							"Log"
						]
					}
				],
				"grammars": [
					{
						"language": "log",
						"scopeName": "text.log",
						"path": "./syntaxes/log.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Log",
			"description": "Provides syntax highlighting for files with .log extension."
		}
	},
	{
		"extensionPath": "lua",
		"packageJSON": {
			"name": "lua",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/lua.tmbundle Syntaxes/Lua.plist ./syntaxes/lua.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "lua",
						"extensions": [
							".lua"
						],
						"aliases": [
							"Lua",
							"lua"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "lua",
						"scopeName": "source.lua",
						"path": "./syntaxes/lua.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Lua Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Lua files."
		}
	},
	{
		"extensionPath": "make",
		"packageJSON": {
			"name": "make",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin fadeevab/make.tmbundle Syntaxes/Makefile.plist ./syntaxes/make.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "makefile",
						"aliases": [
							"Makefile",
							"makefile"
						],
						"extensions": [
							".mak",
							".mk"
						],
						"filenames": [
							"Makefile",
							"makefile",
							"GNUmakefile",
							"OCamlMakefile"
						],
						"firstLine": "^#!\\s*/usr/bin/make",
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "makefile",
						"scopeName": "source.makefile",
						"path": "./syntaxes/make.tmLanguage.json",
						"tokenTypes": {
							"string.interpolated": "other"
						}
					}
				],
				"configurationDefaults": {
					"[makefile]": {
						"editor.insertSpaces": false
					}
				}
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Make Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Make files."
		}
	},
	{
		"extensionPath": "markdown-basics",
		"packageJSON": {
			"name": "markdown",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "^1.20.0"
			},
			"contributes": {
				"languages": [
					{
						"id": "markdown",
						"aliases": [
							"Markdown",
							"markdown"
						],
						"extensions": [
							".md",
							".mkd",
							".mdwn",
							".mdown",
							".markdown",
							".markdn",
							".mdtxt",
							".mdtext",
							".workbook"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "markdown",
						"scopeName": "text.html.markdown",
						"path": "./syntaxes/markdown.tmLanguage.json",
						"embeddedLanguages": {
							"meta.embedded.block.html": "html",
							"source.js": "javascript",
							"source.css": "css",
							"meta.embedded.block.frontmatter": "yaml",
							"meta.embedded.block.css": "css",
							"meta.embedded.block.ini": "ini",
							"meta.embedded.block.java": "java",
							"meta.embedded.block.lua": "lua",
							"meta.embedded.block.makefile": "makefile",
							"meta.embedded.block.perl": "perl",
							"meta.embedded.block.r": "r",
							"meta.embedded.block.ruby": "ruby",
							"meta.embedded.block.php": "php",
							"meta.embedded.block.sql": "sql",
							"meta.embedded.block.vs_net": "vs_net",
							"meta.embedded.block.xml": "xml",
							"meta.embedded.block.xsl": "xsl",
							"meta.embedded.block.yaml": "yaml",
							"meta.embedded.block.dosbatch": "dosbatch",
							"meta.embedded.block.clojure": "clojure",
							"meta.embedded.block.coffee": "coffee",
							"meta.embedded.block.c": "c",
							"meta.embedded.block.cpp": "cpp",
							"meta.embedded.block.diff": "diff",
							"meta.embedded.block.dockerfile": "dockerfile",
							"meta.embedded.block.go": "go",
							"meta.embedded.block.groovy": "groovy",
							"meta.embedded.block.pug": "jade",
							"meta.embedded.block.javascript": "javascript",
							"meta.embedded.block.json": "json",
							"meta.embedded.block.less": "less",
							"meta.embedded.block.objc": "objc",
							"meta.embedded.block.scss": "scss",
							"meta.embedded.block.perl6": "perl6",
							"meta.embedded.block.powershell": "powershell",
							"meta.embedded.block.python": "python",
							"meta.embedded.block.rust": "rust",
							"meta.embedded.block.scala": "scala",
							"meta.embedded.block.shellscript": "shellscript",
							"meta.embedded.block.typescript": "typescript",
							"meta.embedded.block.typescriptreact": "typescriptreact",
							"meta.embedded.block.csharp": "csharp",
							"meta.embedded.block.fsharp": "fsharp"
						}
					}
				],
				"snippets": [
					{
						"language": "markdown",
						"path": "./snippets/markdown.code-snippets"
					}
				],
				"configurationDefaults": {
					"[markdown]": {
						"editor.unicodeHighlight.ambiguousCharacters": false
					}
				}
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin microsoft/vscode-markdown-tm-grammar syntaxes/markdown.tmLanguage ./syntaxes/markdown.tmLanguage.json"
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Markdown Language Basics",
			"description": "Provides snippets and syntax highlighting for Markdown."
		}
	},
	{
		"extensionPath": "markdown-language-features",
		"packageJSON": {
			"name": "markdown-language-features",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"icon": "icon.png",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "^1.20.0"
			},
			"main": "./dist/extension",
			"browser": "./dist/browser/extension",
			"categories": [
				"Programming Languages"
			],
			"activationEvents": [
				"onLanguage:markdown",
				"onCommand:markdown.preview.toggleLock",
				"onCommand:markdown.preview.refresh",
				"onCommand:markdown.showPreview",
				"onCommand:markdown.showPreviewToSide",
				"onCommand:markdown.showLockedPreviewToSide",
				"onCommand:markdown.showSource",
				"onCommand:markdown.showPreviewSecuritySelector",
				"onCommand:markdown.api.render",
				"onCommand:markdown.api.reloadPlugins",
				"onWebviewPanel:markdown.preview",
				"onCustomEditor:vscode.markdown.preview.editor"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": "limited",
					"description": "%workspaceTrust%",
					"restrictedConfigurations": [
						"markdown.styles"
					]
				}
			},
			"contributes": {
				"notebookRenderer": [
					{
						"id": "markdownItRenderer",
						"displayName": "Markdown it renderer",
						"entrypoint": "./notebook-out/index.js",
						"mimeTypes": [
							"text/markdown"
						]
					}
				],
				"commands": [
					{
						"command": "markdown.showPreview",
						"title": "%markdown.preview.title%",
						"category": "Markdown",
						"icon": {
							"light": "./media/preview-light.svg",
							"dark": "./media/preview-dark.svg"
						}
					},
					{
						"command": "markdown.showPreviewToSide",
						"title": "%markdown.previewSide.title%",
						"category": "Markdown",
						"icon": "$(open-preview)"
					},
					{
						"command": "markdown.showLockedPreviewToSide",
						"title": "%markdown.showLockedPreviewToSide.title%",
						"category": "Markdown",
						"icon": "$(open-preview)"
					},
					{
						"command": "markdown.showSource",
						"title": "%markdown.showSource.title%",
						"category": "Markdown",
						"icon": "$(go-to-file)"
					},
					{
						"command": "markdown.showPreviewSecuritySelector",
						"title": "%markdown.showPreviewSecuritySelector.title%",
						"category": "Markdown"
					},
					{
						"command": "markdown.preview.refresh",
						"title": "%markdown.preview.refresh.title%",
						"category": "Markdown"
					},
					{
						"command": "markdown.preview.toggleLock",
						"title": "%markdown.preview.toggleLock.title%",
						"category": "Markdown"
					}
				],
				"menus": {
					"editor/title": [
						{
							"command": "markdown.showPreviewToSide",
							"when": "editorLangId == markdown && !notebookEditorFocused && !hasCustomMarkdownPreview",
							"alt": "markdown.showPreview",
							"group": "navigation"
						},
						{
							"command": "markdown.showSource",
							"when": "markdownPreviewFocus",
							"group": "navigation"
						},
						{
							"command": "markdown.preview.refresh",
							"when": "markdownPreviewFocus",
							"group": "1_markdown"
						},
						{
							"command": "markdown.preview.toggleLock",
							"when": "markdownPreviewFocus",
							"group": "1_markdown"
						},
						{
							"command": "markdown.showPreviewSecuritySelector",
							"when": "markdownPreviewFocus",
							"group": "1_markdown"
						}
					],
					"explorer/context": [
						{
							"command": "markdown.showPreview",
							"when": "resourceLangId == markdown && !hasCustomMarkdownPreview",
							"group": "navigation"
						}
					],
					"editor/title/context": [
						{
							"command": "markdown.showPreview",
							"when": "resourceLangId == markdown && !hasCustomMarkdownPreview",
							"group": "1_open"
						}
					],
					"commandPalette": [
						{
							"command": "markdown.showPreview",
							"when": "editorLangId == markdown && !notebookEditorFocused",
							"group": "navigation"
						},
						{
							"command": "markdown.showPreviewToSide",
							"when": "editorLangId == markdown && !notebookEditorFocused",
							"group": "navigation"
						},
						{
							"command": "markdown.showLockedPreviewToSide",
							"when": "editorLangId == markdown && !notebookEditorFocused",
							"group": "navigation"
						},
						{
							"command": "markdown.showSource",
							"when": "markdownPreviewFocus",
							"group": "navigation"
						},
						{
							"command": "markdown.showPreviewSecuritySelector",
							"when": "editorLangId == markdown && !notebookEditorFocused"
						},
						{
							"command": "markdown.showPreviewSecuritySelector",
							"when": "markdownPreviewFocus"
						},
						{
							"command": "markdown.preview.toggleLock",
							"when": "markdownPreviewFocus"
						},
						{
							"command": "markdown.preview.refresh",
							"when": "editorLangId == markdown && !notebookEditorFocused"
						},
						{
							"command": "markdown.preview.refresh",
							"when": "markdownPreviewFocus"
						}
					]
				},
				"keybindings": [
					{
						"command": "markdown.showPreview",
						"key": "shift+ctrl+v",
						"mac": "shift+cmd+v",
						"when": "editorLangId == markdown && !notebookEditorFocused"
					},
					{
						"command": "markdown.showPreviewToSide",
						"key": "ctrl+k v",
						"mac": "cmd+k v",
						"when": "editorLangId == markdown && !notebookEditorFocused"
					}
				],
				"configuration": {
					"type": "object",
					"title": "Markdown",
					"order": 20,
					"properties": {
						"markdown.styles": {
							"type": "array",
							"items": {
								"type": "string"
							},
							"default": [],
							"description": "%markdown.styles.dec%",
							"scope": "resource"
						},
						"markdown.preview.breaks": {
							"type": "boolean",
							"default": false,
							"description": "%markdown.preview.breaks.desc%",
							"scope": "resource"
						},
						"markdown.preview.linkify": {
							"type": "boolean",
							"default": true,
							"description": "%markdown.preview.linkify%",
							"scope": "resource"
						},
						"markdown.preview.typographer": {
							"type": "boolean",
							"default": false,
							"description": "%markdown.preview.typographer%",
							"scope": "resource"
						},
						"markdown.preview.fontFamily": {
							"type": "string",
							"default": "-apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif",
							"description": "%markdown.preview.fontFamily.desc%",
							"scope": "resource"
						},
						"markdown.preview.fontSize": {
							"type": "number",
							"default": 14,
							"description": "%markdown.preview.fontSize.desc%",
							"scope": "resource"
						},
						"markdown.preview.lineHeight": {
							"type": "number",
							"default": 1.6,
							"description": "%markdown.preview.lineHeight.desc%",
							"scope": "resource"
						},
						"markdown.preview.scrollPreviewWithEditor": {
							"type": "boolean",
							"default": true,
							"description": "%markdown.preview.scrollPreviewWithEditor.desc%",
							"scope": "resource"
						},
						"markdown.preview.markEditorSelection": {
							"type": "boolean",
							"default": true,
							"description": "%markdown.preview.markEditorSelection.desc%",
							"scope": "resource"
						},
						"markdown.preview.scrollEditorWithPreview": {
							"type": "boolean",
							"default": true,
							"description": "%markdown.preview.scrollEditorWithPreview.desc%",
							"scope": "resource"
						},
						"markdown.preview.doubleClickToSwitchToEditor": {
							"type": "boolean",
							"default": true,
							"description": "%markdown.preview.doubleClickToSwitchToEditor.desc%",
							"scope": "resource"
						},
						"markdown.preview.openMarkdownLinks": {
							"type": "string",
							"default": "inPreview",
							"description": "%configuration.markdown.preview.openMarkdownLinks.description%",
							"scope": "resource",
							"enum": [
								"inPreview",
								"inEditor"
							],
							"enumDescriptions": [
								"%configuration.markdown.preview.openMarkdownLinks.inPreview%",
								"%configuration.markdown.preview.openMarkdownLinks.inEditor%"
							]
						},
						"markdown.links.openLocation": {
							"type": "string",
							"default": "currentGroup",
							"description": "%configuration.markdown.links.openLocation.description%",
							"scope": "resource",
							"enum": [
								"currentGroup",
								"beside"
							],
							"enumDescriptions": [
								"%configuration.markdown.links.openLocation.currentGroup%",
								"%configuration.markdown.links.openLocation.beside%"
							]
						},
						"markdown.trace": {
							"type": "string",
							"enum": [
								"off",
								"verbose"
							],
							"default": "off",
							"description": "%markdown.trace.desc%",
							"scope": "window"
						}
					}
				},
				"configurationDefaults": {
					"[markdown]": {
						"editor.wordWrap": "on",
						"editor.quickSuggestions": false
					}
				},
				"jsonValidation": [
					{
						"fileMatch": "package.json",
						"url": "./schemas/package.schema.json"
					}
				],
				"markdown.previewStyles": [
					"./media/markdown.css",
					"./media/highlight.css"
				],
				"markdown.previewScripts": [
					"./media/index.js"
				],
				"customEditors": [
					{
						"viewType": "vscode.markdown.preview.editor",
						"displayName": "Markdown Preview",
						"priority": "option",
						"selector": [
							{
								"filenamePattern": "*.md"
							}
						]
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Markdown Language Features",
			"description": "Provides rich language support for Markdown.",
			"markdown.preview.breaks.desc": "Sets how line-breaks are rendered in the Markdown preview. Setting it to 'true' creates a <br> for newlines inside paragraphs.",
			"markdown.preview.linkify": "Enable or disable conversion of URL-like text to links in the Markdown preview.",
			"markdown.preview.typographer": "Enable or disable some language-neutral replacement and quotes beautification in the Markdown preview.",
			"markdown.preview.doubleClickToSwitchToEditor.desc": "Double click in the Markdown preview to switch to the editor.",
			"markdown.preview.fontFamily.desc": "Controls the font family used in the Markdown preview.",
			"markdown.preview.fontSize.desc": "Controls the font size in pixels used in the Markdown preview.",
			"markdown.preview.lineHeight.desc": "Controls the line height used in the Markdown preview. This number is relative to the font size.",
			"markdown.preview.markEditorSelection.desc": "Mark the current editor selection in the Markdown preview.",
			"markdown.preview.scrollEditorWithPreview.desc": "When a Markdown preview is scrolled, update the view of the editor.",
			"markdown.preview.scrollPreviewWithEditor.desc": "When a Markdown editor is scrolled, update the view of the preview.",
			"markdown.preview.title": "Open Preview",
			"markdown.previewSide.title": "Open Preview to the Side",
			"markdown.showLockedPreviewToSide.title": "Open Locked Preview to the Side",
			"markdown.showSource.title": "Show Source",
			"markdown.styles.dec": "A list of URLs or local paths to CSS style sheets to use from the Markdown preview. Relative paths are interpreted relative to the folder open in the Explorer. If there is no open folder, they are interpreted relative to the location of the Markdown file. All '\\' need to be written as '\\\\'.",
			"markdown.showPreviewSecuritySelector.title": "Change Preview Security Settings",
			"markdown.trace.desc": "Enable debug logging for the Markdown extension.",
			"markdown.preview.refresh.title": "Refresh Preview",
			"markdown.preview.toggleLock.title": "Toggle Preview Locking",
			"configuration.markdown.preview.openMarkdownLinks.description": "Controls how links to other Markdown files in the Markdown preview should be opened.",
			"configuration.markdown.preview.openMarkdownLinks.inEditor": "Try to open links in the editor.",
			"configuration.markdown.preview.openMarkdownLinks.inPreview": "Try to open links in the Markdown preview.",
			"configuration.markdown.links.openLocation.description": "Controls where links in Markdown files should be opened.",
			"configuration.markdown.links.openLocation.currentGroup": "Open links in the active editor group.",
			"configuration.markdown.links.openLocation.beside": "Open links beside the active editor.",
			"workspaceTrust": "Required for loading styles configured in the workspace."
		},
		"readmePath": "markdown-language-features/README.md"
	},
	{
		"extensionPath": "markdown-math",
		"packageJSON": {
			"name": "markdown-math",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"icon": "icon.png",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "^1.54.0"
			},
			"categories": [
				"Other"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"main": "./dist/extension",
			"browser": "./dist/browser/extension",
			"activationEvents": [],
			"contributes": {
				"languages": [
					{
						"id": "markdown-math",
						"aliases": [],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "markdown-math",
						"scopeName": "text.html.markdown.math",
						"path": "./syntaxes/md-math.tmLanguage.json"
					},
					{
						"scopeName": "markdown.math.block",
						"path": "./syntaxes/md-math-block.tmLanguage.json",
						"injectTo": [
							"text.html.markdown"
						],
						"embeddedLanguages": {
							"meta.embedded.math.markdown": "markdown-math"
						}
					},
					{
						"scopeName": "markdown.math.inline",
						"path": "./syntaxes/md-math-inline.tmLanguage.json",
						"injectTo": [
							"text.html.markdown"
						],
						"embeddedLanguages": {
							"meta.embedded.math.markdown": "markdown-math"
						}
					}
				],
				"notebookRenderer": [
					{
						"id": "markdownItRenderer-katex",
						"displayName": "Markdown it KaTeX renderer",
						"entrypoint": {
							"extends": "markdownItRenderer",
							"path": "./notebook-out/katex.js"
						}
					}
				],
				"markdown.markdownItPlugins": true,
				"markdown.previewStyles": [
					"./notebook-out/katex.min.css",
					"./preview-styles/index.css"
				],
				"configuration": [
					{
						"title": "Markdown Math",
						"properties": {
							"markdown.math.enabled": {
								"type": "boolean",
								"default": true,
								"description": "%config.markdown.math.enabled%"
							}
						}
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Markdown Math",
			"description": "Adds math support to Markdown in notebooks.",
			"config.markdown.math.enabled": "Enable/disable rendering math in the built-in Markdown preview."
		},
		"readmePath": "markdown-math/README.md"
	},
	{
		"extensionPath": "merge-conflict",
		"packageJSON": {
			"name": "merge-conflict",
			"publisher": "vscode",
			"displayName": "%displayName%",
			"description": "%description%",
			"icon": "media/icon.png",
			"version": "1.0.0",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "^1.5.0"
			},
			"categories": [
				"Other"
			],
			"capabilities": {
				"virtualWorkspaces": false,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"activationEvents": [
				"onStartupFinished"
			],
			"main": "./dist/mergeConflictMain",
			"browser": "./dist/browser/mergeConflictMain",
			"contributes": {
				"commands": [
					{
						"category": "%command.category%",
						"title": "%command.accept.all-current%",
						"original": "Accept All Current",
						"command": "merge-conflict.accept.all-current"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.all-incoming%",
						"original": "Accept All Incoming",
						"command": "merge-conflict.accept.all-incoming"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.all-both%",
						"original": "Accept All Both",
						"command": "merge-conflict.accept.all-both"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.current%",
						"original": "Accept Current",
						"command": "merge-conflict.accept.current"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.incoming%",
						"original": "Accept Incoming",
						"command": "merge-conflict.accept.incoming"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.selection%",
						"original": "Accept Selection",
						"command": "merge-conflict.accept.selection"
					},
					{
						"category": "%command.category%",
						"title": "%command.accept.both%",
						"original": "Accept Both",
						"command": "merge-conflict.accept.both"
					},
					{
						"category": "%command.category%",
						"title": "%command.next%",
						"original": "Next Conflict",
						"command": "merge-conflict.next",
						"icon": "$(arrow-down)"
					},
					{
						"category": "%command.category%",
						"title": "%command.previous%",
						"original": "Previous Conflict",
						"command": "merge-conflict.previous",
						"icon": "$(arrow-up)"
					},
					{
						"category": "%command.category%",
						"title": "%command.compare%",
						"original": "Compare Current Conflict",
						"command": "merge-conflict.compare"
					}
				],
				"menus": {
					"scm/resourceState/context": [
						{
							"command": "merge-conflict.accept.all-current",
							"when": "scmProvider == git && scmResourceGroup == merge",
							"group": "1_modification"
						},
						{
							"command": "merge-conflict.accept.all-incoming",
							"when": "scmProvider == git && scmResourceGroup == merge",
							"group": "1_modification"
						}
					],
					"editor/title": [
						{
							"command": "merge-conflict.previous",
							"group": "navigation@1",
							"when": "mergeConflictsCount && mergeConflictsCount != 0"
						},
						{
							"command": "merge-conflict.next",
							"group": "navigation@2",
							"when": "mergeConflictsCount && mergeConflictsCount != 0"
						}
					]
				},
				"configuration": {
					"title": "%config.title%",
					"properties": {
						"merge-conflict.codeLens.enabled": {
							"type": "boolean",
							"description": "%config.codeLensEnabled%",
							"default": true
						},
						"merge-conflict.decorators.enabled": {
							"type": "boolean",
							"description": "%config.decoratorsEnabled%",
							"default": true
						},
						"merge-conflict.autoNavigateNextConflict.enabled": {
							"type": "boolean",
							"description": "%config.autoNavigateNextConflictEnabled%",
							"default": false
						},
						"merge-conflict.diffViewPosition": {
							"type": "string",
							"enum": [
								"Current",
								"Beside",
								"Below"
							],
							"description": "%config.diffViewPosition%",
							"enumDescriptions": [
								"%config.diffViewPosition.current%",
								"%config.diffViewPosition.beside%",
								"%config.diffViewPosition.below%"
							],
							"default": "Current"
						}
					}
				}
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Merge Conflict",
			"description": "Highlighting and commands for inline merge conflicts.",
			"command.category": "Merge Conflict",
			"command.accept.all-current": "Accept All Current",
			"command.accept.all-incoming": "Accept All Incoming",
			"command.accept.all-both": "Accept All Both",
			"command.accept.current": "Accept Current",
			"command.accept.incoming": "Accept Incoming",
			"command.accept.selection": "Accept Selection",
			"command.accept.both": "Accept Both",
			"command.next": "Next Conflict",
			"command.previous": "Previous Conflict",
			"command.compare": "Compare Current Conflict",
			"config.title": "Merge Conflict",
			"config.autoNavigateNextConflictEnabled": "Whether to automatically navigate to the next merge conflict after resolving a merge conflict.",
			"config.codeLensEnabled": "Create a CodeLens for merge conflict blocks within editor.",
			"config.decoratorsEnabled": "Create decorators for merge conflict blocks within editor.",
			"config.diffViewPosition": "Controls where the diff view should be opened when comparing changes in merge conflicts.",
			"config.diffViewPosition.current": "Open the diff view in the current editor group.",
			"config.diffViewPosition.beside": "Open the diff view next to the current editor group.",
			"config.diffViewPosition.below": "Open the diff view below the current editor group."
		},
		"readmePath": "merge-conflict/README.md"
	},
	{
		"extensionPath": "microsoft-authentication",
		"packageJSON": {
			"name": "microsoft-authentication",
			"publisher": "vscode",
			"license": "MIT",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "0.0.1",
			"engines": {
				"vscode": "^1.42.0"
			},
			"icon": "media/icon.png",
			"categories": [
				"Other"
			],
			"activationEvents": [
				"onAuthenticationRequest:microsoft"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"extensionKind": [
				"ui",
				"workspace"
			],
			"contributes": {
				"authentication": [
					{
						"label": "Microsoft",
						"id": "microsoft"
					}
				]
			},
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"main": "./dist/extension.js",
			"browser": "./dist/browser/extension.js",
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Microsoft Account",
			"description": "Microsoft authentication provider",
			"signIn": "Sign In",
			"signOut": "Sign Out"
		},
		"readmePath": "microsoft-authentication/README.md"
	},
	{
		"extensionPath": "ms-vscode.references-view",
		"packageJSON": {
			"name": "references-view",
			"displayName": "Reference Search View",
			"icon": "media/icon.png",
			"description": "Reference Search results as separate, stable view in the sidebar",
			"version": "0.0.81",
			"publisher": "ms-vscode",
			"engines": {
				"vscode": "^1.40.0"
			},
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/Microsoft/vscode-reference-view"
			},
			"bugs": {
				"url": "https://github.com/Microsoft/vscode-reference-view/issues"
			},
			"categories": [
				"Programming Languages"
			],
			"activationEvents": [
				"onCommand:references-view.find",
				"onCommand:references-view.findReferences",
				"onCommand:references-view.findImplementations",
				"onCommand:references-view.showCallHierarchy",
				"onCommand:references-view.showTypeHierarchy",
				"onCommand:editor.action.showReferences",
				"onView:references-view.tree"
			],
			"main": "./dist/extension",
			"browser": "./dist/extension",
			"contributes": {
				"configuration": {
					"properties": {
						"references.preferredLocation": {
							"description": "Controls whether 'Peek References' or 'Find References' is invoked when selecting code lens references",
							"type": "string",
							"default": "peek",
							"enum": [
								"peek",
								"view"
							],
							"enumDescriptions": [
								"Show references in peek editor.",
								"Show references in separate view."
							]
						}
					}
				},
				"viewsContainers": {
					"activitybar": [
						{
							"id": "references-view",
							"icon": "$(references)",
							"title": "References"
						}
					]
				},
				"views": {
					"references-view": [
						{
							"id": "references-view.tree",
							"name": "Results",
							"when": "reference-list.isActive"
						}
					]
				},
				"commands": [
					{
						"command": "references-view.findReferences",
						"title": "Find All References",
						"category": "References"
					},
					{
						"command": "references-view.findImplementations",
						"title": "Find All Implementations",
						"category": "References"
					},
					{
						"command": "references-view.clearHistory",
						"title": "Clear History",
						"category": "References",
						"icon": "$(clear-all)"
					},
					{
						"command": "references-view.clear",
						"title": "Clear",
						"category": "References",
						"icon": "$(clear-all)"
					},
					{
						"command": "references-view.refresh",
						"title": "Refresh",
						"category": "References",
						"icon": "$(refresh)"
					},
					{
						"command": "references-view.pickFromHistory",
						"title": "Show History",
						"category": "References"
					},
					{
						"command": "references-view.removeReferenceItem",
						"title": "Dismiss",
						"icon": "$(close)"
					},
					{
						"command": "references-view.copy",
						"title": "Copy"
					},
					{
						"command": "references-view.copyAll",
						"title": "Copy All"
					},
					{
						"command": "references-view.copyPath",
						"title": "Copy Path"
					},
					{
						"command": "references-view.refind",
						"title": "Rerun",
						"icon": "$(refresh)"
					},
					{
						"command": "references-view.showCallHierarchy",
						"title": "Show Call Hierarchy",
						"category": "Calls"
					},
					{
						"command": "references-view.showOutgoingCalls",
						"title": "Show Outgoing Calls",
						"category": "Calls",
						"icon": "$(call-outgoing)"
					},
					{
						"command": "references-view.showIncomingCalls",
						"title": "Show Incoming Calls",
						"category": "Calls",
						"icon": "$(call-incoming)"
					},
					{
						"command": "references-view.removeCallItem",
						"title": "Dismiss",
						"icon": "$(close)"
					},
					{
						"command": "references-view.next",
						"title": "Go to Next Reference",
						"enablement": "references-view.canNavigate"
					},
					{
						"command": "references-view.prev",
						"title": "Go to Previous Reference",
						"enablement": "references-view.canNavigate"
					},
					{
						"command": "references-view.showTypeHierarchy",
						"title": "Show Type Hierarchy",
						"category": "Types"
					},
					{
						"command": "references-view.showSupertypes",
						"title": "Show Supertypes",
						"category": "Types",
						"icon": "$(type-hierarchy-super)"
					},
					{
						"command": "references-view.showSubtypes",
						"title": "Show Subtypes",
						"category": "Types",
						"icon": "$(type-hierarchy-sub)"
					},
					{
						"command": "references-view.removeTypeItem",
						"title": "Dismiss",
						"icon": "$(close)"
					}
				],
				"menus": {
					"editor/context": [
						{
							"command": "references-view.findReferences",
							"when": "editorHasReferenceProvider",
							"group": "0_navigation@1"
						},
						{
							"command": "references-view.findImplementations",
							"when": "editorHasImplementationProvider",
							"group": "0_navigation@2"
						},
						{
							"command": "references-view.showCallHierarchy",
							"when": "editorHasCallHierarchyProvider",
							"group": "0_navigation@3"
						},
						{
							"command": "references-view.showTypeHierarchy",
							"when": "editorHasTypeHierarchyProvider",
							"group": "0_navigation@4"
						}
					],
					"view/title": [
						{
							"command": "references-view.clear",
							"group": "navigation@3",
							"when": "view == references-view.tree && reference-list.hasResult"
						},
						{
							"command": "references-view.clearHistory",
							"group": "navigation@3",
							"when": "view == references-view.tree && reference-list.hasHistory && !reference-list.hasResult"
						},
						{
							"command": "references-view.refresh",
							"group": "navigation@2",
							"when": "view == references-view.tree && reference-list.hasResult"
						},
						{
							"command": "references-view.showOutgoingCalls",
							"group": "navigation@1",
							"when": "view == references-view.tree && reference-list.hasResult && reference-list.source == callHierarchy &&  references-view.callHierarchyMode == showIncoming"
						},
						{
							"command": "references-view.showIncomingCalls",
							"group": "navigation@1",
							"when": "view == references-view.tree && reference-list.hasResult && reference-list.source == callHierarchy &&  references-view.callHierarchyMode == showOutgoing"
						},
						{
							"command": "references-view.showSupertypes",
							"group": "navigation@1",
							"when": "view == references-view.tree && reference-list.hasResult && reference-list.source == typeHierarchy &&  references-view.typeHierarchyMode != supertypes"
						},
						{
							"command": "references-view.showSubtypes",
							"group": "navigation@1",
							"when": "view == references-view.tree && reference-list.hasResult && reference-list.source == typeHierarchy &&  references-view.typeHierarchyMode != subtypes"
						}
					],
					"view/item/context": [
						{
							"command": "references-view.removeReferenceItem",
							"group": "inline",
							"when": "view == references-view.tree && viewItem == file-item || view == references-view.tree && viewItem == reference-item"
						},
						{
							"command": "references-view.removeCallItem",
							"group": "inline",
							"when": "view == references-view.tree && viewItem == call-item"
						},
						{
							"command": "references-view.removeTypeItem",
							"group": "inline",
							"when": "view == references-view.tree && viewItem == type-item"
						},
						{
							"command": "references-view.refind",
							"group": "inline",
							"when": "view == references-view.tree && viewItem == history-item"
						},
						{
							"command": "references-view.removeReferenceItem",
							"group": "1",
							"when": "view == references-view.tree && viewItem == file-item || view == references-view.tree && viewItem == reference-item"
						},
						{
							"command": "references-view.removeCallItem",
							"group": "1",
							"when": "view == references-view.tree && viewItem == call-item"
						},
						{
							"command": "references-view.removeTypeItem",
							"group": "1",
							"when": "view == references-view.tree && viewItem == type-item"
						},
						{
							"command": "references-view.refind",
							"group": "1",
							"when": "view == references-view.tree && viewItem == history-item"
						},
						{
							"command": "references-view.copy",
							"group": "2@1",
							"when": "view == references-view.tree && viewItem == file-item || view == references-view.tree && viewItem == reference-item"
						},
						{
							"command": "references-view.copyPath",
							"group": "2@2",
							"when": "view == references-view.tree && viewItem == file-item"
						},
						{
							"command": "references-view.copyAll",
							"group": "2@3",
							"when": "view == references-view.tree && viewItem == file-item || view == references-view.tree && viewItem == reference-item"
						},
						{
							"command": "references-view.showOutgoingCalls",
							"group": "1",
							"when": "view == references-view.tree && viewItem == call-item"
						},
						{
							"command": "references-view.showIncomingCalls",
							"group": "1",
							"when": "view == references-view.tree && viewItem == call-item"
						},
						{
							"command": "references-view.showSupertypes",
							"group": "1",
							"when": "view == references-view.tree && viewItem == type-item"
						},
						{
							"command": "references-view.showSubtypes",
							"group": "1",
							"when": "view == references-view.tree && viewItem == type-item"
						}
					],
					"commandPalette": [
						{
							"command": "references-view.removeReferenceItem",
							"when": "never"
						},
						{
							"command": "references-view.removeCallItem",
							"when": "never"
						},
						{
							"command": "references-view.removeTypeItem",
							"when": "never"
						},
						{
							"command": "references-view.copy",
							"when": "never"
						},
						{
							"command": "references-view.copyAll",
							"when": "never"
						},
						{
							"command": "references-view.copyPath",
							"when": "never"
						},
						{
							"command": "references-view.refind",
							"when": "never"
						},
						{
							"command": "references-view.findReferences",
							"when": "editorHasReferenceProvider"
						},
						{
							"command": "references-view.clear",
							"when": "reference-list.hasResult"
						},
						{
							"command": "references-view.clearHistory",
							"when": "reference-list.isActive && !reference-list.hasResult"
						},
						{
							"command": "references-view.refresh",
							"when": "reference-list.hasResult"
						},
						{
							"command": "references-view.pickFromHistory",
							"when": "reference-list.isActive"
						},
						{
							"command": "references-view.next",
							"when": "never"
						},
						{
							"command": "references-view.prev",
							"when": "never"
						}
					]
				},
				"keybindings": [
					{
						"command": "references-view.findReferences",
						"when": "editorHasReferenceProvider",
						"key": "shift+alt+f12"
					},
					{
						"command": "references-view.next",
						"when": "reference-list.hasResult",
						"key": "f4"
					},
					{
						"command": "references-view.prev",
						"when": "reference-list.hasResult",
						"key": "shift+f4"
					},
					{
						"command": "references-view.showCallHierarchy",
						"when": "editorHasCallHierarchyProvider",
						"key": "shift+alt+h"
					}
				]
			},
			"__metadata": {
				"id": "dc489f46-520d-4556-ae85-1f9eab3c412d",
				"publisherId": {
					"publisherId": "5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee",
					"publisherName": "ms-vscode",
					"displayName": "Microsoft",
					"flags": "verified"
				},
				"publisherDisplayName": "Microsoft"
			}
		},
		"readmePath": "ms-vscode.references-view/README.md"
	},
	{
		"extensionPath": "npm",
		"packageJSON": {
			"name": "npm",
			"publisher": "vscode",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.1",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"icon": "images/npm_icon.png",
			"categories": [
				"Other"
			],
			"resolutions": {
				"which-pm/load-yaml-file/**/argparse": "1.0.9"
			},
			"main": "./dist/npmMain",
			"browser": "./dist/browser/npmBrowserMain",
			"activationEvents": [
				"onTaskType:npm",
				"onCommand:npm.runScriptFromFolder",
				"onLanguage:json",
				"workspaceContains:package.json",
				"onView:npm"
			],
			"capabilities": {
				"virtualWorkspaces": false,
				"untrustedWorkspaces": {
					"supported": "limited",
					"description": "%workspaceTrust%"
				}
			},
			"contributes": {
				"languages": [
					{
						"id": "ignore",
						"extensions": [
							".npmignore"
						]
					},
					{
						"id": "properties",
						"extensions": [
							".npmrc"
						]
					}
				],
				"views": {
					"explorer": [
						{
							"id": "npm",
							"name": "%view.name%",
							"when": "npm:showScriptExplorer",
							"icon": "$(json)",
							"visibility": "hidden",
							"contextualTitle": "%view.name%"
						}
					]
				},
				"commands": [
					{
						"command": "npm.runScript",
						"title": "%command.run%",
						"icon": "$(run)"
					},
					{
						"command": "npm.debugScript",
						"title": "%command.debug%",
						"icon": "$(debug)"
					},
					{
						"command": "npm.openScript",
						"title": "%command.openScript%"
					},
					{
						"command": "npm.runInstall",
						"title": "%command.runInstall%"
					},
					{
						"command": "npm.refresh",
						"title": "%command.refresh%",
						"icon": "$(refresh)"
					},
					{
						"command": "npm.runSelectedScript",
						"title": "%command.runSelectedScript%"
					},
					{
						"command": "npm.runScriptFromFolder",
						"title": "%command.runScriptFromFolder%"
					},
					{
						"command": "npm.packageManager",
						"title": "%command.packageManager%"
					}
				],
				"menus": {
					"commandPalette": [
						{
							"command": "npm.refresh",
							"when": "false"
						},
						{
							"command": "npm.runScript",
							"when": "false"
						},
						{
							"command": "npm.debugScript",
							"when": "false"
						},
						{
							"command": "npm.openScript",
							"when": "false"
						},
						{
							"command": "npm.runInstall",
							"when": "false"
						},
						{
							"command": "npm.runSelectedScript",
							"when": "false"
						},
						{
							"command": "npm.runScriptFromFolder",
							"when": "false"
						},
						{
							"command": "npm.packageManager",
							"when": "false"
						}
					],
					"editor/context": [
						{
							"command": "npm.runSelectedScript",
							"when": "resourceFilename == 'package.json' && resourceScheme == file",
							"group": "navigation@+1"
						}
					],
					"view/title": [
						{
							"command": "npm.refresh",
							"when": "view == npm",
							"group": "navigation"
						}
					],
					"view/item/context": [
						{
							"command": "npm.openScript",
							"when": "view == npm && viewItem == packageJSON",
							"group": "navigation@1"
						},
						{
							"command": "npm.runInstall",
							"when": "view == npm && viewItem == packageJSON",
							"group": "navigation@2"
						},
						{
							"command": "npm.openScript",
							"when": "view == npm && viewItem == script",
							"group": "navigation@1"
						},
						{
							"command": "npm.runScript",
							"when": "view == npm && viewItem == script",
							"group": "navigation@2"
						},
						{
							"command": "npm.runScript",
							"when": "view == npm && viewItem == script",
							"group": "inline"
						},
						{
							"command": "npm.debugScript",
							"when": "view == npm && viewItem == script",
							"group": "inline"
						},
						{
							"command": "npm.debugScript",
							"when": "view == npm && viewItem == script",
							"group": "navigation@3"
						}
					],
					"explorer/context": [
						{
							"when": "config.npm.enableRunFromFolder && explorerViewletVisible && explorerResourceIsFolder && resourceScheme == file",
							"command": "npm.runScriptFromFolder",
							"group": "2_workspace"
						}
					]
				},
				"configuration": {
					"id": "npm",
					"type": "object",
					"title": "Npm",
					"properties": {
						"npm.autoDetect": {
							"type": "string",
							"enum": [
								"off",
								"on"
							],
							"default": "on",
							"scope": "resource",
							"description": "%config.npm.autoDetect%"
						},
						"npm.runSilent": {
							"type": "boolean",
							"default": false,
							"scope": "resource",
							"markdownDescription": "%config.npm.runSilent%"
						},
						"npm.packageManager": {
							"scope": "resource",
							"type": "string",
							"enum": [
								"auto",
								"npm",
								"yarn",
								"pnpm"
							],
							"enumDescriptions": [
								"%config.npm.packageManager.auto%",
								"%config.npm.packageManager.npm%",
								"%config.npm.packageManager.yarn%",
								"%config.npm.packageManager.pnpm%"
							],
							"default": "auto",
							"description": "%config.npm.packageManager%"
						},
						"npm.exclude": {
							"type": [
								"string",
								"array"
							],
							"items": {
								"type": "string"
							},
							"description": "%config.npm.exclude%",
							"scope": "resource"
						},
						"npm.enableScriptExplorer": {
							"type": "boolean",
							"default": false,
							"scope": "resource",
							"deprecationMessage": "The NPM Script Explorer is now available in 'Views' menu in the Explorer in all folders.",
							"description": "%config.npm.enableScriptExplorer%"
						},
						"npm.enableRunFromFolder": {
							"type": "boolean",
							"default": false,
							"scope": "resource",
							"description": "%config.npm.enableRunFromFolder%"
						},
						"npm.scriptExplorerAction": {
							"type": "string",
							"enum": [
								"open",
								"run"
							],
							"markdownDescription": "%config.npm.scriptExplorerAction%",
							"scope": "window",
							"default": "open"
						},
						"npm.scriptExplorerExclude": {
							"type": "array",
							"items": {
								"type": "string"
							},
							"markdownDescription": "%config.npm.scriptExplorerExclude%",
							"scope": "resource",
							"default": []
						},
						"npm.fetchOnlinePackageInfo": {
							"type": "boolean",
							"description": "%config.npm.fetchOnlinePackageInfo%",
							"default": true,
							"scope": "window",
							"tags": [
								"usesOnlineServices"
							]
						}
					}
				},
				"jsonValidation": [
					{
						"fileMatch": "package.json",
						"url": "https://json.schemastore.org/package"
					},
					{
						"fileMatch": "bower.json",
						"url": "https://json.schemastore.org/bower"
					}
				],
				"taskDefinitions": [
					{
						"type": "npm",
						"required": [
							"script"
						],
						"properties": {
							"script": {
								"type": "string",
								"description": "%taskdef.script%"
							},
							"path": {
								"type": "string",
								"description": "%taskdef.path%"
							}
						},
						"when": "shellExecutionSupported"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"description": "Extension to add task support for npm scripts.",
			"displayName": "NPM support for VS Code",
			"workspaceTrust": "This extension executes tasks, which require trust to run.",
			"config.npm.autoDetect": "Controls whether npm scripts should be automatically detected.",
			"config.npm.runSilent": "Run npm commands with the `--silent` option.",
			"config.npm.packageManager": "The package manager used to run scripts.",
			"config.npm.packageManager.npm": "Use npm as the package manager for running scripts.",
			"config.npm.packageManager.yarn": "Use yarn as the package manager for running scripts.",
			"config.npm.packageManager.pnpm": "Use pnpm as the package manager for running scripts.",
			"config.npm.packageManager.auto": "Auto-detect which package manager to use for running scripts based on lock files and installed package managers.",
			"config.npm.exclude": "Configure glob patterns for folders that should be excluded from automatic script detection.",
			"config.npm.enableScriptExplorer": "Enable an explorer view for npm scripts when there is no top-level 'package.json' file.",
			"config.npm.scriptExplorerAction": "The default click action used in the npm scripts explorer: `open` or `run`, the default is `open`.",
			"config.npm.scriptExplorerExclude": "An array of regular expressions that indicate which scripts should be excluded from the NPM Scripts view.",
			"config.npm.enableRunFromFolder": "Enable running npm scripts contained in a folder from the Explorer context menu.",
			"config.npm.fetchOnlinePackageInfo": "Fetch data from https://registry.npmjs.org and https://registry.bower.io to provide auto-completion and information on hover features on npm dependencies.",
			"npm.parseError": "Npm task detection: failed to parse the file {0}",
			"taskdef.script": "The npm script to customize.",
			"taskdef.path": "The path to the folder of the package.json file that provides the script. Can be omitted.",
			"view.name": "NPM Scripts",
			"command.refresh": "Refresh",
			"command.run": "Run",
			"command.debug": "Debug",
			"command.openScript": "Open",
			"command.runInstall": "Run Install",
			"command.runSelectedScript": "Run Script",
			"command.runScriptFromFolder": "Run NPM Script in Folder...",
			"command.packageManager": "Get Configured Package Manager"
		},
		"readmePath": "npm/README.md"
	},
	{
		"extensionPath": "objective-c",
		"packageJSON": {
			"name": "objective-c",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammars.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "objective-c",
						"extensions": [
							".m"
						],
						"aliases": [
							"Objective-C"
						],
						"configuration": "./language-configuration.json"
					},
					{
						"id": "objective-cpp",
						"extensions": [
							".mm"
						],
						"aliases": [
							"Objective-C++"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "objective-c",
						"scopeName": "source.objc",
						"path": "./syntaxes/objective-c.tmLanguage.json"
					},
					{
						"language": "objective-cpp",
						"scopeName": "source.objcpp",
						"path": "./syntaxes/objective-c++.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Objective-C Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Objective-C files."
		}
	},
	{
		"extensionPath": "perl",
		"packageJSON": {
			"name": "perl",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/perl.tmbundle Syntaxes/Perl.plist ./syntaxes/perl.tmLanguage.json Syntaxes/Perl%206.tmLanguage ./syntaxes/perl6.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "perl",
						"aliases": [
							"Perl",
							"perl"
						],
						"extensions": [
							".pl",
							".pm",
							".pod",
							".t",
							".PL",
							".psgi"
						],
						"firstLine": "^#!.*\\bperl\\b",
						"configuration": "./perl.language-configuration.json"
					},
					{
						"id": "perl6",
						"aliases": [
							"Perl 6",
							"perl6"
						],
						"extensions": [
							".p6",
							".pl6",
							".pm6",
							".nqp"
						],
						"firstLine": "(^#!.*\\bperl6\\b)|use\\s+v6",
						"configuration": "./perl6.language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "perl",
						"scopeName": "source.perl",
						"path": "./syntaxes/perl.tmLanguage.json"
					},
					{
						"language": "perl6",
						"scopeName": "source.perl.6",
						"path": "./syntaxes/perl6.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Perl Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Perl files."
		}
	},
	{
		"extensionPath": "php",
		"packageJSON": {
			"name": "php",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"contributes": {
				"languages": [
					{
						"id": "php",
						"extensions": [
							".php",
							".php4",
							".php5",
							".phtml",
							".ctp"
						],
						"aliases": [
							"PHP",
							"php"
						],
						"firstLine": "^#!\\s*/.*\\bphp\\b",
						"mimetypes": [
							"application/x-php"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "php",
						"scopeName": "source.php",
						"path": "./syntaxes/php.tmLanguage.json"
					},
					{
						"language": "php",
						"scopeName": "text.html.php",
						"path": "./syntaxes/html.tmLanguage.json",
						"embeddedLanguages": {
							"text.html": "html",
							"source.php": "php",
							"source.sql": "sql",
							"text.xml": "xml",
							"source.js": "javascript",
							"source.json": "json",
							"source.css": "css"
						}
					}
				],
				"snippets": [
					{
						"language": "php",
						"path": "./snippets/php.code-snippets"
					}
				]
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammar.js"
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "PHP Language Basics",
			"description": "Provides syntax highlighting and bracket matching for PHP files."
		}
	},
	{
		"extensionPath": "powershell",
		"packageJSON": {
			"name": "powershell",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"languages": [
					{
						"id": "powershell",
						"extensions": [
							".ps1",
							".psm1",
							".psd1",
							".pssc",
							".psrc"
						],
						"aliases": [
							"PowerShell",
							"powershell",
							"ps",
							"ps1"
						],
						"firstLine": "^#!\\s*/.*\\bpwsh\\b",
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "powershell",
						"scopeName": "source.powershell",
						"path": "./syntaxes/powershell.tmLanguage.json"
					}
				],
				"snippets": [
					{
						"language": "powershell",
						"path": "./snippets/powershell.code-snippets"
					}
				]
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin PowerShell/EditorSyntax PowerShellSyntax.tmLanguage ./syntaxes/powershell.tmLanguage.json"
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Powershell Language Basics",
			"description": "Provides snippets, syntax highlighting, bracket matching and folding in Powershell files."
		}
	},
	{
		"extensionPath": "pug",
		"packageJSON": {
			"name": "pug",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin davidrios/pug-tmbundle Syntaxes/Pug.JSON-tmLanguage ./syntaxes/pug.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "jade",
						"extensions": [
							".pug",
							".jade"
						],
						"aliases": [
							"Pug",
							"Jade",
							"jade"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "jade",
						"scopeName": "text.pug",
						"path": "./syntaxes/pug.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Pug Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Pug files."
		}
	},
	{
		"extensionPath": "python",
		"packageJSON": {
			"name": "python",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"extensionKind": [
				"ui",
				"workspace"
			],
			"contributes": {
				"languages": [
					{
						"id": "python",
						"extensions": [
							".py",
							".rpy",
							".pyw",
							".cpy",
							".gyp",
							".gypi",
							".pyi",
							".ipy",
							".pyt"
						],
						"aliases": [
							"Python",
							"py"
						],
						"filenames": [
							"Snakefile",
							"SConstruct",
							"SConscript"
						],
						"firstLine": "^#!\\s*/?.*\\bpython[0-9.-]*\\b",
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "python",
						"scopeName": "source.python",
						"path": "./syntaxes/MagicPython.tmLanguage.json"
					},
					{
						"scopeName": "source.regexp.python",
						"path": "./syntaxes/MagicRegExp.tmLanguage.json"
					}
				]
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin MagicStack/MagicPython grammars/MagicPython.tmLanguage ./syntaxes/MagicPython.tmLanguage.json grammars/MagicRegExp.tmLanguage ./syntaxes/MagicRegExp.tmLanguage.json"
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Python Language Basics",
			"description": "Provides syntax highlighting, bracket matching and folding in Python files."
		}
	},
	{
		"extensionPath": "r",
		"packageJSON": {
			"name": "r",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin Ikuyadeu/vscode-R syntax/r.json ./syntaxes/r.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "r",
						"extensions": [
							".r",
							".rhistory",
							".rprofile",
							".rt"
						],
						"aliases": [
							"R",
							"r"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "r",
						"scopeName": "source.r",
						"path": "./syntaxes/r.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "R Language Basics",
			"description": "Provides syntax highlighting and bracket matching in R files."
		}
	},
	{
		"extensionPath": "razor",
		"packageJSON": {
			"name": "razor",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "0.10.x"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin demyte/language-cshtml grammars/cshtml.json ./syntaxes/cshtml.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "razor",
						"extensions": [
							".cshtml"
						],
						"aliases": [
							"Razor",
							"razor"
						],
						"mimetypes": [
							"text/x-cshtml"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "razor",
						"scopeName": "text.html.cshtml",
						"path": "./syntaxes/cshtml.tmLanguage.json",
						"embeddedLanguages": {
							"section.embedded.source.cshtml": "csharp",
							"source.css": "css",
							"source.js": "javascript"
						}
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Razor Language Basics",
			"description": "Provides syntax highlighting, bracket matching and folding in Razor files."
		}
	},
	{
		"extensionPath": "ruby",
		"packageJSON": {
			"name": "ruby",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/ruby.tmbundle Syntaxes/Ruby.plist ./syntaxes/ruby.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "ruby",
						"extensions": [
							".rb",
							".rbx",
							".rjs",
							".gemspec",
							".rake",
							".ru",
							".erb",
							".podspec",
							".rbi"
						],
						"filenames": [
							"rakefile",
							"gemfile",
							"guardfile",
							"podfile",
							"capfile",
							"cheffile",
							"hobofile",
							"vagrantfile",
							"appraisals",
							"rantfile",
							"berksfile",
							"berksfile.lock",
							"thorfile",
							"puppetfile",
							"dangerfile",
							"brewfile",
							"fastfile",
							"appfile",
							"deliverfile",
							"matchfile",
							"scanfile",
							"snapfile",
							"gymfile"
						],
						"aliases": [
							"Ruby",
							"rb"
						],
						"firstLine": "^#!\\s*/.*\\bruby\\b",
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "ruby",
						"scopeName": "source.ruby",
						"path": "./syntaxes/ruby.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Ruby Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Ruby files."
		}
	},
	{
		"extensionPath": "rust",
		"packageJSON": {
			"name": "rust",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin dustypomerleau/rust-syntax syntaxes/rust.tmLanguage.json ./syntaxes/rust.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "rust",
						"extensions": [
							".rs"
						],
						"aliases": [
							"Rust",
							"rust"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "rust",
						"path": "./syntaxes/rust.tmLanguage.json",
						"scopeName": "source.rust"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Rust Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Rust files."
		}
	},
	{
		"extensionPath": "scss",
		"packageJSON": {
			"name": "scss",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin atom/language-sass grammars/scss.cson ./syntaxes/scss.tmLanguage.json grammars/sassdoc.cson ./syntaxes/sassdoc.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "scss",
						"aliases": [
							"SCSS",
							"scss"
						],
						"extensions": [
							".scss"
						],
						"mimetypes": [
							"text/x-scss",
							"text/scss"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "scss",
						"scopeName": "source.css.scss",
						"path": "./syntaxes/scss.tmLanguage.json"
					},
					{
						"scopeName": "source.sassdoc",
						"path": "./syntaxes/sassdoc.tmLanguage.json"
					}
				],
				"problemMatchers": [
					{
						"name": "node-sass",
						"label": "Node Sass Compiler",
						"owner": "node-sass",
						"fileLocation": "absolute",
						"pattern": [
							{
								"regexp": "^{$"
							},
							{
								"regexp": "\\s*\"status\":\\s\\d+,"
							},
							{
								"regexp": "\\s*\"file\":\\s\"(.*)\",",
								"file": 1
							},
							{
								"regexp": "\\s*\"line\":\\s(\\d+),",
								"line": 1
							},
							{
								"regexp": "\\s*\"column\":\\s(\\d+),",
								"column": 1
							},
							{
								"regexp": "\\s*\"message\":\\s\"(.*)\",",
								"message": 1
							},
							{
								"regexp": "\\s*\"formatted\":\\s(.*)"
							},
							{
								"regexp": "^}$"
							}
						]
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "SCSS Language Basics",
			"description": "Provides syntax highlighting, bracket matching and folding in SCSS files."
		}
	},
	{
		"extensionPath": "search-result",
		"packageJSON": {
			"name": "search-result",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"icon": "images/icon.png",
			"engines": {
				"vscode": "^1.39.0"
			},
			"categories": [
				"Programming Languages"
			],
			"main": "./dist/extension.js",
			"browser": "./dist/extension.js",
			"activationEvents": [
				"onLanguage:search-result"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"enabledApiProposals": [
				"documentFiltersExclusive"
			],
			"contributes": {
				"configurationDefaults": {
					"[search-result]": {
						"editor.lineNumbers": "off"
					}
				},
				"languages": [
					{
						"id": "search-result",
						"extensions": [
							".code-search"
						],
						"aliases": [
							"Search Result"
						]
					}
				],
				"grammars": [
					{
						"language": "search-result",
						"scopeName": "text.searchResult",
						"path": "./syntaxes/searchResult.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Search Result",
			"description": "Provides syntax highlighting and language features for tabbed search results."
		},
		"readmePath": "search-result/README.md"
	},
	{
		"extensionPath": "shaderlab",
		"packageJSON": {
			"name": "shaderlab",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin tgjones/shaders-tmLanguage grammars/shaderlab.json ./syntaxes/shaderlab.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "shaderlab",
						"extensions": [
							".shader"
						],
						"aliases": [
							"ShaderLab",
							"shaderlab"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "shaderlab",
						"path": "./syntaxes/shaderlab.tmLanguage.json",
						"scopeName": "source.shaderlab"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Shaderlab Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Shaderlab files."
		}
	},
	{
		"extensionPath": "shellscript",
		"packageJSON": {
			"name": "shellscript",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin atom/language-shellscript grammars/shell-unix-bash.cson ./syntaxes/shell-unix-bash.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "shellscript",
						"aliases": [
							"Shell Script",
							"shellscript",
							"bash",
							"sh",
							"zsh",
							"ksh",
							"csh"
						],
						"extensions": [
							".sh",
							".bash",
							".bashrc",
							".bash_aliases",
							".bash_profile",
							".bash_login",
							".ebuild",
							".profile",
							".bash_logout",
							".xprofile",
							".xsession",
							".xsessionrc",
							".Xsession",
							".zsh",
							".zshrc",
							".zprofile",
							".zlogin",
							".zlogout",
							".zshenv",
							".zsh-theme",
							".ksh",
							".csh",
							".cshrc",
							".tcshrc",
							".yashrc",
							".yash_profile"
						],
						"filenames": [
							"APKBUILD",
							"PKGBUILD",
							".envrc",
							".hushlogin",
							"zshrc",
							"zshenv",
							"zlogin",
							"zprofile",
							"zlogout",
							"bashrc_Apple_Terminal",
							"zshrc_Apple_Terminal"
						],
						"firstLine": "^#!.*\\b(bash|zsh|sh|ksh|dtksh|pdksh|mksh|ash|dash|yash|sh|csh|jcsh|tcsh|itcsh).*|^#\\s*-\\*-[^*]*mode:\\s*shell-script[^*]*-\\*-",
						"configuration": "./language-configuration.json",
						"mimetypes": [
							"text/x-shellscript"
						]
					}
				],
				"grammars": [
					{
						"language": "shellscript",
						"scopeName": "source.shell",
						"path": "./syntaxes/shell-unix-bash.tmLanguage.json"
					}
				],
				"configurationDefaults": {
					"[shellscript]": {
						"files.eol": "\n"
					}
				}
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Shell Script Language Basics",
			"description": "Provides syntax highlighting and bracket matching in Shell Script files."
		}
	},
	{
		"extensionPath": "simple-browser",
		"packageJSON": {
			"name": "simple-browser",
			"displayName": "%displayName%",
			"description": "%description%",
			"enabledApiProposals": [
				"externalUriOpener"
			],
			"version": "1.0.0",
			"icon": "media/icon.png",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"engines": {
				"vscode": "^1.53.0"
			},
			"main": "./dist/extension",
			"browser": "./dist/browser/extension",
			"categories": [
				"Other"
			],
			"extensionKind": [
				"ui",
				"workspace"
			],
			"activationEvents": [
				"onCommand:simpleBrowser.show",
				"onCommand:simpleBrowser.api.open",
				"onOpenExternalUri:http",
				"onOpenExternalUri:https",
				"onWebviewPanel:simpleBrowser.view"
			],
			"capabilities": {
				"virtualWorkspaces": true,
				"untrustedWorkspaces": {
					"supported": true
				}
			},
			"contributes": {
				"commands": [
					{
						"command": "simpleBrowser.show",
						"title": "Show",
						"category": "Simple Browser"
					}
				],
				"configuration": [
					{
						"title": "Simple Browser",
						"properties": {
							"simpleBrowser.focusLockIndicator.enabled": {
								"type": "boolean",
								"default": true,
								"title": "Focus Lock Indicator Enabled",
								"description": "%configuration.focusLockIndicator.enabled.description%"
							}
						}
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Simple Browser",
			"description": "A very basic built-in webview for displaying web content.",
			"configuration.focusLockIndicator.enabled.description": "Enable/disable the floating indicator that shows when focused in the simple browser."
		},
		"readmePath": "simple-browser/README.md"
	},
	{
		"extensionPath": "sql",
		"packageJSON": {
			"name": "sql",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammar.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "sql",
						"extensions": [
							".sql",
							".dsql"
						],
						"aliases": [
							"SQL"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "sql",
						"scopeName": "source.sql",
						"path": "./syntaxes/sql.tmLanguage.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "SQL Language Basics",
			"description": "Provides syntax highlighting and bracket matching in SQL files."
		}
	},
	{
		"extensionPath": "swift",
		"packageJSON": {
			"name": "swift",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/swift.tmbundle Syntaxes/Swift.tmLanguage ./syntaxes/swift.tmLanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "swift",
						"aliases": [
							"Swift",
							"swift"
						],
						"extensions": [
							".swift"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "swift",
						"scopeName": "source.swift",
						"path": "./syntaxes/swift.tmLanguage.json"
					}
				],
				"snippets": [
					{
						"language": "swift",
						"path": "./snippets/swift.code-snippets"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Swift Language Basics",
			"description": "Provides snippets, syntax highlighting and bracket matching in Swift files."
		}
	},
	{
		"extensionPath": "theme-abyss",
		"packageJSON": {
			"name": "theme-abyss",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Abyss",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/abyss-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Abyss Theme",
			"description": "Abyss theme for Visual Studio Code",
			"themeLabel": "Abyss"
		}
	},
	{
		"extensionPath": "theme-defaults",
		"packageJSON": {
			"name": "theme-defaults",
			"displayName": "%displayName%",
			"description": "%description%",
			"categories": [
				"Themes"
			],
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Default Dark+",
						"label": "%darkPlusColorThemeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/dark_plus.json"
					},
					{
						"id": "Default Light+",
						"label": "%lightPlusColorThemeLabel%",
						"uiTheme": "vs",
						"path": "./themes/light_plus.json"
					},
					{
						"id": "Visual Studio Dark",
						"label": "%darkColorThemeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/dark_vs.json"
					},
					{
						"id": "Visual Studio Light",
						"label": "%lightColorThemeLabel%",
						"uiTheme": "vs",
						"path": "./themes/light_vs.json"
					},
					{
						"id": "Default High Contrast",
						"label": "%hcColorThemeLabel%",
						"uiTheme": "hc-black",
						"path": "./themes/hc_black.json"
					}
				],
				"iconThemes": [
					{
						"id": "vs-minimal",
						"label": "%minimalIconThemeLabel%",
						"path": "./fileicons/vs_minimal-icon-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Default Themes",
			"description": "The default Visual Studio light and dark themes",
			"darkPlusColorThemeLabel": "Dark+ (default dark)",
			"lightPlusColorThemeLabel": "Light+ (default light)",
			"darkColorThemeLabel": "Dark (Visual Studio)",
			"lightColorThemeLabel": "Light (Visual Studio)",
			"hcColorThemeLabel": "High Contrast",
			"minimalIconThemeLabel": "Minimal (Visual Studio Code)"
		}
	},
	{
		"extensionPath": "theme-kimbie-dark",
		"packageJSON": {
			"name": "theme-kimbie-dark",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Kimbie Dark",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/kimbie-dark-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Kimbie Dark Theme",
			"description": "Kimbie dark theme for Visual Studio Code",
			"themeLabel": "Kimbie Dark"
		}
	},
	{
		"extensionPath": "theme-monokai",
		"packageJSON": {
			"name": "theme-monokai",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Monokai",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/monokai-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Monokai Theme",
			"description": "Monokai theme for Visual Studio Code",
			"themeLabel": "Monokai"
		}
	},
	{
		"extensionPath": "theme-monokai-dimmed",
		"packageJSON": {
			"name": "theme-monokai-dimmed",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Monokai Dimmed",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/dimmed-monokai-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Monokai Dimmed Theme",
			"description": "Monokai dimmed theme for Visual Studio Code",
			"themeLabel": "Monokai Dimmed"
		}
	},
	{
		"extensionPath": "theme-quietlight",
		"packageJSON": {
			"name": "theme-quietlight",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Quiet Light",
						"label": "%themeLabel%",
						"uiTheme": "vs",
						"path": "./themes/quietlight-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Quiet Light Theme",
			"description": "Quiet light theme for Visual Studio Code",
			"themeLabel": "Quiet Light"
		}
	},
	{
		"extensionPath": "theme-red",
		"packageJSON": {
			"name": "theme-red",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Red",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/Red-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Red Theme",
			"description": "Red theme for Visual Studio Code",
			"themeLabel": "Red"
		}
	},
	{
		"extensionPath": "theme-seti",
		"packageJSON": {
			"name": "vscode-theme-seti",
			"private": true,
			"version": "1.0.0",
			"displayName": "%displayName%",
			"description": "%description%",
			"publisher": "vscode",
			"license": "MIT",
			"icon": "icons/seti-circular-128x128.png",
			"scripts": {
				"update": "node ./build/update-icon-theme.js"
			},
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"iconThemes": [
					{
						"id": "vs-seti",
						"label": "%themeLabel%",
						"path": "./icons/vs-seti-icon-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Seti File Icon Theme",
			"description": "A file icon theme made out of the Seti UI file icons",
			"themeLabel": "Seti (Visual Studio Code)"
		},
		"readmePath": "theme-seti/README.md"
	},
	{
		"extensionPath": "theme-solarized-dark",
		"packageJSON": {
			"name": "theme-solarized-dark",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Solarized Dark",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/solarized-dark-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Solarized Dark Theme",
			"description": "Solarized dark theme for Visual Studio Code",
			"themeLabel": "Solarized Dark"
		}
	},
	{
		"extensionPath": "theme-solarized-light",
		"packageJSON": {
			"name": "theme-solarized-light",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Solarized Light",
						"label": "%themeLabel%",
						"uiTheme": "vs",
						"path": "./themes/solarized-light-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Solarized Light Theme",
			"description": "Solarized light theme for Visual Studio Code",
			"themeLabel": "Solarized Light"
		}
	},
	{
		"extensionPath": "theme-tomorrow-night-blue",
		"packageJSON": {
			"name": "theme-tomorrow-night-blue",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"themes": [
					{
						"id": "Tomorrow Night Blue",
						"label": "%themeLabel%",
						"uiTheme": "vs-dark",
						"path": "./themes/tomorrow-night-blue-color-theme.json"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Tomorrow Night Blue Theme",
			"description": "Tomorrow night blue theme for Visual Studio Code",
			"themeLabel": "Tomorrow Night Blue"
		}
	},
	{
		"extensionPath": "typescript-basics",
		"packageJSON": {
			"name": "typescript",
			"description": "%description%",
			"displayName": "%displayName%",
			"version": "1.0.0",
			"author": "vscode",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ./build/update-grammars.js"
			},
			"contributes": {
				"languages": [
					{
						"id": "typescript",
						"aliases": [
							"TypeScript",
							"ts",
							"typescript"
						],
						"extensions": [
							".ts",
							".cts",
							".mts"
						],
						"configuration": "./language-configuration.json"
					},
					{
						"id": "typescriptreact",
						"aliases": [
							"TypeScript React",
							"tsx"
						],
						"extensions": [
							".tsx"
						],
						"configuration": "./language-configuration.json"
					},
					{
						"id": "jsonc",
						"filenames": [
							"tsconfig.json",
							"jsconfig.json"
						],
						"filenamePatterns": [
							"tsconfig.*.json",
							"jsconfig.*.json",
							"tsconfig-*.json",
							"jsconfig-*.json"
						]
					}
				],
				"grammars": [
					{
						"language": "typescript",
						"scopeName": "source.ts",
						"path": "./syntaxes/TypeScript.tmLanguage.json",
						"tokenTypes": {
							"meta.template.expression": "other",
							"meta.template.expression string": "string",
							"meta.template.expression comment": "comment",
							"entity.name.type.instance.jsdoc": "other",
							"entity.name.function.tagged-template": "other",
							"meta.import string.quoted": "other",
							"variable.other.jsdoc": "other"
						}
					},
					{
						"language": "typescriptreact",
						"scopeName": "source.tsx",
						"path": "./syntaxes/TypeScriptReact.tmLanguage.json",
						"embeddedLanguages": {
							"meta.tag.tsx": "jsx-tags",
							"meta.tag.without-attributes.tsx": "jsx-tags",
							"meta.tag.attributes.tsx": "typescriptreact",
							"meta.embedded.expression.tsx": "typescriptreact"
						},
						"tokenTypes": {
							"meta.template.expression": "other",
							"meta.template.expression string": "string",
							"meta.template.expression comment": "comment",
							"entity.name.type.instance.jsdoc": "other",
							"entity.name.function.tagged-template": "other",
							"meta.import string.quoted": "other",
							"variable.other.jsdoc": "other"
						}
					},
					{
						"scopeName": "documentation.injection.ts",
						"path": "./syntaxes/jsdoc.ts.injection.tmLanguage.json",
						"injectTo": [
							"source.ts",
							"source.tsx"
						]
					},
					{
						"scopeName": "documentation.injection.js.jsx",
						"path": "./syntaxes/jsdoc.js.injection.tmLanguage.json",
						"injectTo": [
							"source.js",
							"source.js.jsx"
						]
					}
				],
				"semanticTokenScopes": [
					{
						"language": "typescript",
						"scopes": {
							"property": [
								"variable.other.property.ts"
							],
							"property.readonly": [
								"variable.other.constant.property.ts"
							],
							"variable": [
								"variable.other.readwrite.ts"
							],
							"variable.readonly": [
								"variable.other.constant.object.ts"
							],
							"function": [
								"entity.name.function.ts"
							],
							"namespace": [
								"entity.name.type.module.ts"
							],
							"variable.defaultLibrary": [
								"support.variable.ts"
							],
							"function.defaultLibrary": [
								"support.function.ts"
							]
						}
					},
					{
						"language": "typescriptreact",
						"scopes": {
							"property": [
								"variable.other.property.tsx"
							],
							"property.readonly": [
								"variable.other.constant.property.tsx"
							],
							"variable": [
								"variable.other.readwrite.tsx"
							],
							"variable.readonly": [
								"variable.other.constant.object.tsx"
							],
							"function": [
								"entity.name.function.tsx"
							],
							"namespace": [
								"entity.name.type.module.tsx"
							],
							"variable.defaultLibrary": [
								"support.variable.tsx"
							],
							"function.defaultLibrary": [
								"support.function.tsx"
							]
						}
					}
				],
				"snippets": [
					{
						"language": "typescript",
						"path": "./snippets/typescript.code-snippets"
					},
					{
						"language": "typescriptreact",
						"path": "./snippets/typescript.code-snippets"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "TypeScript Language Basics",
			"description": "Provides snippets, syntax highlighting, bracket matching and folding in TypeScript files."
		}
	},
	{
		"extensionPath": "typescript-language-features",
		"packageJSON": {
			"name": "typescript-language-features",
			"description": "%description%",
			"displayName": "%displayName%",
			"version": "1.0.0",
			"author": "vscode",
			"publisher": "vscode",
			"license": "MIT",
			"aiKey": "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217",
			"enabledApiProposals": [
				"inlayHints",
				"languageStatus",
				"quickPickSeparators",
				"resolvers",
				"workspaceTrust"
			],
			"capabilities": {
				"virtualWorkspaces": {
					"supported": "limited",
					"description": "%virtualWorkspaces%"
				},
				"untrustedWorkspaces": {
					"supported": "limited",
					"description": "%workspaceTrust%",
					"restrictedConfigurations": [
						"typescript.tsdk",
						"typescript.tsserver.pluginPaths",
						"typescript.npm"
					]
				}
			},
			"engines": {
				"vscode": "^1.30.0"
			},
			"icon": "media/icon.png",
			"categories": [
				"Programming Languages"
			],
			"activationEvents": [
				"onLanguage:javascript",
				"onLanguage:javascriptreact",
				"onLanguage:typescript",
				"onLanguage:typescriptreact",
				"onLanguage:jsx-tags",
				"onCommand:typescript.reloadProjects",
				"onCommand:javascript.reloadProjects",
				"onCommand:typescript.selectTypeScriptVersion",
				"onCommand:javascript.goToProjectConfig",
				"onCommand:typescript.goToProjectConfig",
				"onCommand:typescript.openTsServerLog",
				"onCommand:typescript.tsserverRequest",
				"onCommand:_typescript.configurePlugin",
				"onCommand:_typescript.learnMoreAboutRefactorings",
				"onCommand:typescript.fileReferences",
				"onTaskType:typescript",
				"onLanguage:jsonc"
			],
			"main": "./dist/extension",
			"browser": "./dist/browser/extension",
			"contributes": {
				"jsonValidation": [
					{
						"fileMatch": "package.json",
						"url": "./schemas/package.schema.json"
					},
					{
						"fileMatch": "tsconfig.json",
						"url": "https://json.schemastore.org/tsconfig"
					},
					{
						"fileMatch": "tsconfig.json",
						"url": "./schemas/tsconfig.schema.json"
					},
					{
						"fileMatch": "tsconfig.*.json",
						"url": "https://json.schemastore.org/tsconfig"
					},
					{
						"fileMatch": "tsconfig-*.json",
						"url": "./schemas/tsconfig.schema.json"
					},
					{
						"fileMatch": "tsconfig-*.json",
						"url": "https://json.schemastore.org/tsconfig"
					},
					{
						"fileMatch": "tsconfig.*.json",
						"url": "./schemas/tsconfig.schema.json"
					},
					{
						"fileMatch": "typings.json",
						"url": "https://json.schemastore.org/typings"
					},
					{
						"fileMatch": ".bowerrc",
						"url": "https://json.schemastore.org/bowerrc"
					},
					{
						"fileMatch": ".babelrc",
						"url": "https://json.schemastore.org/babelrc"
					},
					{
						"fileMatch": ".babelrc.json",
						"url": "https://json.schemastore.org/babelrc"
					},
					{
						"fileMatch": "babel.config.json",
						"url": "https://json.schemastore.org/babelrc"
					},
					{
						"fileMatch": "jsconfig.json",
						"url": "https://json.schemastore.org/jsconfig"
					},
					{
						"fileMatch": "jsconfig.json",
						"url": "./schemas/jsconfig.schema.json"
					},
					{
						"fileMatch": "jsconfig.*.json",
						"url": "https://json.schemastore.org/jsconfig"
					},
					{
						"fileMatch": "jsconfig.*.json",
						"url": "./schemas/jsconfig.schema.json"
					}
				],
				"configuration": {
					"type": "object",
					"title": "%configuration.typescript%",
					"order": 20,
					"properties": {
						"typescript.tsdk": {
							"type": "string",
							"markdownDescription": "%typescript.tsdk.desc%",
							"scope": "window"
						},
						"typescript.disableAutomaticTypeAcquisition": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%typescript.disableAutomaticTypeAcquisition%",
							"scope": "window",
							"tags": [
								"usesOnlineServices"
							]
						},
						"typescript.enablePromptUseWorkspaceTsdk": {
							"type": "boolean",
							"default": false,
							"description": "%typescript.enablePromptUseWorkspaceTsdk%",
							"scope": "window"
						},
						"typescript.npm": {
							"type": "string",
							"markdownDescription": "%typescript.npm%",
							"scope": "machine"
						},
						"typescript.check.npmIsInstalled": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%typescript.check.npmIsInstalled%",
							"scope": "window"
						},
						"javascript.referencesCodeLens.enabled": {
							"type": "boolean",
							"default": false,
							"description": "%javascript.referencesCodeLens.enabled%",
							"scope": "window"
						},
						"javascript.referencesCodeLens.showOnAllFunctions": {
							"type": "boolean",
							"default": false,
							"description": "%javascript.referencesCodeLens.showOnAllFunctions%",
							"scope": "window"
						},
						"typescript.referencesCodeLens.enabled": {
							"type": "boolean",
							"default": false,
							"description": "%typescript.referencesCodeLens.enabled%",
							"scope": "window"
						},
						"typescript.referencesCodeLens.showOnAllFunctions": {
							"type": "boolean",
							"default": false,
							"description": "%typescript.referencesCodeLens.showOnAllFunctions%",
							"scope": "window"
						},
						"typescript.implementationsCodeLens.enabled": {
							"type": "boolean",
							"default": false,
							"description": "%typescript.implementationsCodeLens.enabled%",
							"scope": "window"
						},
						"typescript.tsserver.enableTracing": {
							"type": "boolean",
							"default": false,
							"description": "%typescript.tsserver.enableTracing%",
							"scope": "window"
						},
						"typescript.tsserver.log": {
							"type": "string",
							"enum": [
								"off",
								"terse",
								"normal",
								"verbose"
							],
							"default": "off",
							"description": "%typescript.tsserver.log%",
							"scope": "window"
						},
						"typescript.tsserver.pluginPaths": {
							"type": "array",
							"items": {
								"type": "string",
								"description": "%typescript.tsserver.pluginPaths.item%"
							},
							"default": [],
							"description": "%typescript.tsserver.pluginPaths%",
							"scope": "machine"
						},
						"typescript.tsserver.trace": {
							"type": "string",
							"enum": [
								"off",
								"messages",
								"verbose"
							],
							"default": "off",
							"description": "%typescript.tsserver.trace%",
							"scope": "window"
						},
						"javascript.suggest.completeFunctionCalls": {
							"type": "boolean",
							"default": false,
							"description": "%configuration.suggest.completeFunctionCalls%",
							"scope": "resource"
						},
						"typescript.suggest.completeFunctionCalls": {
							"type": "boolean",
							"default": false,
							"description": "%configuration.suggest.completeFunctionCalls%",
							"scope": "resource"
						},
						"javascript.suggest.includeAutomaticOptionalChainCompletions": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.includeAutomaticOptionalChainCompletions%",
							"scope": "resource"
						},
						"typescript.suggest.includeAutomaticOptionalChainCompletions": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.includeAutomaticOptionalChainCompletions%",
							"scope": "resource"
						},
						"typescript.inlayHints.parameterNames.enabled": {
							"type": "string",
							"enum": [
								"none",
								"literals",
								"all"
							],
							"enumDescriptions": [
								"%inlayHints.parameterNames.none%",
								"%inlayHints.parameterNames.literals%",
								"%inlayHints.parameterNames.all%"
							],
							"default": "none",
							"markdownDescription": "%configuration.inlayHints.parameterNames.enabled%",
							"scope": "resource"
						},
						"typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.inlayHints.parameterNames.suppressWhenArgumentMatchesName%",
							"scope": "resource"
						},
						"typescript.inlayHints.parameterTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.parameterTypes.enabled%",
							"scope": "resource"
						},
						"typescript.inlayHints.variableTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.variableTypes.enabled%",
							"scope": "resource"
						},
						"typescript.inlayHints.propertyDeclarationTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.propertyDeclarationTypes.enabled%",
							"scope": "resource"
						},
						"typescript.inlayHints.functionLikeReturnTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.functionLikeReturnTypes.enabled%",
							"scope": "resource"
						},
						"typescript.inlayHints.enumMemberValues.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.enumMemberValues.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.parameterNames.enabled": {
							"type": "string",
							"enum": [
								"none",
								"literals",
								"all"
							],
							"enumDescriptions": [
								"%inlayHints.parameterNames.none%",
								"%inlayHints.parameterNames.literals%",
								"%inlayHints.parameterNames.all%"
							],
							"default": "none",
							"markdownDescription": "%configuration.inlayHints.parameterNames.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.parameterNames.suppressWhenArgumentMatchesName": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.inlayHints.parameterNames.suppressWhenArgumentMatchesName%",
							"scope": "resource"
						},
						"javascript.inlayHints.parameterTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.parameterTypes.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.variableTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.variableTypes.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.propertyDeclarationTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.propertyDeclarationTypes.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.functionLikeReturnTypes.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.functionLikeReturnTypes.enabled%",
							"scope": "resource"
						},
						"javascript.inlayHints.enumMemberValues.enabled": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.inlayHints.enumMemberValues.enabled%",
							"scope": "resource"
						},
						"javascript.suggest.includeCompletionsForImportStatements": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.includeCompletionsForImportStatements%",
							"scope": "resource"
						},
						"typescript.suggest.includeCompletionsForImportStatements": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.includeCompletionsForImportStatements%",
							"scope": "resource"
						},
						"typescript.suggest.includeCompletionsWithSnippetText": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.includeCompletionsWithSnippetText%",
							"scope": "resource"
						},
						"typescript.reportStyleChecksAsWarnings": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.reportStyleChecksAsWarnings%",
							"scope": "window"
						},
						"typescript.validate.enable": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.validate.enable%",
							"scope": "window"
						},
						"typescript.format.enable": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.format.enable%",
							"scope": "window"
						},
						"typescript.format.insertSpaceAfterCommaDelimiter": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterCommaDelimiter%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterConstructor": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterConstructor%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterSemicolonInForStatements": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterSemicolonInForStatements%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceBeforeAndAfterBinaryOperators": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceBeforeAndAfterBinaryOperators%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterKeywordsInControlFlowStatements": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterKeywordsInControlFlowStatements%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterFunctionKeywordForAnonymousFunctions%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceBeforeFunctionParenthesis": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceBeforeFunctionParenthesis%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces%",
							"scope": "resource"
						},
						"typescript.format.insertSpaceAfterTypeAssertion": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterTypeAssertion%",
							"scope": "resource"
						},
						"typescript.format.placeOpenBraceOnNewLineForFunctions": {
							"type": "boolean",
							"default": false,
							"description": "%format.placeOpenBraceOnNewLineForFunctions%",
							"scope": "resource"
						},
						"typescript.format.placeOpenBraceOnNewLineForControlBlocks": {
							"type": "boolean",
							"default": false,
							"description": "%format.placeOpenBraceOnNewLineForControlBlocks%",
							"scope": "resource"
						},
						"typescript.format.semicolons": {
							"type": "string",
							"default": "ignore",
							"description": "%format.semicolons%",
							"scope": "resource",
							"enum": [
								"ignore",
								"insert",
								"remove"
							],
							"enumDescriptions": [
								"%format.semicolons.ignore%",
								"%format.semicolons.insert%",
								"%format.semicolons.remove%"
							]
						},
						"javascript.validate.enable": {
							"type": "boolean",
							"default": true,
							"description": "%javascript.validate.enable%",
							"scope": "window"
						},
						"javascript.format.enable": {
							"type": "boolean",
							"default": true,
							"description": "%javascript.format.enable%",
							"scope": "window"
						},
						"javascript.format.insertSpaceAfterCommaDelimiter": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterCommaDelimiter%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterConstructor": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterConstructor%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterSemicolonInForStatements": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterSemicolonInForStatements%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceBeforeAndAfterBinaryOperators": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceBeforeAndAfterBinaryOperators%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterKeywordsInControlFlowStatements": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterKeywordsInControlFlowStatements%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterFunctionKeywordForAnonymousFunctions%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceBeforeFunctionParenthesis": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceBeforeFunctionParenthesis%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces": {
							"type": "boolean",
							"default": true,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces%",
							"scope": "resource"
						},
						"javascript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": {
							"type": "boolean",
							"default": false,
							"description": "%format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces%",
							"scope": "resource"
						},
						"javascript.format.placeOpenBraceOnNewLineForFunctions": {
							"type": "boolean",
							"default": false,
							"description": "%format.placeOpenBraceOnNewLineForFunctions%",
							"scope": "resource"
						},
						"javascript.format.placeOpenBraceOnNewLineForControlBlocks": {
							"type": "boolean",
							"default": false,
							"description": "%format.placeOpenBraceOnNewLineForControlBlocks%",
							"scope": "resource"
						},
						"javascript.format.semicolons": {
							"type": "string",
							"default": "ignore",
							"description": "%format.semicolons%",
							"scope": "resource",
							"enum": [
								"ignore",
								"insert",
								"remove"
							],
							"enumDescriptions": [
								"%format.semicolons.ignore%",
								"%format.semicolons.insert%",
								"%format.semicolons.remove%"
							]
						},
						"javascript.implicitProjectConfig.checkJs": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.implicitProjectConfig.checkJs%",
							"markdownDeprecationMessage": "%configuration.javascript.checkJs.checkJs.deprecation%",
							"scope": "window"
						},
						"js/ts.implicitProjectConfig.checkJs": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.implicitProjectConfig.checkJs%",
							"scope": "window"
						},
						"javascript.implicitProjectConfig.experimentalDecorators": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.implicitProjectConfig.experimentalDecorators%",
							"markdownDeprecationMessage": "%configuration.javascript.checkJs.experimentalDecorators.deprecation%",
							"scope": "window"
						},
						"js/ts.implicitProjectConfig.experimentalDecorators": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.implicitProjectConfig.experimentalDecorators%",
							"scope": "window"
						},
						"js/ts.implicitProjectConfig.strictNullChecks": {
							"type": "boolean",
							"default": false,
							"markdownDescription": "%configuration.implicitProjectConfig.strictNullChecks%",
							"scope": "window"
						},
						"js/ts.implicitProjectConfig.strictFunctionTypes": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.implicitProjectConfig.strictFunctionTypes%",
							"scope": "window"
						},
						"javascript.suggest.names": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.suggest.names%",
							"scope": "resource"
						},
						"typescript.tsc.autoDetect": {
							"type": "string",
							"default": "on",
							"enum": [
								"on",
								"off",
								"build",
								"watch"
							],
							"markdownEnumDescriptions": [
								"%typescript.tsc.autoDetect.on%",
								"%typescript.tsc.autoDetect.off%",
								"%typescript.tsc.autoDetect.build%",
								"%typescript.tsc.autoDetect.watch%"
							],
							"description": "%typescript.tsc.autoDetect%",
							"scope": "window"
						},
						"javascript.suggest.paths": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.paths%",
							"scope": "resource"
						},
						"typescript.suggest.paths": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.paths%",
							"scope": "resource"
						},
						"javascript.suggest.autoImports": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.autoImports%",
							"scope": "resource"
						},
						"typescript.suggest.autoImports": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.autoImports%",
							"scope": "resource"
						},
						"javascript.suggest.completeJSDocs": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.completeJSDocs%",
							"scope": "resource"
						},
						"typescript.suggest.completeJSDocs": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.completeJSDocs%",
							"scope": "resource"
						},
						"javascript.suggest.jsdoc.generateReturns": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.suggest.jsdoc.generateReturns%",
							"scope": "resource"
						},
						"typescript.suggest.jsdoc.generateReturns": {
							"type": "boolean",
							"default": true,
							"markdownDescription": "%configuration.suggest.jsdoc.generateReturns%",
							"scope": "resource"
						},
						"typescript.locale": {
							"type": "string",
							"enum": [
								"de",
								"es",
								"en",
								"fr",
								"it",
								"ja",
								"ko",
								"ru",
								"zh-CN",
								"zh-TW"
							],
							"markdownDescription": "%typescript.locale%",
							"scope": "window"
						},
						"javascript.suggestionActions.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%javascript.suggestionActions.enabled%",
							"scope": "resource"
						},
						"typescript.suggestionActions.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.suggestionActions.enabled%",
							"scope": "resource"
						},
						"javascript.preferences.quoteStyle": {
							"type": "string",
							"enum": [
								"auto",
								"single",
								"double"
							],
							"default": "auto",
							"markdownDescription": "%typescript.preferences.quoteStyle%",
							"scope": "resource"
						},
						"typescript.preferences.quoteStyle": {
							"type": "string",
							"enum": [
								"auto",
								"single",
								"double"
							],
							"default": "auto",
							"markdownDescription": "%typescript.preferences.quoteStyle%",
							"scope": "resource"
						},
						"javascript.preferences.importModuleSpecifier": {
							"type": "string",
							"enum": [
								"shortest",
								"relative",
								"non-relative",
								"project-relative"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.importModuleSpecifier.shortest%",
								"%typescript.preferences.importModuleSpecifier.relative%",
								"%typescript.preferences.importModuleSpecifier.nonRelative%",
								"%typescript.preferences.importModuleSpecifier.projectRelative%"
							],
							"default": "shortest",
							"description": "%typescript.preferences.importModuleSpecifier%",
							"scope": "resource"
						},
						"typescript.preferences.importModuleSpecifier": {
							"type": "string",
							"enum": [
								"shortest",
								"relative",
								"non-relative",
								"project-relative"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.importModuleSpecifier.shortest%",
								"%typescript.preferences.importModuleSpecifier.relative%",
								"%typescript.preferences.importModuleSpecifier.nonRelative%",
								"%typescript.preferences.importModuleSpecifier.projectRelative%"
							],
							"default": "shortest",
							"description": "%typescript.preferences.importModuleSpecifier%",
							"scope": "resource"
						},
						"javascript.preferences.importModuleSpecifierEnding": {
							"type": "string",
							"enum": [
								"auto",
								"minimal",
								"index",
								"js"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.importModuleSpecifierEnding.auto%",
								"%typescript.preferences.importModuleSpecifierEnding.minimal%",
								"%typescript.preferences.importModuleSpecifierEnding.index%",
								"%typescript.preferences.importModuleSpecifierEnding.js%"
							],
							"default": "auto",
							"description": "%typescript.preferences.importModuleSpecifierEnding%",
							"scope": "resource"
						},
						"typescript.preferences.importModuleSpecifierEnding": {
							"type": "string",
							"enum": [
								"auto",
								"minimal",
								"index",
								"js"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.importModuleSpecifierEnding.auto%",
								"%typescript.preferences.importModuleSpecifierEnding.minimal%",
								"%typescript.preferences.importModuleSpecifierEnding.index%",
								"%typescript.preferences.importModuleSpecifierEnding.js%"
							],
							"default": "auto",
							"description": "%typescript.preferences.importModuleSpecifierEnding%",
							"scope": "resource"
						},
						"javascript.preferences.jsxAttributeCompletionStyle": {
							"type": "string",
							"enum": [
								"auto",
								"braces",
								"none"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.jsxAttributeCompletionStyle.auto%",
								"%typescript.preferences.jsxAttributeCompletionStyle.braces%",
								"%typescript.preferences.jsxAttributeCompletionStyle.none%"
							],
							"default": "auto",
							"description": "%typescript.preferences.jsxAttributeCompletionStyle%",
							"scope": "resource"
						},
						"typescript.preferences.jsxAttributeCompletionStyle": {
							"type": "string",
							"enum": [
								"auto",
								"braces",
								"none"
							],
							"markdownEnumDescriptions": [
								"%typescript.preferences.jsxAttributeCompletionStyle.auto%",
								"%typescript.preferences.jsxAttributeCompletionStyle.braces%",
								"%typescript.preferences.jsxAttributeCompletionStyle.none%"
							],
							"default": "auto",
							"description": "%typescript.preferences.jsxAttributeCompletionStyle%",
							"scope": "resource"
						},
						"typescript.preferences.includePackageJsonAutoImports": {
							"type": "string",
							"enum": [
								"auto",
								"on",
								"off"
							],
							"enumDescriptions": [
								"%typescript.preferences.includePackageJsonAutoImports.auto%",
								"%typescript.preferences.includePackageJsonAutoImports.on%",
								"%typescript.preferences.includePackageJsonAutoImports.off%"
							],
							"default": "auto",
							"markdownDescription": "%typescript.preferences.includePackageJsonAutoImports%",
							"scope": "window"
						},
						"javascript.preferences.renameShorthandProperties": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.preferences.useAliasesForRenames%",
							"deprecationMessage": "%typescript.preferences.renameShorthandProperties.deprecationMessage%",
							"scope": "resource"
						},
						"typescript.preferences.renameShorthandProperties": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.preferences.useAliasesForRenames%",
							"deprecationMessage": "%typescript.preferences.renameShorthandProperties.deprecationMessage%",
							"scope": "resource"
						},
						"javascript.preferences.useAliasesForRenames": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.preferences.useAliasesForRenames%",
							"scope": "resource"
						},
						"typescript.preferences.useAliasesForRenames": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.preferences.useAliasesForRenames%",
							"scope": "resource"
						},
						"typescript.updateImportsOnFileMove.enabled": {
							"type": "string",
							"enum": [
								"prompt",
								"always",
								"never"
							],
							"markdownEnumDescriptions": [
								"%typescript.updateImportsOnFileMove.enabled.prompt%",
								"%typescript.updateImportsOnFileMove.enabled.always%",
								"%typescript.updateImportsOnFileMove.enabled.never%"
							],
							"default": "prompt",
							"description": "%typescript.updateImportsOnFileMove.enabled%",
							"scope": "resource"
						},
						"javascript.updateImportsOnFileMove.enabled": {
							"type": "string",
							"enum": [
								"prompt",
								"always",
								"never"
							],
							"markdownEnumDescriptions": [
								"%typescript.updateImportsOnFileMove.enabled.prompt%",
								"%typescript.updateImportsOnFileMove.enabled.always%",
								"%typescript.updateImportsOnFileMove.enabled.never%"
							],
							"default": "prompt",
							"description": "%typescript.updateImportsOnFileMove.enabled%",
							"scope": "resource"
						},
						"typescript.autoClosingTags": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.autoClosingTags%"
						},
						"javascript.autoClosingTags": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.autoClosingTags%"
						},
						"javascript.suggest.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.suggest.enabled%",
							"scope": "resource"
						},
						"typescript.suggest.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%typescript.suggest.enabled%",
							"scope": "resource"
						},
						"typescript.surveys.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.surveys.enabled%",
							"scope": "window"
						},
						"typescript.tsserver.useSeparateSyntaxServer": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.tsserver.useSeparateSyntaxServer%",
							"markdownDeprecationMessage": "%configuration.tsserver.useSeparateSyntaxServer.deprecation%",
							"scope": "window"
						},
						"typescript.tsserver.useSyntaxServer": {
							"type": "string",
							"scope": "window",
							"description": "%configuration.tsserver.useSyntaxServer%",
							"default": "auto",
							"enum": [
								"always",
								"never",
								"auto"
							],
							"enumDescriptions": [
								"%configuration.tsserver.useSyntaxServer.always%",
								"%configuration.tsserver.useSyntaxServer.never%",
								"%configuration.tsserver.useSyntaxServer.auto%"
							]
						},
						"typescript.tsserver.maxTsServerMemory": {
							"type": "number",
							"default": 3072,
							"description": "%configuration.tsserver.maxTsServerMemory%",
							"scope": "window"
						},
						"typescript.tsserver.experimental.enableProjectDiagnostics": {
							"type": "boolean",
							"default": false,
							"description": "%configuration.tsserver.experimental.enableProjectDiagnostics%",
							"scope": "window"
						},
						"typescript.tsserver.watchOptions": {
							"type": "object",
							"description": "%configuration.tsserver.watchOptions%",
							"scope": "window",
							"properties": {
								"watchFile": {
									"type": "string",
									"description": "%configuration.tsserver.watchOptions.watchFile%",
									"enum": [
										"fixedChunkSizePolling",
										"fixedPollingInterval",
										"priorityPollingInterval",
										"dynamicPriorityPolling",
										"useFsEvents",
										"useFsEventsOnParentDirectory"
									],
									"enumDescriptions": [
										"%configuration.tsserver.watchOptions.watchFile.fixedChunkSizePolling%",
										"%configuration.tsserver.watchOptions.watchFile.fixedPollingInterval%",
										"%configuration.tsserver.watchOptions.watchFile.priorityPollingInterval%",
										"%configuration.tsserver.watchOptions.watchFile.dynamicPriorityPolling%",
										"%configuration.tsserver.watchOptions.watchFile.useFsEvents%",
										"%configuration.tsserver.watchOptions.watchFile.useFsEventsOnParentDirectory%"
									],
									"default": "useFsEvents"
								},
								"watchDirectory": {
									"type": "string",
									"description": "%configuration.tsserver.watchOptions.watchDirectory%",
									"enum": [
										"fixedChunkSizePolling",
										"fixedPollingInterval",
										"dynamicPriorityPolling",
										"useFsEvents"
									],
									"enumDescriptions": [
										"%configuration.tsserver.watchOptions.watchDirectory.fixedChunkSizePolling%",
										"%configuration.tsserver.watchOptions.watchDirectory.fixedPollingInterval%",
										"%configuration.tsserver.watchOptions.watchDirectory.dynamicPriorityPolling%",
										"%configuration.tsserver.watchOptions.watchDirectory.useFsEvents%"
									],
									"default": "useFsEvents"
								},
								"fallbackPolling": {
									"type": "string",
									"description": "%configuration.tsserver.watchOptions.fallbackPolling%",
									"enum": [
										"fixedPollingInterval",
										"priorityPollingInterval",
										"dynamicPriorityPolling"
									],
									"enumDescriptions": [
										"configuration.tsserver.watchOptions.fallbackPolling.fixedPollingInterval",
										"configuration.tsserver.watchOptions.fallbackPolling.priorityPollingInterval",
										"configuration.tsserver.watchOptions.fallbackPolling.dynamicPriorityPolling"
									]
								},
								"synchronousWatchDirectory": {
									"type": "boolean",
									"description": "%configuration.tsserver.watchOptions.synchronousWatchDirectory%"
								}
							}
						},
						"typescript.workspaceSymbols.scope": {
							"type": "string",
							"enum": [
								"allOpenProjects",
								"currentProject"
							],
							"enumDescriptions": [
								"%typescript.workspaceSymbols.scope.allOpenProjects%",
								"%typescript.workspaceSymbols.scope.currentProject%"
							],
							"default": "allOpenProjects",
							"markdownDescription": "%typescript.workspaceSymbols.scope%",
							"scope": "window"
						},
						"javascript.suggest.classMemberSnippets.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.classMemberSnippets.enabled%",
							"scope": "resource"
						},
						"typescript.suggest.classMemberSnippets.enabled": {
							"type": "boolean",
							"default": true,
							"description": "%configuration.suggest.classMemberSnippets.enabled%",
							"scope": "resource"
						}
					}
				},
				"commands": [
					{
						"command": "typescript.reloadProjects",
						"title": "%reloadProjects.title%",
						"category": "TypeScript"
					},
					{
						"command": "javascript.reloadProjects",
						"title": "%reloadProjects.title%",
						"category": "JavaScript"
					},
					{
						"command": "typescript.selectTypeScriptVersion",
						"title": "%typescript.selectTypeScriptVersion.title%",
						"category": "TypeScript"
					},
					{
						"command": "typescript.goToProjectConfig",
						"title": "%goToProjectConfig.title%",
						"category": "TypeScript"
					},
					{
						"command": "javascript.goToProjectConfig",
						"title": "%goToProjectConfig.title%",
						"category": "JavaScript"
					},
					{
						"command": "typescript.openTsServerLog",
						"title": "%typescript.openTsServerLog.title%",
						"category": "TypeScript"
					},
					{
						"command": "typescript.restartTsServer",
						"title": "%typescript.restartTsServer%",
						"category": "TypeScript"
					},
					{
						"command": "typescript.findAllFileReferences",
						"title": "%typescript.findAllFileReferences%",
						"category": "TypeScript"
					}
				],
				"menus": {
					"commandPalette": [
						{
							"command": "typescript.reloadProjects",
							"when": "editorLangId == typescript && typescript.isManagedFile"
						},
						{
							"command": "typescript.reloadProjects",
							"when": "editorLangId == typescriptreact && typescript.isManagedFile"
						},
						{
							"command": "javascript.reloadProjects",
							"when": "editorLangId == javascript && typescript.isManagedFile"
						},
						{
							"command": "javascript.reloadProjects",
							"when": "editorLangId == javascriptreact && typescript.isManagedFile"
						},
						{
							"command": "typescript.goToProjectConfig",
							"when": "editorLangId == typescript && typescript.isManagedFile"
						},
						{
							"command": "typescript.goToProjectConfig",
							"when": "editorLangId == typescriptreact"
						},
						{
							"command": "javascript.goToProjectConfig",
							"when": "editorLangId == javascript && typescript.isManagedFile"
						},
						{
							"command": "javascript.goToProjectConfig",
							"when": "editorLangId == javascriptreact && typescript.isManagedFile"
						},
						{
							"command": "typescript.selectTypeScriptVersion",
							"when": "typescript.isManagedFile"
						},
						{
							"command": "typescript.openTsServerLog",
							"when": "typescript.isManagedFile"
						},
						{
							"command": "typescript.restartTsServer",
							"when": "typescript.isManagedFile"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && typescript.isManagedFile"
						}
					],
					"explorer/context": [
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == typescript",
							"group": "4_search"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == typescriptreact",
							"group": "4_search"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == javascript",
							"group": "4_search"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == javascriptreact",
							"group": "4_search"
						}
					],
					"editor/title/context": [
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == javascript"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == javascriptreact"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == typescript"
						},
						{
							"command": "typescript.findAllFileReferences",
							"when": "tsSupportsFileReferences && resourceLangId == typescriptreact"
						}
					]
				},
				"breakpoints": [
					{
						"language": "typescript"
					},
					{
						"language": "typescriptreact"
					}
				],
				"taskDefinitions": [
					{
						"type": "typescript",
						"required": [
							"tsconfig"
						],
						"properties": {
							"tsconfig": {
								"type": "string",
								"description": "%taskDefinition.tsconfig.description%"
							},
							"option": {
								"type": "string"
							}
						},
						"when": "shellExecutionSupported"
					}
				],
				"problemPatterns": [
					{
						"name": "tsc",
						"regexp": "^([^\\s].*)[\\(:](\\d+)[,:](\\d+)(?:\\):\\s+|\\s+-\\s+)(error|warning|info)\\s+TS(\\d+)\\s*:\\s*(.*)$",
						"file": 1,
						"line": 2,
						"column": 3,
						"severity": 4,
						"code": 5,
						"message": 6
					}
				],
				"problemMatchers": [
					{
						"name": "tsc",
						"label": "%typescript.problemMatchers.tsc.label%",
						"owner": "typescript",
						"source": "ts",
						"applyTo": "closedDocuments",
						"fileLocation": [
							"relative",
							"${cwd}"
						],
						"pattern": "$tsc"
					},
					{
						"name": "tsc-watch",
						"label": "%typescript.problemMatchers.tscWatch.label%",
						"owner": "typescript",
						"source": "ts",
						"applyTo": "closedDocuments",
						"fileLocation": [
							"relative",
							"${cwd}"
						],
						"pattern": "$tsc",
						"background": {
							"activeOnStart": true,
							"beginsPattern": {
								"regexp": "^\\s*(?:message TS6032:|\\[?\\D*.{1,2}[:.].{1,2}[:.].{1,2}\\D*(├\\D*\\d{1,2}\\D+┤)?(?:\\]| -)) File change detected\\. Starting incremental compilation\\.\\.\\."
							},
							"endsPattern": {
								"regexp": "^\\s*(?:message TS6042:|\\[?\\D*.{1,2}[:.].{1,2}[:.].{1,2}\\D*(├\\D*\\d{1,2}\\D+┤)?(?:\\]| -)) (?:Compilation complete\\.|Found \\d+ errors?\\.) Watching for file changes\\."
							}
						}
					}
				],
				"codeActions": [
					{
						"languages": [
							"javascript",
							"javascriptreact",
							"typescript",
							"typescriptreact"
						],
						"actions": [
							{
								"kind": "refactor.extract.constant",
								"title": "%codeActions.refactor.extract.constant.title%",
								"description": "%codeActions.refactor.extract.constant.description%"
							},
							{
								"kind": "refactor.extract.function",
								"title": "%codeActions.refactor.extract.function.title%",
								"description": "%codeActions.refactor.extract.function.description%"
							},
							{
								"kind": "refactor.extract.interface",
								"title": "%codeActions.refactor.extract.interface.title%",
								"description": "%codeActions.refactor.extract.interface.description%"
							},
							{
								"kind": "refactor.extract.type",
								"title": "%codeActions.refactor.extract.type.title%",
								"description": "%codeActions.refactor.extract.type.description%"
							},
							{
								"kind": "refactor.rewrite.import",
								"title": "%codeActions.refactor.rewrite.import.title%",
								"description": "%codeActions.refactor.rewrite.import.description%"
							},
							{
								"kind": "refactor.rewrite.export",
								"title": "%codeActions.refactor.rewrite.export.title%",
								"description": "%codeActions.refactor.rewrite.export.description%"
							},
							{
								"kind": "refactor.rewrite.arrow.braces",
								"title": "%codeActions.refactor.rewrite.arrow.braces.title%",
								"description": "%codeActions.refactor.rewrite.arrow.braces.description%"
							},
							{
								"kind": "refactor.rewrite.parameters.toDestructured",
								"title": "%codeActions.refactor.rewrite.parameters.toDestructured.title%"
							},
							{
								"kind": "refactor.rewrite.property.generateAccessors",
								"title": "%codeActions.refactor.rewrite.property.generateAccessors.title%",
								"description": "%codeActions.refactor.rewrite.property.generateAccessors.description%"
							},
							{
								"kind": "refactor.move.newFile",
								"title": "%codeActions.refactor.move.newFile.title%",
								"description": "%codeActions.refactor.move.newFile.description%"
							},
							{
								"kind": "source.organizeImports",
								"title": "%codeActions.source.organizeImports.title%"
							}
						]
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "TypeScript and JavaScript Language Features",
			"description": "Provides rich language support for JavaScript and TypeScript.",
			"workspaceTrust": "The extension requires workspace trust when the workspace version is used because it executes code specified by the workspace.",
			"virtualWorkspaces": "In virtual workspaces, resolving and finding references across files is not supported.",
			"reloadProjects.title": "Reload Project",
			"configuration.typescript": "TypeScript",
			"configuration.suggest.completeFunctionCalls": "Complete functions with their parameter signature.",
			"configuration.suggest.includeAutomaticOptionalChainCompletions": "Enable/disable showing completions on potentially undefined values that insert an optional chain call. Requires TS 3.7+ and strict null checks to be enabled.",
			"configuration.suggest.includeCompletionsForImportStatements": "Enable/disable auto-import-style completions on partially-typed import statements. Requires using TypeScript 4.3+ in the workspace.",
			"configuration.suggest.includeCompletionsWithSnippetText": "Enable/disable snippet completions from TS Server. Requires using TypeScript 4.3+ in the workspace.",
			"typescript.tsdk.desc": "Specifies the folder path to the tsserver and `lib*.d.ts` files under a TypeScript install to use for IntelliSense, for example: `./node_modules/typescript/lib`.\n\n- When specified as a user setting, the TypeScript version from `typescript.tsdk` automatically replaces the built-in TypeScript version.\n- When specified as a workspace setting, `typescript.tsdk` allows you to switch to use that workspace version of TypeScript for IntelliSense with the `TypeScript: Select TypeScript version` command.\n\nSee the [TypeScript documentation](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions) for more detail about managing TypeScript versions.",
			"typescript.disableAutomaticTypeAcquisition": "Disables [automatic type acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition). Automatic type acquisition fetches `@types` packages from npm to improve IntelliSense for external libraries.",
			"typescript.enablePromptUseWorkspaceTsdk": "Enables prompting of users to use the TypeScript version configured in the workspace for Intellisense.",
			"typescript.tsserver.enableTracing": "Enables tracing TS server performance to a directory. These trace files can be used to diagnose TS Server performance issues. The log may contain file paths, source code, and other potentially sensitive information from your project.",
			"typescript.tsserver.log": "Enables logging of the TS server to a file. This log can be used to diagnose TS Server issues. The log may contain file paths, source code, and other potentially sensitive information from your project.",
			"typescript.tsserver.pluginPaths": "Additional paths to discover TypeScript Language Service plugins.",
			"typescript.tsserver.pluginPaths.item": "Either an absolute or relative path. Relative path will be resolved against workspace folder(s).",
			"typescript.tsserver.trace": "Enables tracing of messages sent to the TS server. This trace can be used to diagnose TS Server issues. The trace may contain file paths, source code, and other potentially sensitive information from your project.",
			"typescript.validate.enable": "Enable/disable TypeScript validation.",
			"typescript.format.enable": "Enable/disable default TypeScript formatter.",
			"javascript.format.enable": "Enable/disable default JavaScript formatter.",
			"format.insertSpaceAfterCommaDelimiter": "Defines space handling after a comma delimiter.",
			"format.insertSpaceAfterConstructor": "Defines space handling after the constructor keyword.",
			"format.insertSpaceAfterSemicolonInForStatements": "Defines space handling after a semicolon in a for statement.",
			"format.insertSpaceBeforeAndAfterBinaryOperators": "Defines space handling after a binary operator.",
			"format.insertSpaceAfterKeywordsInControlFlowStatements": "Defines space handling after keywords in a control flow statement.",
			"format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": "Defines space handling after function keyword for anonymous functions.",
			"format.insertSpaceBeforeFunctionParenthesis": "Defines space handling before function argument parentheses.",
			"format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": "Defines space handling after opening and before closing non-empty parenthesis.",
			"format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": "Defines space handling after opening and before closing non-empty brackets.",
			"format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": "Defines space handling after opening and before closing non-empty braces.",
			"format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces": "Defines space handling after opening and before closing empty braces.",
			"format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": "Defines space handling after opening and before closing template string braces.",
			"format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": "Defines space handling after opening and before closing JSX expression braces.",
			"format.insertSpaceAfterTypeAssertion": "Defines space handling after type assertions in TypeScript.",
			"format.placeOpenBraceOnNewLineForFunctions": "Defines whether an open brace is put onto a new line for functions or not.",
			"format.placeOpenBraceOnNewLineForControlBlocks": "Defines whether an open brace is put onto a new line for control blocks or not.",
			"format.semicolons": "Defines handling of optional semicolons. Requires using TypeScript 3.7 or newer in the workspace.",
			"format.semicolons.ignore": "Don't insert or remove any semicolons.",
			"format.semicolons.insert": "Insert semicolons at statement ends.",
			"format.semicolons.remove": "Remove unnecessary semicolons.",
			"javascript.validate.enable": "Enable/disable JavaScript validation.",
			"goToProjectConfig.title": "Go to Project Configuration",
			"javascript.referencesCodeLens.enabled": "Enable/disable references CodeLens in JavaScript files.",
			"javascript.referencesCodeLens.showOnAllFunctions": "Enable/disable references CodeLens on all functions in JavaScript files.",
			"typescript.referencesCodeLens.enabled": "Enable/disable references CodeLens in TypeScript files.",
			"typescript.referencesCodeLens.showOnAllFunctions": "Enable/disable references CodeLens on all functions in TypeScript files.",
			"typescript.implementationsCodeLens.enabled": "Enable/disable implementations CodeLens. This CodeLens shows the implementers of an interface.",
			"typescript.openTsServerLog.title": "Open TS Server log",
			"typescript.restartTsServer": "Restart TS server",
			"typescript.selectTypeScriptVersion.title": "Select TypeScript Version...",
			"typescript.reportStyleChecksAsWarnings": "Report style checks as warnings.",
			"typescript.npm": "Specifies the path to the npm executable used for [Automatic Type Acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition).",
			"typescript.check.npmIsInstalled": "Check if npm is installed for [Automatic Type Acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition).",
			"configuration.suggest.names": "Enable/disable including unique names from the file in JavaScript suggestions. Note that name suggestions are always disabled in JavaScript code that is semantically checked using `@ts-check` or `checkJs`.",
			"typescript.tsc.autoDetect": "Controls auto detection of tsc tasks.",
			"typescript.tsc.autoDetect.off": "Disable this feature.",
			"typescript.tsc.autoDetect.on": "Create both build and watch tasks.",
			"typescript.tsc.autoDetect.build": "Only create single run compile tasks.",
			"typescript.tsc.autoDetect.watch": "Only create compile and watch tasks.",
			"typescript.problemMatchers.tsc.label": "TypeScript problems",
			"typescript.problemMatchers.tscWatch.label": "TypeScript problems (watch mode)",
			"configuration.suggest.paths": "Enable/disable suggestions for paths in import statements and require calls.",
			"configuration.tsserver.useSeparateSyntaxServer": "Enable/disable spawning a separate TypeScript server that can more quickly respond to syntax related operations, such as calculating folding or computing document symbols. Requires using TypeScript 3.4.0 or newer in the workspace.",
			"configuration.tsserver.useSeparateSyntaxServer.deprecation": "This setting has been deprecated in favor of `typescript.tsserver.useSyntaxServer`.",
			"configuration.tsserver.useSyntaxServer": "Controls if TypeScript launches a dedicated server to more quickly handle syntax related operations, such as computing code folding.",
			"configuration.tsserver.useSyntaxServer.always": "Use a lighter weight syntax server to handle all IntelliSense operations. This syntax server can only provide IntelliSense for opened files.",
			"configuration.tsserver.useSyntaxServer.never": "Don't use a dedicated syntax server. Use a single server to handle all IntelliSense operations.",
			"configuration.tsserver.useSyntaxServer.auto": "Spawn both a full server and a lighter weight server dedicated to syntax operations. The syntax server is used to speed up syntax operations and provide IntelliSense while projects are loading.",
			"configuration.tsserver.maxTsServerMemory": "The maximum amount of memory (in MB) to allocate to the TypeScript server process.",
			"configuration.tsserver.experimental.enableProjectDiagnostics": "(Experimental) Enables project wide error reporting.",
			"typescript.locale": "Sets the locale used to report JavaScript and TypeScript errors. Defaults to use VS Code's locale.",
			"configuration.implicitProjectConfig.checkJs": "Enable/disable semantic checking of JavaScript files. Existing `jsconfig.json` or `tsconfig.json` files override this setting.",
			"configuration.javascript.checkJs.checkJs.deprecation": "This setting has been deprecated in favor of `js/ts.implicitProjectConfig.checkJs`.",
			"configuration.implicitProjectConfig.experimentalDecorators": "Enable/disable `experimentalDecorators` in JavaScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.",
			"configuration.javascript.checkJs.experimentalDecorators.deprecation": "This setting has been deprecated in favor of `js/ts.implicitProjectConfig.experimentalDecorators`.",
			"configuration.implicitProjectConfig.strictNullChecks": "Enable/disable [strict null checks](https://www.typescriptlang.org/tsconfig#strictNullChecks) in JavaScript and TypeScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.",
			"configuration.implicitProjectConfig.strictFunctionTypes": "Enable/disable [strict function types](https://www.typescriptlang.org/tsconfig#strictFunctionTypes) in JavaScript and TypeScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.",
			"configuration.suggest.jsdoc.generateReturns": "Enable/disable generating `@return` annotations for JSDoc templates. Requires using TypeScript 4.2+ in the workspace.",
			"configuration.suggest.autoImports": "Enable/disable auto import suggestions.",
			"inlayHints.parameterNames.none": "Disable parameter name hints.",
			"inlayHints.parameterNames.literals": "Enable parameter name hints only for literal arguments.",
			"inlayHints.parameterNames.all": "Enable parameter name hints for literal and non-literal arguments.",
			"configuration.inlayHints.parameterNames.enabled": {
				"message": "Enable/disable inlay hints for parameter names:\n```typescript\n\nparseInt(/* str: */ '123', /* radix: */ 8)\n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.parameterNames.suppressWhenArgumentMatchesName": {
				"message": "Suppress parameter name hints on arguments whose text is identical to the parameter name.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.parameterTypes.enabled": {
				"message": "Enable/disable inlay hints for implicit parameter types:\n```typescript\n\nel.addEventListener('click', e /* :MouseEvent */ => ...)\n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.variableTypes.enabled": {
				"message": "Enable/disable inlay hints for implicit variable types:\n```typescript\n\nconst foo /* :number */ = Date.now();\n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.propertyDeclarationTypes.enabled": {
				"message": "Enable/disable inlay hints for implicit types on property declarations:\n```typescript\n\nclass Foo {\n\tprop /* :number */ = Date.now();\n}\n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.functionLikeReturnTypes.enabled": {
				"message": "Enable/disable inlay hints for implicit return types on function signatures:\n```typescript\n\nfunction foo() /* :number */ {\n\treturn Date.now();\n} \n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"configuration.inlayHints.enumMemberValues.enabled": {
				"message": "Enable/disable inlay hints for member values in enum declarations:\n```typescript\n\nenum MyValue {\n\tA /* = 0 */;\n\tB /* = 1 */;\n}\n \n```\nRequires using TypeScript 4.4+ in the workspace.",
				"comment": "The text inside the ``` block is code and should not be localized."
			},
			"taskDefinition.tsconfig.description": "The tsconfig file that defines the TS build.",
			"javascript.suggestionActions.enabled": "Enable/disable suggestion diagnostics for JavaScript files in the editor.",
			"typescript.suggestionActions.enabled": "Enable/disable suggestion diagnostics for TypeScript files in the editor.",
			"typescript.preferences.quoteStyle": "Preferred quote style to use for quick fixes: `single` quotes, `double` quotes, or `auto` infer quote type from existing imports.",
			"typescript.preferences.importModuleSpecifier": "Preferred path style for auto imports.",
			"typescript.preferences.importModuleSpecifier.shortest": "Prefers a non-relative import only if one is available that has fewer path segments than a relative import.",
			"typescript.preferences.importModuleSpecifier.relative": "Prefers a relative path to the imported file location.",
			"typescript.preferences.importModuleSpecifier.nonRelative": "Prefers a non-relative import based on the `baseUrl` or `paths` configured in your `jsconfig.json` / `tsconfig.json`.",
			"typescript.preferences.importModuleSpecifier.projectRelative": "Prefers a non-relative import only if the relative import path would leave the package or project directory. Requires using TypeScript 4.2+ in the workspace.",
			"typescript.preferences.importModuleSpecifierEnding": "Preferred path ending for auto imports. Requires using TypeScript 4.5+ in the workspace.",
			"typescript.preferences.importModuleSpecifierEnding.auto": "Use project settings to select a default.",
			"typescript.preferences.importModuleSpecifierEnding.minimal": "Shorten `./component/index.js` to `./component`.",
			"typescript.preferences.importModuleSpecifierEnding.index": "Shorten `./component/index.js` to `./component/index`.",
			"typescript.preferences.importModuleSpecifierEnding.js": "Do not shorten path endings; include the `.js` extension.",
			"typescript.preferences.jsxAttributeCompletionStyle": "Preferred style for JSX attribute completions.",
			"typescript.preferences.jsxAttributeCompletionStyle.auto": "Insert `={}` or `=\"\"` after attribute names based on the prop type.",
			"typescript.preferences.jsxAttributeCompletionStyle.braces": "Insert `={}` after attribute names.",
			"typescript.preferences.jsxAttributeCompletionStyle.none": "Only insert attribute names.",
			"typescript.preferences.includePackageJsonAutoImports": "Enable/disable searching `package.json` dependencies for available auto imports.",
			"typescript.preferences.includePackageJsonAutoImports.auto": "Search dependencies based on estimated performance impact.",
			"typescript.preferences.includePackageJsonAutoImports.on": "Always search dependencies.",
			"typescript.preferences.includePackageJsonAutoImports.off": "Never search dependencies.",
			"typescript.updateImportsOnFileMove.enabled": "Enable/disable automatic updating of import paths when you rename or move a file in VS Code.",
			"typescript.updateImportsOnFileMove.enabled.prompt": "Prompt on each rename.",
			"typescript.updateImportsOnFileMove.enabled.always": "Always update paths automatically.",
			"typescript.updateImportsOnFileMove.enabled.never": "Never rename paths and don't prompt.",
			"typescript.autoClosingTags": "Enable/disable automatic closing of JSX tags.",
			"typescript.suggest.enabled": "Enabled/disable autocomplete suggestions.",
			"configuration.surveys.enabled": "Enabled/disable occasional surveys that help us improve VS Code's JavaScript and TypeScript support.",
			"configuration.suggest.completeJSDocs": "Enable/disable suggestion to complete JSDoc comments.",
			"configuration.tsserver.watchOptions": "Configure which watching strategies should be used to keep track of files and directories. Requires using TypeScript 3.8+ in the workspace.",
			"configuration.tsserver.watchOptions.watchFile": "Strategy for how individual files are watched.",
			"configuration.tsserver.watchOptions.watchFile.fixedChunkSizePolling": "Polls files in chunks at regular interval. Requires using TypeScript 4.3+ in the workspace.",
			"configuration.tsserver.watchOptions.watchFile.fixedPollingInterval": "Check every file for changes several times a second at a fixed interval.",
			"configuration.tsserver.watchOptions.watchFile.priorityPollingInterval": "Check every file for changes several times a second, but use heuristics to check certain types of files less frequently than others.",
			"configuration.tsserver.watchOptions.watchFile.dynamicPriorityPolling": "Use a dynamic queue where less-frequently modified files will be checked less often.",
			"configuration.tsserver.watchOptions.watchFile.useFsEvents": "Attempt to use the operating system/file system's native events for file changes.",
			"configuration.tsserver.watchOptions.watchFile.useFsEventsOnParentDirectory": "Attempt to use the operating system/file system's native events to listen for changes on a file's containing directories. This can use fewer file watchers, but might be less accurate.",
			"configuration.tsserver.watchOptions.watchDirectory": "Strategy for how entire directory trees are watched under systems that lack recursive file-watching functionality.",
			"configuration.tsserver.watchOptions.watchDirectory.fixedChunkSizePolling": "Polls directories in chunks at regular interval. Requires using TypeScript 4.3+ in the workspace.",
			"configuration.tsserver.watchOptions.watchDirectory.fixedPollingInterval": "Check every directory for changes several times a second at a fixed interval.",
			"configuration.tsserver.watchOptions.watchDirectory.dynamicPriorityPolling": "Use a dynamic queue where less-frequently modified directories will be checked less often.",
			"configuration.tsserver.watchOptions.watchDirectory.useFsEvents": "Attempt to use the operating system/file system's native events for directory changes.",
			"configuration.tsserver.watchOptions.fallbackPolling": "When using file system events, this option specifies the polling strategy that gets used when the system runs out of native file watchers and/or doesn't support native file watchers.",
			"configuration.tsserver.watchOptions.fallbackPolling.fixedPollingInterval": "Check every file for changes several times a second at a fixed interval.",
			"configuration.tsserver.watchOptions.fallbackPolling.priorityPollingInterval": "Check every file for changes several times a second, but use heuristics to check certain types of files less frequently than others.",
			"configuration.tsserver.watchOptions.fallbackPolling.dynamicPriorityPolling ": "Use a dynamic queue where less-frequently modified files will be checked less often.",
			"configuration.tsserver.watchOptions.synchronousWatchDirectory": "Disable deferred watching on directories. Deferred watching is useful when lots of file changes might occur at once (e.g. a change in node_modules from running npm install), but you might want to disable it with this flag for some less-common setups.",
			"typescript.preferences.renameShorthandProperties.deprecationMessage": "The setting 'typescript.preferences.renameShorthandProperties' has been deprecated in favor of 'typescript.preferences.useAliasesForRenames'",
			"typescript.preferences.useAliasesForRenames": "Enable/disable introducing aliases for object shorthand properties during renames. Requires using TypeScript 3.4 or newer in the workspace.",
			"typescript.workspaceSymbols.scope": "Controls which files are searched by [go to symbol in workspace](https://code.visualstudio.com/docs/editor/editingevolved#_open-symbol-by-name).",
			"typescript.workspaceSymbols.scope.allOpenProjects": "Search all open JavaScript or TypeScript projects for symbols. Requires using TypeScript 3.9 or newer in the workspace.",
			"typescript.workspaceSymbols.scope.currentProject": "Only search for symbols in the current JavaScript or TypeScript project.",
			"codeActions.refactor.extract.constant.title": "Extract constant",
			"codeActions.refactor.extract.constant.description": "Extract expression to constant.",
			"codeActions.refactor.extract.function.title": "Extract function",
			"codeActions.refactor.extract.function.description": "Extract expression to method or function.",
			"codeActions.refactor.extract.type.title": "Extract type",
			"codeActions.refactor.extract.type.description": "Extract type to a type alias.",
			"codeActions.refactor.extract.interface.title": "Extract interface",
			"codeActions.refactor.extract.interface.description": "Extract type to an interface.",
			"codeActions.refactor.rewrite.import.title": "Convert import",
			"codeActions.refactor.rewrite.import.description": "Convert between named imports and namespace imports.",
			"codeActions.refactor.rewrite.export.title": "Convert export",
			"codeActions.refactor.rewrite.export.description": "Convert between default export and named export.",
			"codeActions.refactor.move.newFile.title": "Move to a new file",
			"codeActions.refactor.move.newFile.description": "Move the expression to a new file.",
			"codeActions.refactor.rewrite.arrow.braces.title": "Rewrite arrow braces",
			"codeActions.refactor.rewrite.arrow.braces.description": "Add or remove braces in an arrow function.",
			"codeActions.refactor.rewrite.parameters.toDestructured.title": "Convert parameters to destructured object",
			"codeActions.refactor.rewrite.property.generateAccessors.title": "Generate accessors",
			"codeActions.refactor.rewrite.property.generateAccessors.description": "Generate 'get' and 'set' accessors",
			"codeActions.source.organizeImports.title": "Organize imports",
			"typescript.findAllFileReferences": "Find File References",
			"configuration.suggest.classMemberSnippets.enabled": "Enable/disable snippet completions for class members. Requires using TypeScript 4.5+ in the workspace"
		},
		"readmePath": "typescript-language-features/README.md"
	},
	{
		"extensionPath": "vb",
		"packageJSON": {
			"name": "vb",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin textmate/asp.vb.net.tmbundle Syntaxes/ASP%20VB.net.plist ./syntaxes/asp-vb-net.tmlanguage.json"
			},
			"contributes": {
				"languages": [
					{
						"id": "vb",
						"extensions": [
							".vb",
							".brs",
							".vbs",
							".bas",
							".vba"
						],
						"aliases": [
							"Visual Basic",
							"vb"
						],
						"configuration": "./language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "vb",
						"scopeName": "source.asp.vb.net",
						"path": "./syntaxes/asp-vb-net.tmlanguage.json"
					}
				],
				"snippets": [
					{
						"language": "vb",
						"path": "./snippets/vb.code-snippets"
					}
				]
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "Visual Basic Language Basics",
			"description": "Provides snippets, syntax highlighting, bracket matching and folding in Visual Basic files."
		}
	},
	{
		"extensionPath": "xml",
		"packageJSON": {
			"name": "xml",
			"displayName": "%displayName%",
			"description": "%description%",
			"version": "1.0.0",
			"publisher": "vscode",
			"license": "MIT",
			"engines": {
				"vscode": "*"
			},
			"contributes": {
				"languages": [
					{
						"id": "xml",
						"extensions": [
							".xml",
							".xsd",
							".ascx",
							".atom",
							".axml",
							".axaml",
							".bpmn",
							".cpt",
							".csl",
							".csproj",
							".csproj.user",
							".dita",
							".ditamap",
							".dtd",
							".ent",
							".mod",
							".dtml",
							".fsproj",
							".fxml",
							".iml",
							".isml",
							".jmx",
							".launch",
							".menu",
							".mxml",
							".nuspec",
							".opml",
							".owl",
							".proj",
							".props",
							".pt",
							".publishsettings",
							".pubxml",
							".pubxml.user",
							".rbxlx",
							".rbxmx",
							".rdf",
							".rng",
							".rss",
							".shproj",
							".storyboard",
							".svg",
							".targets",
							".tld",
							".tmx",
							".vbproj",
							".vbproj.user",
							".vcxproj",
							".vcxproj.filters",
							".wsdl",
							".wxi",
							".wxl",
							".wxs",
							".xaml",
							".xbl",
							".xib",
							".xlf",
							".xliff",
							".xpdl",
							".xul",
							".xoml"
						],
						"firstLine": "(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)",
						"aliases": [
							"XML",
							"xml"
						],
						"configuration": "./xml.language-configuration.json"
					},
					{
						"id": "xsl",
						"extensions": [
							".xsl",
							".xslt"
						],
						"aliases": [
							"XSL",
							"xsl"
						],
						"configuration": "./xsl.language-configuration.json"
					}
				],
				"grammars": [
					{
						"language": "xml",
						"scopeName": "text.xml",
						"path": "./syntaxes/xml.tmLanguage.json"
					},
					{
						"language": "xsl",
						"scopeName": "text.xml.xsl",
						"path": "./syntaxes/xsl.tmLanguage.json"
					}
				]
			},
			"scripts": {
				"update-grammar": "node ../node_modules/vscode-grammar-updater/bin atom/language-xml grammars/xml.cson ./syntaxes/xml.tmLanguage.json grammars/xsl.cson ./syntaxes/xsl.tmLanguage.json"
			},
			"repository": {
				"type": "git",
				"url": "https://github.com/microsoft/vscode.git"
			}
		},
		"packageNLS": {
			"displayName": "XML Language Basics",
			"description": "Provides syntax highlighting and bracket matching in XML files."
		}
	},

]
