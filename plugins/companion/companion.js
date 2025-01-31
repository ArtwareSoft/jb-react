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
              <textarea class="userPrompt" twoWayBind="%$appData.userPrompt%" placeholder="Ask Anything..."></textarea>
              <button class="run-llm" onClick="companion.runLlm">Send</button>
            </div>
            <div id="toolbar">
              <button onClick="cmp.applyChanges()">Apply</button>
              <button onClick="cmp.show('generatedPrompt')">🤖 AI Prompt</button>
              <button onClick="cmp.show('originalComp')">📜 Original</button>
              <button onClick="cmp.show('suggestedComp')">🔧 Suggested</button>
              <button onClick="cmp.show('diffAndReasoning')">🔧 diff</button>
              <select twoWayBind="%$appData.preferedLlmModel%" class="llm-model">
                ${jb.exec({$: 'companion.llmModels'}).map(({id,name,priceStr}) => `<option value="${id}">${name} (${priceStr})</option>`).join('')}
              </select>
              <span class="api-cost" bind="%$appData.costSummary%"></span>
            </div>
          </div>  
          <div id="editor-section"><div id="editor-container"></div></div>
        </div>
      `,
      css: `
        body { background: var(--vscode-editor-background, #fff); color: var(--vscode-editor-foreground, #333); 
          font-family: var(--vscode-font-family, Arial), sans-serif; }
        #app-container { display: flex; flex-direction: column; margin: 0 }
        
        #chat-box { display: flex; flex-direction: column; padding: 10px; 
          background: var(--vscode-sideBar-background, #f3f3f3); border-radius: 8px; 
          box-shadow: 0 0 10px var(--vscode-widget-shadow, rgba(0,0,0,0.1)); 
          border: 1px solid var(--vscode-editor-border, #ddd); gap: 8px; }
        
        #chat-section { display: flex; align-items: center; gap: 10px; }
        #chat-section textarea { flex-grow: 1; height: 50px; background: var(--vscode-input-background, #fff); 
          border: 1px solid var(--vscode-input-border, #ccc); border-radius: 8px; padding: 10px; color: var(--vscode-input-foreground, #000); 
          font-size: 14px; min-width: 300px; }
        #chat-section button { background: var(--vscode-button-background, #007acc); 
          color: var(--vscode-button-foreground, #fff); border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; 
          transition: background 0.2s; }
        #chat-section button:hover { background: var(--vscode-button-hoverBackground, #0062a3); }
  
        #toolbar { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; padding: 8px; }
        #toolbar button, #toolbar select { background: var(--vscode-button-background, #007acc); 
          color: var(--vscode-button-foreground, #fff); border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; 
          transition: background 0.2s; }
        #toolbar button:hover { background: var(--vscode-button-hoverBackground, #0062a3); }
  
        .llm-model { background: var(--vscode-dropdown-background, #fff); color: var(--vscode-dropdown-foreground, #000); 
          border: 1px solid var(--vscode-dropdown-border, #ccc); border-radius: 4px; padding: 4px; }
          .api-cost { color: var(--vscode-descriptionForeground, #666); font-size: 0.9em; padding: 0 8px; margin-top: 8px; }
        #editor-container { background: var(--vscode-editor-background, #f8f8f8); border: 1px solid var(--vscode-editor-border, #ccc); 
          border-radius: 4px; padding: 8px; font-family: var(--vscode-editor-font-family, 'Consolas'); font-size: var(--vscode-editor-font-size, 14px); }      
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
            this.contentId = contentId
            const {editor,EditorView} = this
            editor && editor.dispatch(editor.state.update({
                changes: { from: 0, to: editor.state.doc.length, insert: appData[contentId] }
            }))
            const line = appData[contentId].split('\n').length
            editor.dispatch({ effects: EditorView.scrollIntoView(editor.state.doc.line(line).from, { y: "center" }) })
        },
        async init() {
            Object.assign(this.ctx.vars.appData,{preferedLlmModel: 'gpt_35_turbo_0125'})
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
            if (globalThis.vscode)
                vscode.postMessage({ type: 'submit', value: { hash, edits }})
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
            appData.suggestedComp = compText.trim()
            appData.diffAndReasoning = reasoningText.trim()
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
        vscodeNS.commands.executeCommand('workbench.action.editorLayoutTwoRows')
        const { compText, compLine } = jb.tgpTextEditor.host.compTextAndCursor()
        const view = vscodeNS.window.createWebviewPanel('companion.main', 'Fix Component', vscodeNS.ViewColumn.Two, { enableScripts: true })
        const _jbBaseUrl = 'http://localhost:8082'
        const fixedCompText = compText.replace(/`/g, '\\`')
        view.webview.html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script type="text/javascript" src="${_jbBaseUrl}/plugins/loader/jb-loader.js"></script>
        <script type="text/javascript" src="${_jbBaseUrl}/package/companion.js"></script>
        <script>
        console.log(0)
        jbHost.baseUrl = '${_jbBaseUrl}'
        vscode = acquireVsCodeApi()
        console.log(vscode)
        ;(async () => {
            globalThis.jb = await jbLoadPacked('companion')
            console.log(jb)
            jb.baseUrl = '${_jbBaseUrl}'
            globalThis.spy = jb.spy.initSpy({spyParam: 'companion,vscode'})
            const appData = { userPrompt: '', compLine: ${compLine}, originalComp: \`${fixedCompText}\`}
            const ctx = new jb.core.jbCtx().setVars({appData})
            console.log(ctx)
            const app = ctx.run({$: 'companion.app'}, 'page<html>')
            console.log(app)
            app.injectIntoElem({topEl: main, registerEvents: true})
        })()
    
        </script>
    </head>
    <body class="vscode-studio">
        <div id="main"></div>
    </body>
    </html>`
        
          view.webview.onDidReceiveMessage(message => { 
              if (message.type === 'submit') {
                const {hash, edits} = message.value
                jb.tgpTextEditor.host.applyEdit(edits,{hash})
              }
            }, undefined, jb.companion.vsCodeContext.subscriptions
          )
    }
})
