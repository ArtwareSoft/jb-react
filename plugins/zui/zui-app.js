dsl('zui')

component('app', {
  type: 'control',
  params: [
    {id: 'html', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'css', as: 'string', dynamic: true, newLinesInCode: true},
    {id: 'sections', type: 'section[]'},
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
        const rootElements = [cmp.base.querySelector('.top-panel'), cmp.base.querySelector('.left-panel')]
        cmp.dataBinder = !uiTest && new jb.zui.DataBinder(ctxToUse,rootElements)
        if (jb.frame.document)
          document.body.appendChild(cmp.base)
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
            %$leftPanel%
            <div class="zooming-grid"></div>
        </div>`,
    css: `body { font-family: Arial, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .fade { transition: opacity 0.5s ease; opacity: 1; }
    .hidden { opacity: 0; }    
  .app-layout { display: grid; grid-template-rows: auto 1fr; grid-template-columns: auto 1fr auto; height: 100%; 
    grid-template-areas: "top top top" "left body body";
  }
  .top-panel { grid-area: top; }
  %$topPanel% 
  %$leftPanel%`,
    sections: [topPanel(), leftPanel()],
    zoomingGrid: zoomingGrid(card('%$domain/card%'), iconBox('%$domain/iconBox%'), {
      itemsLayout: '%$domain.itemsLayout()%'
    })
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
    .top-panel .search-box { flex: 4; display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #ccc; border-radius: 20px; 
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
            ${jb.exec({$: 'zui.decoratedllmModels'}).map(({id,name,priceStr,speed,qualitySymbol,speedSymbol}) => `<option value="${id}">
            ${qualitySymbol} ${name} (${priceStr})</option>`).join('')}
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
        <h3>Running Tasks</h3>${[0,1,2,3,4].map(i => `
          <div class="task" bind_display="%$appData/runningTasks/${i}%" bind_style="background-color:cmp.taskProgress.color(${i})">
            <small bind_text="%$appData/runningTasks/${i}/title%"></small>
            <progress bind_value="cmp.taskProgress.progress(${i})" bind_max="cmp.taskProgress.max(${i})"></progress>
            <small bind_text="cmp.taskProgress.progressText(${i})"></small>
          </div>`).join('')}
        <h3>Done Tasks</h3>
        <ul>${[0,1,2,3,4,5,6].map(i => `<li bind="%$appData/doneTasks/${i}/shortSummary%" bind_title="%$appData/doneTasks/${i}/propertySheet%"></li>`).join('')}</ul>
      </div>
      <div class="api-key-section">
        <div class="api-key-row">
          <a href="https://platform.openai.com/settings/organization/api-keys" target="_blank">Get API Key</a>
          <span id="llmCost" bind_text="%$appData.totalCost%">$0.0046105</span>
        </div>
        <input type="text" id="apiKey" twoWayBind="%$userData.apiKey%" placeholder="Enter your API Key" />
        </div>
    </div>`,
    css: `.left-panel { display: flex; flex-direction: column; width: 300px; background: #f4f4f5; padding: 20px; 
        border-right: 1px solid #ddd; overflow-y: auto; 
        --warmup-color: #FFB300; /* Amber/Orange */
        --emitting-color: #66BB6A; /* Green */    
    }
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
    .left-panel .task { padding: 10px; background: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        margin-bottom: 10px; }
    .left-panel .section ul { list-style: none; padding: 0; margin: 0; }
    .left-panel .section ul li { padding: 5px 0; font-size: 14px; }
    .left-panel .section button { background: #007bff; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
    .left-panel .section button:hover { background: #0056b3; }
    .left-panel .section progress { width: 100%; height: 10px; border-radius: 5px; margin: 10px 0; overflow: hidden; }
    .left-panel .section progress::-webkit-progress-bar { background-color: #e0e0e0; border-radius: 5px; }
    .left-panel .section progress::-webkit-progress-value { background-color: #007bff; border-radius: 5px; }

    .left-panel .llm-cost { margin-bottom: 20px; }
    .left-panel .llm-cost h3 { font-size: 16px; margin-bottom: 10px; color: #444; }
    .left-panel .llm-cost .controls { display: flex; align-items: center; gap: 10px; }
    .left-panel .llm-cost span { font-size: 14px; font-weight: bold; color: #007bff; }
    .left-panel .api-key-section { margin-top: auto; padding-top: 10px; border-top: 1px solid #ddd; }
    .left-panel .api-key-row { display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 5px; }
    .left-panel .api-key-row a { color: #007bff; font-size: 14px; font-weight: bold; text-decoration: none; }
    .left-panel .api-key-row a:hover { text-decoration: underline; color: #0056b3; }
    .left-panel .api-key-row span { font-size: 14px; font-weight: bold; color: #007bff; }
    .left-panel .api-key-section input { width: 100%; padding: 10px; font-size: 14px; border: 1px solid #ccc; 
    border-radius: 5px; box-sizing: border-box; margin-top: 5px; }`
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

