dsl('companion')
using('llm-api','vscode','html','tgp-text-editor')

component('companion.app', {
  type: 'page<html>',
  impl: page({
    section: group({
      id: 'app',
      html: () => `
        <div id="app-container">
          <div id="chat-box">
            <div id="chat-section">
              <textarea class="userPrompt" twoWayBind="%$appData.userPrompt%" onEnter="companion.runLlm" placeholder="Ask Anything..."></textarea>
              <button class="run-llm" onClick="companion.runLlm">Send</button>
            </div>
            <div id="toolbar">
              <button class="apply-btn" onClick="cmp.applyChanges()">Apply</button>
              <div class="tab-group">
                <div class="context-wrapper">
                  <button class="tab-btn" data-tab="context" onClick="cmp.toggleContextPopup()">📜 Context</button>
                  <div class="context-popup" style="display: none;">
                    <label><input type="checkbox" onchange="cmp.updateContext('file', this.checked)" checked>File Context</label>
                    <label><input type="checkbox" onchange="cmp.updateContext('test', this.checked)" checked>Test Context</label>
                    <label><input type="checkbox" onchange="cmp.updateContext('plugin', this.checked)" checked>Plugin Context</label>
                  </div>
                </div>
                <button class="tab-btn" data-tab="generatedPrompt" onClick="cmp.show('generatedPrompt')">🔧 AI Prompt</button>
                <button class="tab-btn" data-tab="originalComp" onClick="cmp.show('originalComp')">🔖 Original</button>
                <button class="tab-btn" data-tab="suggestedComp" onClick="cmp.show('suggestedComp')">🛠 Suggested</button>
                <button class="tab-btn" data-tab="diffAndReasoning" onClick="cmp.show('diffAndReasoning')">🧐 Reasoning</button>
              </div>
              <div class="toolbar-right">
                <select twoWayBind="%$appData.preferedLlmModel%" class="llm-model">
                  ${jb.exec({$: 'companion.llmModels'}).map(({id,name,priceStr}) => `<option value="${id}">${name} (${priceStr})</option>`).join('')}
                </select>
                <span class="api-cost" bind="%$appData.costSummary%"></span>
              </div>
            </div>
          </div>  
          <div id="editor-section">
            <div id="editor-container"></div>
          </div>
        </div>
      `,
      css: `
        body { background: var(--vscode-editor-background, #fff); color: var(--vscode-editor-foreground, #333); 
          font-family: var(--vscode-font-family, Arial), sans-serif; height: 100vh; margin: 0; display: flex; flex-direction: column; }

        #app-container { display: flex; flex-direction: column; height: 100vh; }

        #chat-box { display: flex; flex-direction: column; padding: 10px; background: var(--vscode-sideBar-background, #f3f3f3); 
          border-bottom: 1px solid var(--vscode-editor-border, #ddd); flex-shrink: 0; }

        #chat-section { display: flex; align-items: center; gap: 10px; }
        #chat-section textarea { flex-grow: 1; height: 50px; background: var(--vscode-input-background, #fff); 
          border: 1px solid var(--vscode-input-border, #ccc); border-radius: 8px; padding: 10px; 
          color: var(--vscode-input-foreground, #000); font-size: 14px; min-width: 300px; }
        #chat-section button { background: var(--vscode-button-background, #007acc); color: var(--vscode-button-foreground, #fff); 
          border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
        #chat-section button:hover { background: var(--vscode-button-hoverBackground, #0062a3); }

        #toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 0;
          background: var(--vscode-editorWidget-background, #f8f8f8); border-radius: 6px; margin-top: 8px; }

        .tab-group { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

        /* Apply Button (Matches Other Buttons) */
        .apply-btn { background: var(--vscode-button-background, #28a745); color: var(--vscode-button-foreground, #fff); 
          border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: background 0.2s ease, transform 0.1s; 
          font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px var(--vscode-widget-shadow, rgba(0,0,0,0.1)); }
        .apply-btn:hover { background: var(--vscode-button-hoverBackground, #218838); box-shadow: 0 4px 6px var(--vscode-widget-shadow, rgba(0,0,0,0.15)); 
          transform: translateY(-1px); }
        .apply-btn:active { transform: translateY(0); box-shadow: 0 1px 2px var(--vscode-widget-shadow, rgba(0,0,0,0.1)); }
        .apply-btn::before { content: '✓'; font-weight: bold; font-size: 1.1em; }

        /* Toolbar Buttons */
        .tab-btn { background: var(--vscode-button-background, #007acc); color: var(--vscode-button-foreground, #fff); 
          border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .tab-btn:hover { background: var(--vscode-button-hoverBackground, #0062a3); }
        .tab-btn.active { background: var(--vscode-button-activeBackground, #005a9e); color: var(--vscode-button-activeForeground, #fff); 
          font-weight: bold; }

        .toolbar-right { display: flex; align-items: center; gap: 8px; }

        /* Dropdown */
        .llm-model { background: var(--vscode-dropdown-background, #fff); color: var(--vscode-dropdown-foreground, #000); 
          border: 1px solid var(--vscode-dropdown-border, #007acc); border-radius: 6px; padding: 6px 20px 6px 10px; font-size: 14px; 
          appearance: none; transition: all 0.2s ease; min-width: 180px; }
        .llm-model:hover { border-color: var(--vscode-button-hoverBackground, #0062a3); 
          box-shadow: 0 2px 4px var(--vscode-widget-shadow, rgba(0,0,0,0.1)); }

        /* Cost Summary */
        .api-cost { background: var(--vscode-badge-background, #e8e8e8); color: var(--vscode-badge-foreground, #333); 
          padding: 6px 10px; border-radius: 4px; font-size: 0.9em; font-weight: 500; }

        #editor-section { flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; }
        #editor-container { flex-grow: 1; background: var(--vscode-editor-background, #f8f8f8); border-top: 1px solid var(--vscode-editor-border, #ccc); 
          border-radius: 4px; padding: 8px; font-family: var(--vscode-editor-font-family, 'Consolas'); 
          font-size: var(--vscode-editor-font-size, 14px); overflow-y: auto; }

        /* Context Popup */
        .context-wrapper { position: relative; }
        .context-popup { position: absolute; top: 100%; left: 0; z-index: 1000; 
          background: var(--vscode-dropdown-background, #ffffff);
          border: 1px solid var(--vscode-dropdown-border); border-radius: 6px; padding: 8px; margin-top: 4px;
          box-shadow: 0 2px 8px var(--vscode-widget-shadow, rgba(0, 0, 0, 0.2)); min-width: 150px; }
        .context-popup label { display: block; padding: 4px 0; color: var(--vscode-foreground);
          display: flex; align-items: center; gap: 6px; cursor: pointer; }
        .context-popup input[type="checkbox"] { margin: 0; cursor: pointer; }
      `
    }),
    cmp: companion.cmp()
  })
})


component('companion.cmp', {
    impl: () => ({
        editors: {},
        show(contentId) {
            const appData = this.ctx.vars.appData
            appData[contentId] = appData[contentId] || ''
            this.contentId = contentId
            this.base.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === contentId))

            const { editor, EditorView } = this
            if (editor) {
                editor.dispatch(editor.state.update({
                    changes: { from: 0, to: editor.state.doc.length, insert: appData[contentId] }
                }))
                const line = appData[contentId].split('\n').length
                editor.dispatch({ effects: EditorView.scrollIntoView(editor.state.doc.line(line).from, { y: "center" }) })
            }
        },
        toggleContextPopup() {
          this.show('context')
          const popup = this.base.querySelector('.context-popup')
          popup.style.display = popup.style.display === 'none' ? 'block' : 'none'
        },
        beforeInjection(ctx) {
            Object.assign(ctx.vars.appData,{
                preferedLlmModel: 'o1_mini', 
                suggestedComp: '', 
                generatedPrompt: '', 
                totalCost: '$0.00',
                contextSettings: { file: true, test: true, plugin: true }
            })
        },
        async init() {
            const { EditorView, lineNumbers, highlightActiveLine, keymap, gutter, standardKeymap } = await import("https://esm.sh/@codemirror/view@6")
            const { EditorState } = await import("https://esm.sh/@codemirror/state@6")
            const { syntaxHighlighting, defaultHighlightStyle } = await import("https://esm.sh/@codemirror/language@6")
            const { javascript } = await import("https://esm.sh/@codemirror/lang-javascript@6")
        
            this.EditorView = EditorView
            this.editor = new EditorView({ 
                parent: this.base.querySelector('#editor-container'),
                state: EditorState.create({ doc: '', extensions: [ // keymap.of(standardKeymap), 
                        syntaxHighlighting(defaultHighlightStyle), lineNumbers(), highlightActiveLine(), 
                        javascript(), gutter(), EditorView.lineWrapping,
                        EditorView.updateListener.of(update => update.docChanged
                            && (this.ctx.vars.appData[this.contentId] = update.state.doc.toString()))
                    ]
                })
            })
            this.show('originalComp')
        },
        llmIncResponse(ctx) {
            this.show(jb.companion.llmIncResponse(ctx.data, this))
        },
        refreshCost(ctx) {
            const {cost, totalCost} = ctx.data
            this.ctx.vars.appData.costSummary = `$${cost}/$${totalCost}`
            jb.html.populateHtml(this.base.querySelector('#toolbar'), ctx)
        },
        applyChanges() {
            const { originalComp, suggestedComp, compLine } = this.ctx.vars.appData
            const [hash, edits] = [ jb.utils.calcHash(originalComp), jb.tgpTextEditor.calcEdits(originalComp, suggestedComp, compLine) ]
            if (globalThis.myVscodeApi)
                myVscodeApi.postMessage({ type: 'submit', value: { hash, edits}})
        },
        updateContext(type, value) {
            this.ctx.vars.appData.contextSettings[type] = value
        }
    })
})

component('companion.llmModels', {
  impl: (ctx) => {
        const profileIds = Object.keys(jb.comps).filter(k=>k.indexOf('model<llm>') == 0 && !k.match(/model$|byId$/))
        const items = profileIds.map(k=>({...ctx.run({$$: k}), id: k.split('>').pop()}))
        const sorted = [...items].sort((x,y) => y._price-x._price)
        return sorted.map(item=>({
            ...item,
            priceStr: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item._price) + ' / 1M tokens',
        }))
    }
})

component('companion.runLlm', {
  type: 'action<>',
  impl: rx.pipe(
    source.data(companion.richPrompt()),
    rx.map(ctx=>ctx.exp(ctx.data)),
    rx.do(writeValue('%$cmp.llmAllText%','')),
    rx.do(writeValue('%$appData/generatedPrompt%', '%%')),
    rx.do(({},{cmp}) => cmp.show('generatedPrompt')),
    rx.flatMap(source.llmCompletions(user('%%'), {
      llmModel: byId('%$appData/preferedLlmModel%'),
      useRedisCache: true,
      notifyUsage: '%$cmp.refreshCost()%'
    })),
    sink.action('%$cmp.llmIncResponse()%')
  )
})

component('companion.richPrompt', {
  impl: () => `Please update the component below based on the requested fixes. 
Ensure:
- Existing **coding style** is preserved
- Changes are applied **precisely as described**
- Missing details inferred **logically**

### Requested Fixes:
\`\`\`
%$appData.userPrompt%
\`\`\`

### Current Component:
\`\`\`javascript
%$appData.originalComp%
\`\`\`

---

### **Response Format**
Return TWO code blocks in this exact order:

1. Updated Component (\`\`\`javascript):
\`\`\`javascript\ncomponent('myComp', {
    // Updated code here\n})
\`\`\`

2. Differences and Reasoning (\`\`\`text):
\`\`\`text
Explanation of differences and changes made...
\`\`\``
})

extension('companion','utils', {
    llmIncResponse(nextStr, cmp) {
        let contentId = 'suggestedComp'
        const appData = cmp.ctx.vars.appData

        cmp.llmAllText = (cmp.llmAllText || '') + nextStr    
        if (cmp.llmAllText.startsWith('```javascript\n'))
            cmp.llmCompText = cmp.llmAllText.slice('```javascript\n'.length)
            
        if (!cmp.llmCompText) return // Exit early if no valid JavaScript content yet

        // Detect the transition to reasoning section
        if (cmp.llmCompText.includes('```text\n')) {
            const [compText, reasoningText] = cmp.llmCompText.split('```text\n')
            appData.suggestedComp = compText.split('```')[0].trim()
            appData.diffAndReasoning = reasoningText.split('```')[0].trim()
            contentId = 'diffAndReasoning'
        } else {
            appData.suggestedComp = cmp.llmCompText // Incremental update
        }    
        return contentId
    }
})

extension('companion','vscode', {
    initCompanion({context}) {
        jb.companion.vsCodeContext = context
    },

    async openView() { // ctrl-shift-C
        const activeTextEditor = vscodeNS.window.activeTextEditor
        vscodeNS.commands.executeCommand('workbench.action.editorLayoutTwoRows')
        const { compText, compLine } = jb.tgpTextEditor.host.compTextAndCursor()
        const hash = jb.utils.calcHash('{\n' + (compText || '').split('\n').slice(1).join('\n').slice(0, -1))

        const view = vscodeNS.window.createWebviewPanel('companion.main', 'Fix Component', vscodeNS.ViewColumn.Two, 
            { enableScripts: true, retainContextWhenHidden: true  })
        const _jbBaseUrl = 'http://localhost:8082'
        jb.vscode.log(`openView`)

        view.webview.onDidReceiveMessage(message => {
            jb.vscode.log(`Received message in VSCode Extension ${JSON.stringify(message)}`)
            if (message.type === 'submit')
                jb.tgpTextEditor.host.applyEdit(message.value.edits,{activeTextEditor})
            }, undefined, jb.companion.vsCodeContext.subscriptions
        )
        const fixedCompText = compText.replace(/`/g, '\\`')
        view.webview.html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script type="text/javascript" src="${_jbBaseUrl}/plugins/loader/jb-loader.js"></script>
        <script type="text/javascript" src="${_jbBaseUrl}/package/companion.js"></script>
        <script>
        jbHost.baseUrl = '${_jbBaseUrl}'
        globalThis.myVscodeApi = acquireVsCodeApi()
        ;(async () => {
            globalThis.jb = await jbLoadPacked('companion')
            jb.baseUrl = '${_jbBaseUrl}'
            globalThis.spy = jb.spy.initSpy({spyParam: 'companion,vscode'})
            const appData = { userPrompt: '', compLine: ${compLine}, originalComp: \`${fixedCompText}\`}
            const ctx = new jb.core.jbCtx().setVars({appData})
            const app = ctx.run({$: 'companion.app'}, 'page<html>')
            app.injectIntoElem({topEl: main, registerEvents: true})
        })()
    
        </script>
    </head>
    <body class="vscode-studio">
        <div id="main"></div>
    </body>
    </html>`
        
    }
})
