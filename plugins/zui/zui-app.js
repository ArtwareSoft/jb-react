dsl('zui')

component('app', {
  type: 'control',
  params: [
    {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'sections', type: 'section[]'},
    {id: 'zuiControl', type: 'control', dynamic: true},
    {id: 'style', type: 'app-style', dynamic: true, defaultValue: app()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('app', {
  type: 'app-style',
  impl: features(
    appCmp(),
    html((ctx,{$model}) => $model.html(ctx.setVars(jb.objFromEntries($model.sections.map(sec=>[sec.id,sec]))))),
    css((ctx,{$model}) => $model.css(ctx.setVars(jb.objFromEntries($model.sections.map(sec=>[sec.id,sec]))))),
    init((ctx,{cmp, appData,$model}) => {
        cmp.updateZuiControl = async userData => {
            const ctxToUse = ctx.setVars({userData})
            appData.items = await ctxToUse.run({$: 'domain.calcItems'})
            debugger
            const zuiCtrl = $model.zuiControl(ctxToUse).init()
            cmp.children = [zuiCtrl]
            cmp.extendedPayloadWithDescendants = async res => ({ 
                appData, ...await zuiCtrl.calcPayload() 
            })
            const ret = await cmp.calcPayload()
            return ret
        }
    }),
    frontEnd.init((ctx,{cmp, uiTest, widget}) => {
        const ctxToUse = ctx.setVars({userData: widget.userData, appData: widget.appData})
        cmp.dataBinder = !uiTest && new jb.zui.DataBinder(ctxToUse,cmp.base)
    }),
    frontEnd.method('render', (ctx,{cmp}) => cmp.dataBinder.populateHtml())
  )
})

component('mainApp', {
  type: 'control',
  impl: app({
    html: `<div class="app-layout">
            %$topPanel.html%
            %$leftPanel.html%
            <div class="zui-control"></div>
        </div>`,
    css: `body { font-family: Arial, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .fade { transition: opacity 0.5s ease; opacity: 1; }
    .hidden { opacity: 0; }
    
  .app-layout { display: grid; grid-template-rows: auto 1fr; grid-template-columns: auto 1fr auto; height: 100%; 
    grid-template-areas: "top top top" "left body body";
  }
  .top-panel { grid-area: top; }
  %$topPanel.css% 
  %$leftPanel.css%`,
    sections: [topPanel(), leftPanel()],
    zuiControl: itemlist('%$domain.zuiControl()%', '%$domain.itemsLayout()%')
  })
})

component('topPanel', {
  type: 'section',
  impl: section({
    id: 'topPanel',
    html: () => `<div class="top-panel">
  <a class="logo" href="${jbHost.baseUrl}/plugins/zui/">
    <img src="${jbHost.baseUrl}/plugins/zui/zui-logo.webp" alt="ZUI Logo" />
  </a>
  <div class="search-box">
    <input type="text" twoWayBind="%$userData.query%" placeholder="Search or enter your query..." onEnter="%$widget.search()" />
    <button type="submit">🔍</button>
  </div>
  <div class="context-chips">${[0,1,2,3,4,5,6,7,8,9,10].map(i => `<span class="chip context-chip" bind_display="%$userData/contextChips/${i}%">
        <span class="chip-text" bind="%$userData/contextChips/${i}%"></span>
        <button class="remove" onclick="removeContextChip(${i})">×</button>
      </span>`).join('')}
  </div>
  <div class="suggested-chips">${[0,1,2,3,4,5,6,7,8,9,10].map(i => `
  <div class="chip suggested-chip" bind_display="%$appData/suggestedContextChips/${i}%" onclick="addToContext(${i})">
        <span class="chip-text" bind="%$appData/suggestedContextChips/${i}%"></span>
        <span class="add-icon">+</span>
      </div>`).join('')}
  </div>
</div>`,
    css: `.top-panel { display: flex; flex-direction: row; gap: 10px; padding: 15px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
    .top-panel .logo img { height: 50px; width: auto; }
    .top-panel .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #ccc; border-radius: 20px; 
        padding: 5px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .top-panel .search-box input { flex: 1; border: none; font-size: 16px; }
    .top-panel .search-box button { border: none; background: #007bff; color: #fff; border-radius: 50%; width: 35px; height: 35px; 
        font-size: 10px; cursor: pointer; }
    .top-panel .context-chips, .top-panel .suggested-chips { display: flex; flex-wrap: wrap; gap: 10px; flex: 1; }
    .top-panel .suggested-chips { flex: 2; }
    .top-panel .chip { border-width: 0; height: 16px; padding: 5px 8px; display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; 
        font-size: 12px; font-weight: bold; cursor: pointer; }
    .top-panel .chip.context-chip { background: #cce5ff; color: #004085; }
    .top-panel .chip.context-chip:hover { background: #b8daff; }
    .top-panel .chip.context-chip .remove { background: none; border: none; margin-left: 5px; color: #6c757d; font-size: 12px; cursor: pointer; 
        display: none; }
    .top-panel .chip.context-chip:hover .remove { display: inline; }
    .top-panel .chip.suggested-chip { background: #d4edda; color: #155724; position: relative; transition: background 0.2s; }
    .top-panel .chip.suggested-chip:hover { background: #c3e6cb; }
    .top-panel .chip.suggested-chip .add-icon { display: none; background: #fff; color: #155724; border-radius: 50%; width: 18px; 
        height: 18px; font-size: 12px; font-weight: bold; align-items: center; justify-content: center; margin-left: 8px; 
        background: #d4edda; color: #155724;}
    .top-panel .chip.suggested-chip:hover .add-icon { display: flex; }`
  })
})

component('leftPanel', {
  type: 'section',
  impl: section({
    id: 'leftPanel',
    html: () => `<div class="left-panel">
    <div class="controls">
        <label for="preferedLlmModel">LLM Model:</label>
        <select twoWayBind="%$userData.preferedLlmModel%" id="preferedLlmModel" class="llm-select">
          ${jb.exec({$: 'zui.decoratedllmModels'}).map(({name,cost,speed,qualitySymbol,speedSymbol}) => `<option value="${name}">
          ${qualitySymbol} ${speedSymbol} ${name} ${speed} (${cost})</option>`).join('')}
        </select>
    </div>
    <div class="section pan-zoom-state">
      <h3>Pan/Zoom State</h3>
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
    </div>
    <div class="section tasks">
      <h3>Tasks</h3>${[0,1,2,3,4].map(i => `
        <div class="task" bind_display="%$appData/runningTasks/${i}%">
          <p bind_text="%$appData/runningTasks/${i}/title%"></p>
          <progress bind_value="%$appData/runningTasks/${i}/duration()%" bind_max="%$appData/runningTasks/${i}/estimatedDuration%" value="0.04" max="1"></progress>
          <small bind_text="%$appData/runningTasks/${i}/duration()%/%$appData/runningTasks/${i}/estimatedDuration% sec">2/50 sec</small>
        </div>`).join('')}
      <div class="expandable">
        <h4>Done Tasks</h4>
        <ul>${[0,1,2,3,4].map(i => `
          <li bind="%$appData/doneTasks/${i}/title%">Query 1: 
            <span>5 sec</span>, <span>$0.08</span>, <span>500 tokens</span>
          </li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="section content-quality">
      <h3>Content Quality</h3>
      <button>Improve Content</button>
      <p>Fast LLM Items: <span>20</span></p>
      <p>Old Context Items: <span>5</span></p>
    </div>
    <div class="section budget">
      <h3>Budget</h3>
      <progress value="4" max="10"></progress>
      <p>
        <span style="color: green;">$2: GPT-3.5</span>,
        <span style="color: red;">$2: GPT-4</span>
      </p>
      <button>Add $2</button>
    </div>
  </div>`,
    css: `.left-panel { display: flex; flex-direction: column; width: 300px; background: #f4f4f5; padding: 20px; 
        border-right: 1px solid #ddd; overflow-y: auto; }
    .left-panel .controls { margin-bottom: 20px; }
    .left-panel .controls label { font-size: 14px; color: #333; margin-right: 10px; }
    .left-panel .controls .llm-select { width: 100%; padding: 10px; font-size: 14px; color: #333; border: 1px solid #ccc; 
        border-radius: 5px; background-size: 10px; appearance: none; }
    .left-panel .controls .llm-select:focus { outline: none; border-color: #007bff; box-shadow: 0 0 5px rgba(0,123,255,0.5); }
    .left-panel .controls .llm-select:hover { border-color: #999; }
    .left-panel .controls .llm-select option { font-size: 14px; padding: 5px; }
    .left-panel .pan-zoom-state { margin-bottom: 20px; }
    .left-panel .pan-zoom-state .controls { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
    .left-panel .pan-zoom-state label { font-size: 14px; margin-right: 5px; }
    .left-panel .pan-zoom-state input[type="number"], .left-panel .pan-zoom-state input[type="text"] {
        font-size: 14px; padding: 5px; width: 66px; border: 1px solid #ddd; border-radius: 5px; background-color: #f5f5f5; color: #555; }
    .left-panel .pan-zoom-state input[type="range"] { flex-grow: 1; margin-left: 10px; }
    .left-panel .pan-zoom-state #speed-value { font-size: 14px; color: #444; min-width: 30px; text-align: center; }
    .left-panel .section { margin-bottom: 20px; }
    .left-panel .section h3 { font-size: 16px; margin-bottom: 10px; color: #444; }
    .left-panel .section .task { padding: 10px; background: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 10px; }
    .left-panel .section .expandable h4 { cursor: pointer; color: #007bff; text-decoration: underline; margin-bottom: 5px; }
    .left-panel .section .expandable ul { list-style: none; padding: 0; margin: 0; }
    .left-panel .section .expandable ul li { padding: 5px 0; font-size: 14px; }
    .left-panel .section button { background: #007bff; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
    .left-panel .section button:hover { background: #0056b3; }
    .left-panel .section progress { width: 100%; height: 10px; border-radius: 5px; margin: 10px 0; overflow: hidden; }
    .left-panel .section progress::-webkit-progress-bar { background-color: #e0e0e0; border-radius: 5px; }
    .left-panel .section progress::-webkit-progress-value { background-color: #007bff; border-radius: 5px; }`
  })
})

component('zui.decoratedllmModels', {
    params: [
        {id: 'qualitySymbol', dynamic: true, type: 'item_symbol', defaultValue: symbol(unitScale('quality'), iqScale())},
        {id: 'speedSymbol', dynamic: true, type: 'item_symbol', defaultValue: symbol(unitScale('speed'), speedScale10())}
    ],
    impl: (ctx,qualitySymbolF,speedSymbolF) => {
        const profileIds = Object.keys(jb.comps).filter(k=>k.indexOf('model<llm>') == 0 && k!='model<llm>model')
        const items = profileIds.map(k=>ctx.run({$$: k}))
        const ctxWithItems = ctx.setVars({items})
        const [qualitySymbol,speedSymbol] = [qualitySymbolF(ctxWithItems), speedSymbolF(ctxWithItems)]
        return items.sort((x,y) => y.quality-x.quality).map(item=>({...item, 
            qualitySymbol: qualitySymbol(ctx.setData(item)),
            speedSymbol: speedSymbol(ctx.setData(item)),
            cost: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.cost) + ' / 1M tokens',
        }))
    }
})

