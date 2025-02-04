dsl('zui')
using('html')

component('app', {
  type: 'control',
  params: [
    {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'sections', type: 'section<html>[]'},
    {id: 'zoomingGrid', type: 'control', dynamic: true},
    {id: 'style', type: 'app-style', dynamic: true, defaultValue: app()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('app', {
  type: 'app-style',
  impl: features(
    html((ctx,{$model}) => $model.html(ctx.setVars(jb.objFromEntries($model.sections.map(sec=>[sec.id,sec.html(ctx)]))))),
    css((ctx,{$model}) => $model.css(ctx.setVars(jb.objFromEntries($model.sections.map(sec=>[sec.id,sec.css(ctx)]))))),
    init((ctx,{cmp, $model}) => {
      cmp.children = [$model.zoomingGrid(ctx).init()]
      cmp.extendedPayloadWithDescendants = async (res) => {
        const zoomingGrid = cmp.children[0]
        const pack = { [res.id]: res, ...(await zoomingGrid.calcPayload()) }
        return pack
      }
    }),
    frontEnd.init((ctx,{cmp, uiTest, widget}) => {
        cmp.taskProgress = new jb.zui.taskProgress(ctx)
        const ctxToUse = ctx.setVars({userData: widget.userData, appData: widget.appData})

        Object.assign(cmp, {
          dataBinder: !uiTest && new jb.html.DataBinder(ctxToUse,[cmp.base.querySelector('.top-panel'), cmp.base.querySelector('.left-panel')]),
          openTaskDialog(index) {
            task_dialog_el.classList.remove('hidden')
            const task = widget.appData.doneTasks[index]
            jb.html.populateHtml(task_dialog_el,ctxToUse.setVars({task}))
          },
          closeTaskDialog() { task_dialog_el.classList.add('hidden') 
          },
          search() { widget.userData.ctxVer++ }
        })
        if (jb.frame.document)
          document.body.appendChild(cmp.base)

        const task_dialog_el = cmp.base.querySelector('.task-dialog')
        jb.html.registerHtmlEvents(task_dialog_el,ctx)
        task_dialog_el.addEventListener('wheel', event => { event.fromApp = true })
    }),
    frontEnd.method('render', (ctx,{cmp}) => cmp.dataBinder.populateHtml()),
    frontEnd.flow(source.animationFrame(), sink.action('%$cmp.render()%'))
  )
})

component('mainApp', {
  type: 'control',
  impl: app({
    html: `<div class="app-layout">
            %$topPanel%
            %$taskDialog%
            <div class="left-panel">
              <div class="top-sections">%$selectLlmModel%</div>
              <div class="tasks-section">%$tasks%</div>
              <div class="bottom-sections">
                %$zoomState%
                %$apiKey%
              </div>
            </div>
            <div class="zooming-grid"></div>
        </div>`,
    css: `body { font-family: Arial, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .fade { transition: opacity 0.5s ease; opacity: 1; }
    .hidden { opacity: 0; }    
    .app-layout { display: grid; grid-template-rows: auto 1fr; grid-template-columns: auto 1fr auto; height: 100%; grid-template-areas: "top top top" "left body body";
  }
  .top-panel { grid-area: top; }
  .left-panel { display: grid; grid-template-rows: auto 1fr auto; width: 300px; background: #f4f4f5; padding: 20px; 
      border-right: 1px solid #ddd; }
  .top-sections { grid-row: 1; }
  .tasks-section { grid-row: 2; height: 100%; overflow-y: auto; }
  .bottom-sections { grid-row: 3; display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }

  %$topPanel% 
  %$selectLlmModel%
  %$zoomState%
  %$tasks%
  %$taskDialog%
  %$apiKey%`,
    sections: [topPanel(), selectLlmModel(), zoomState(), tasks(), apiKey(), taskDialog()],
    zoomingGrid: zoomingGrid(card('%$domain/card%'), iconBox('%$domain/iconBox%'), {
      itemsLayout: '%$domain.itemsLayout()%'
    })
  })
})

component('topPanel', {
  type: 'section<html>',
  impl: section({
    id: 'topPanel',
    html: () => `<div class="top-panel">
  <a class="logo" href="${jbHost.baseUrl}/plugins/zui/">
    <img src="${jbHost.baseUrl}/bin/zui/zui-logo.webp" alt="ZUI Logo" />
  </a>
  <div class="search-box">
    <input type="text" twoWayBind="%$userData.query%" placeholder="Search or enter your query..." onEnter="cmp.search()" />
    <button type="submit" onClick="cmp.search()" bind="%$appData.ctxVer%🔍"></button>
  </div>
</div>`,
    css: `.top-panel { display: flex; flex-direction: row; gap: 10px; padding: 15px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
    .top-panel .logo img { height: 50px; width: auto; }
    .top-panel .search-box { flex: 4; display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #ccc; border-radius: 20px; 
        padding: 5px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .top-panel .search-box input { flex: 1; border: none; font-size: 16px; outline: none}
    .top-panel .search-box button { border: none; background: #007bff; color: #fff; border-radius: 50%; width: 35px; height: 35px; 
        font-size: 10px; cursor: pointer; }`
  })
})

component('selectLlmModel', {
  type: 'section<html>',
  impl: section({
    id: 'selectLlmModel',
    html: () => `<div class="select-model">
    <select twoWayBind="%$userData.preferedLlmModel%" id="preferedLlmModel" class="llm-select">
      ${jb.exec({$: 'zui.decoratedllmModels'}).map(({id,name,priceStr,speed,qualitySymbol,speedSymbol}) => `<option value="${id}">
      ${qualitySymbol} ${name} (${priceStr})</option>`).join('')}
    </select>
</div>`,
    css: `.select-model { margin-bottom: 20px; }
    .select-model label { font-size: 14px; color: #333; margin-right: 10px; }
    .select-model .llm-select { width: 100%; padding: 10px; font-size: 14px; color: #333; border: 1px solid #ccc; 
        border-radius: 5px; background-size: 10px; appearance: none; }
    .select-model .llm-select:focus { outline: none; border-color: #007bff; box-shadow: 0 0 5px rgba(0,123,255,0.5); }
    .select-model .llm-select:hover { border-color: #999; }
    .select-model .llm-select option { font-size: 14px; padding: 5px; }`
  })
})

component('zoomState', {
  type: 'section<html>',
  impl: section({
    id: 'zoomState',
    html: () => `<div class="pan-zoom-state">
    <div class="controls">
      <label for="zoom">Zoom:</label>
      <input bind_value="%$widget.state.zoom%" type="number" id="zoom" value="1.5" readonly />
      <label for="center">Center:</label>
      <input type="text" bind_value="%$widget.state.center%" id="center" value="[0, 0]" readonly />
    </div>
    <div class="controls">
      <label for="speed">Speed:</label>
      <input type="range" twoWayBind="%$widget.state.speed%" id="speed" min="1" max="5" step="0.1" value="2.5" />
      <span id="speed-value" bind_text="%$widget.state.speed%">2.5</span>
    </div>
  </div>`,
    css: `
        .pan-zoom-state .controls { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
        .pan-zoom-state label { font-size: 14px; margin-right: 5px; }
        .pan-zoom-state input[type="number"], .pan-zoom-state input[type="text"] {
            font-size: 14px; padding: 5px; width: 66px; border: 1px solid #ddd; border-radius: 5px; background-color: #f5f5f5; color: #555; }
        .pan-zoom-state input[type="range"] { flex-grow: 1; margin-left: 10px; }
        .pan-zoom-state #speed-value { font-size: 14px; color: #444; min-width: 30px; text-align: center; }`
  })
})

component('taskDialog', {
  type: 'section<html>',
  impl: section({
    id: 'taskDialog',
    html: () => `<div class="task-dialog hidden">
      <div class="dialog-header">
        <h2 bind="%$task/shortSummary%"></h2>
        <button class="close-button" onClick="cmp.closeTaskDialog()">×</button>
      </div>
      <div class="dialog-body">
        <h3 class="header">Usage Statistics</h3>
        <div class="usage">
          ${['modelId', 'estimate', 'itemsToUpdate'].map(k =>
            `<p><strong>${k}</strong> <span bind_text="%$task/${k}%"></span></p>`).join('')}
          <p><strong>Prompt Tokens:</strong> <span bind_text="%$task/llmUsage/usage/prompt_tokens%"></span></p>
          <p><strong>Completion Tokens:</strong> <span bind_text="%$task/llmUsage/usage/completion_tokens%"></span></p>
          <p><strong>Total Tokens:</strong> <span bind_text="%$task/llmUsage/usage/total_tokens%"></span></p>
          <p><strong>Cost:</strong> <span bind_text="%$task/llmUsage/cost%"></span></p>
        </div>
        <h3 class="header">User Query</h3>
        <div class="query">
          <pre><code bind_text="%$task/llmUsage/chat/0/content%"></code></pre>
        </div>
        <h3 class="header">LLM Response</h3>
        <div class="full-content">
          <pre><code bind_text="%$task/llmUsage/fullContent%"></code></pre>
        </div>
      </div>
    </div>`,
    css: `
      .task-dialog { 
        width: 800px; height: 600px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; 
        box-sizing: border-box; font-family: Arial, sans-serif; position: fixed; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); z-index: 1000; display: flex; 
        flex-direction: column;
      }
      .task-dialog.hidden { display: none; }
      .dialog-header { 
        display: flex; justify-content: space-between; align-items: center; padding: 20px; 
        background-color: #fff; border-bottom: 1px solid #ddd; flex-shrink: 0;
      }
      .dialog-header h2 { font-size: 20px; margin: 0; }
      .close-button { background: none; border: none; font-size: 24px; cursor: pointer; color: #333; }
      .close-button:hover { color: #000; }
      .dialog-body { 
        overflow-y: auto; padding: 20px; flex-grow: 1; 
      }
      .dialog-body::-webkit-scrollbar { width: 8px; }
      .dialog-body::-webkit-scrollbar-thumb { background-color: #bbb; border-radius: 4px; }
      .dialog-body::-webkit-scrollbar-thumb:hover { background-color: #999; }
      .task-dialog .header { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
      .task-dialog .usage p { margin: 5px 0; font-size: 14px; color: #555; }
      .task-dialog .query pre, .full-content pre { 
        background: #eee; padding: 10px; border-radius: 5px; font-size: 13px; overflow-x: auto; 
      }
      .task-dialog .query code, .full-content code { font-family: monospace; color: #444; }
      .task-dialog .usage strong { color: #000; }
    `
  })
})

component('tasks', {
  type: 'section<html>',
  impl: section({
    id: 'tasks',
    html: () => `<div class="tasks">
      <h3 class="tasks-header">Running Queries</h3>
      ${[0, 1, 2, 3, 4].map(i => `
        <div class="task" bind_display="%$appData/runningTasks/${i}%" bind_style="background-color:cmp.taskProgress.color(${i})">
          <small bind_text="%$appData/runningTasks/${i}/title%"></small>
          <progress bind_value="cmp.taskProgress.progress(${i})" bind_max="cmp.taskProgress.max(${i})"></progress>
          <small bind_text="cmp.taskProgress.progressText(${i})"></small>
        </div>`).join('')}
      <h3 class="tasks-header">Done Queries</h3>
      <ul>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `
          <li bind="%$appData/doneTasks/${i}/shortSummary%" bind_title="%$appData/doneTasks/${i}/propertySheet%" 
              onClick="cmp.openTaskDialog(${i})">
          </li>`).join('')}
      </ul>
    </div>`,
    css: `
      .tasks { --warmup-color: #FFB300; --emitting-color: #66BB6A; }
      .tasks-header { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
      .task { padding: 10px; background: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 10px; }
      .tasks ul { list-style: none; padding: 0; margin: 0; }
      .tasks ul li { padding: 5px 0; font-size: 14px; cursor: pointer; }
      .tasks ul li:hover { text-decoration: underline; }
      .tasks button { background: #007bff; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
      .tasks button:hover { background: #0056b3; }
      .tasks progress { width: 100%; height: 10px; border-radius: 5px; margin: 10px 0; overflow: hidden; }
      .tasks progress::-webkit-progress-bar { background-color: #e0e0e0; border-radius: 5px; }
      .tasks progress::-webkit-progress-value { background-color: #007bff; border-radius: 5px; }
    `
  })
})

component('apiKey', {
  type: 'section<html>',
  impl: section({
    id: 'apiKey',
    html: () => `<div class="api-key-section">
      <div class="api-key-row">
        <a href="https://platform.openai.com/settings/organization/api-keys" target="_blank">Get API Key</a>
        <div class="total-cost">
          <small>Total Cost:</small>
          <span id="llmCost" bind_text="%$appData.totalCost%"></span>
        </div>
      </div>
      <input type="text" id="apiKey" twoWayBind="%$userData.apiKey%" placeholder="Enter your API Key" />
    </div>`,
    css: `
      .api-key-section { margin-top: auto; padding-top: 10px; border-top: 1px solid #ddd; }
      .api-key-row { display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 5px; }
      .api-key-row a { color: #007bff; font-size: 14px; font-weight: bold; text-decoration: none; }
      .api-key-row a:hover { text-decoration: underline; color: #0056b3; }
      .total-cost { display: flex; align-items: center; gap: 5px; }
      .total-cost small { font-size: 12px; color: #666; }
      .total-cost span { font-size: 14px; font-weight: bold; color: #007bff; }
      .api-key-section input { width: 100%; padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; margin-top: 5px; }`
  })
})

component('zui.decoratedllmModels', {
  params: [
    {id: 'qualitySymbol', dynamic: true, type: 'item_symbol', defaultValue: symbol(unitScale('_price', { items: '%$items%', byOrder: true }), iqScale())},
    {id: 'speedSymbol', dynamic: true, type: 'item_symbol', defaultValue: symbol(unitScale('_speed', { items: '%$items%', byOrder: true }), speedScale10())}
  ],
  impl: (ctx,qualitySymbolF,speedSymbolF) => {
        const profileIds = Object.keys(jb.comps).filter(k=>k.indexOf('model<llm>') == 0 && !k.match(/model$|byId$/))
        const items = profileIds.map(k=>({...ctx.run({$$: k}), id: k.split('>').pop()}))
        const ctxWithItems = ctx.setVars({items})
        const [qualitySymbol,speedSymbol] = [qualitySymbolF(ctxWithItems), speedSymbolF(ctxWithItems)]
        const sorted = [...items].sort((x,y) => y._price-x._price)
        return sorted.map(item=>({
            ...item,
            qualitySymbol: qualitySymbol(ctx.setData(item)),
            speedSymbol: speedSymbol(ctx.setData(item)),
            priceStr: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item._price) + ' / 1M tokens',
        }))
    }
})
