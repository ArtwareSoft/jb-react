dsl('zui')

component('zui.taskToRun', {
  impl: ctx => {
    const {userData } = ctx.data
    const { preferedLlmModel,exposure } = userData
    if (!preferedLlmModel)
      return jb.logError('taskToRun no preferedLlmModel in userData',{userData, ctx})
    if (!userData.detailsLevel) return []
    const { appData } = ctx.vars
    const allTasks = [...appData.runningTasks,...appData.doneTasks]
    const itemsToFilter = allTasks.flatMap(t=>(t.itemsToUpdate||'').split(', ')).map(x=>x.trim())
    const items = Object.entries(exposure||{}).sort((x,y) => y[1]-x[1]).filter(x=>x[1]).map(x => x[0])
      .filter(item=>itemsToFilter.indexOf(item) == -1)

    let op, noOfItems,detailsLevel,itemsToUpdate
    if (items.length > 0) {
      noOfItems = items.length
      itemsToUpdate = items.join(', ')
      detailsLevel = 2
      op = 'update'
    } else {
      noOfItems = 30 // todo: where to put?
      detailsLevel = 1
      op = 'new'
    }
    const modelId = preferedLlmModel
    const model = {id: modelId, ...ctx.run({$$: `model<llm>${modelId}` }) }
    const quality = model.quality, ctxVer = appData.ctxVer
    const details = detailsLevel == 1 ? 'icon' : 'card'
    const speed = model.speed[details]
    const [estimatedFirstItem] = model.speed[details]
    const shortSummary = title = `${op} ${noOfItems} ${details}s, ${modelId}`
    const task = { title, shortSummary, op, noOfItems, itemsToUpdate, details, detailsLevel, model, quality,ctxVer, estimatedFirstItem }

    const res = !allTasks.find(t=> ['detailsLevel','quality','ctxVer','op','itemsToUpdate']
      .every(p => typeof p == 'number' ? t[p] <=task[p] : t[p] == task[p])) && task
    if (!res) return
    jb.log('zui new task',{task,items,itemsToFilter,appData: JSON.parse(JSON.stringify(appData)), ctx})
    appData.runningTasks.unshift(res)
    return res
  }
})

component('zui.itemsFromLlm', {
  type: 'rx<>',
  impl: rx.innerPipe(
    rx.map(zui.taskToRun()),
    rx.filter('%%'),
    rx.log('zui task to run'),
    rx.var('task'),
    rx.do(writeValue('%$task/startTime%', now())),
    rx.flatMap(domain.itemsSource('%$domain%', '%$task%'), {
      onInputEnd: runActions(
        addToArray('%$appData/doneTasks%', { addAtTop: true }),
        removeFromArray('%$appData/runningTasks%', '%$task%'),
        writeValue('%$appData/totalCost%', () => `$${jb.llm.totalCost}`),
        zui.taskSummaryValues()
      ),
      onItem: (ctx,{task}) => {
        task.itemCounter = (task.itemCounter||0)+1
        task.actualFirstItem = task.actualFirstItem || new Date().getTime() - task.startTime
      }
    }),
    rx.map(extendWithObj(obj(
      prop('_detailsLevel', '%$task/detailsLevel%'),
      prop('_ctxVer', '%$task/ctxVer%'),
      prop('_modelId', '%$task/model/id%')
    ))),
    rx.log('zui new item from llm')
  )
})

component('zui.taskSummaryValues', {
  impl: ctx => {
    const task = ctx.data
    const { title, op, noOfItems, itemsToUpdate, details, detailsLevel, model, ctxVer, estimatedFirstItem, startTime, actualFirstItem } = task
    const fullDuration = task.fullDuration = (new Date().getTime() - startTime)
    task.itemDuration = noOfItems == 1 ? 0 : (fullDuration - actualFirstItem) / (noOfItems -1)
    const cost = task.llmUsage && task.llmUsage.cost ? `, $${task.llmUsage.cost}` : ''
    task.shortSummary = `${noOfItems} ${details}s, ${model.id}${cost}`
    task.estimate = `firstItem: ${actualFirstItem} vs ${estimatedFirstItem*1000}\nitemDuration: ${task.itemDuration} vs ${1000*model.speed[details][1]}`
    task.propertySheet = ['op','estimate','itemsToUpdate'].map(k=>`${k}: ${task[k]}`).join('\n')
  }
})

component('zui.buildTaskPayload', {
  impl: ctx => {
    const { $model, cmp, appData } = ctx.vars
    const { itemsFromLlm } = cmp
    if (itemsFromLlm.length) {
      const itemsMap = jb.objFromEntries(cmp.items.map(item=>[item.title,item]))
      const newItemsFromLlm = itemsFromLlm.filter(({title})=>! itemsMap[title])
      const itemsToUpdateFromLlm = itemsFromLlm.filter(({title})=>itemsMap[title])
      itemsToUpdateFromLlm.forEach(itemToUpdate=>Object.assign(itemsMap[itemToUpdate.title], itemToUpdate))
      cmp.items = [...cmp.items, ...newItemsFromLlm]
      if (newItemsFromLlm.length)
        cmp.itemsLayout = $model.itemsLayout(ctx.setVars({items: cmp.items}))
      const elemCmp = cmp.children.find(c=>c.props.detailsLevel == detailsLevel)
      ;[...cmp.items].forEach(item => elemCmp.doExtendItem(item)) // doExtendItem may resort the items

      const updatedItemsMap = jb.objFromEntries(cmp.items.map(item=>[item.title,item]))
      const newItems = newItemsFromLlm.map(({title})=>updatedItemsMap[title])
      const itemsToUpdate = itemsToUpdateFromLlm.map(({title})=>updatedItemsMap[title])
      cmp.itemsFromLlm.length = 0
      return {appData, [cmp.id] : { gridSize: cmp.itemsLayout.gridSize, newItems, itemsToUpdate} }
    }
  }
})

component('zui.hanleTaskPayload', {
  impl: ctx => {
    const { cmp, widget, be_data } = ctx.vars
    const { gridSize, newItems, itemsToUpdate} = be_data
    if (newItems && newItems.length) {
      cmp.items = [...cmp.items, ...newItems]
      if (widget.state.gridSize != gridSize) {
          widget.state.gridSize = gridSize
          const zoom = Math.max(...gridSize,1)
          const center = [0,1].map(axis => Math.floor(gridSize[axis] / 2))
          widget.state.zoom = widget.state.tZoom = zoom
          widget.state.center = widget.state.tCenter = center
      }
    }
    if (itemsToUpdate && itemsToUpdate.length) {
      const itemsMap = jb.objFromEntries(cmp.items.map(item=>[item.title,item]))
      itemsToUpdate.forEach(itemToUpdate=>Object.assign(itemsMap[itemToUpdate.title], itemToUpdate))
    }
  }
})

component('baseTask', {
  type: 'task',
  params: [
    {id: 'id', as: 'number'},
    {id: 'title', as: 'string'},
    {id: 'noOfItems', as: 'number', options: '1,5,30'},
    {id: 'details', as: 'string', options: 'icon,card'},
    {id: 'model', type: 'model<llm>'},
    {id: 'detailsLevel', as: 'number'},
    {id: 'op', as: 'string', defaultValue: 'new', options: 'update,new'},
  ]
})

extension('zui','task', {
  taskProgress: class {
      constructor(ctx) {
        this.ctx = ctx
      }
      task(index) {
        return this.ctx.vars.widget.appData.runningTasks[index]
      }
      max(index) {
        const task = this.task(index)
        if (!task) return
        const {itemCounter, estimatedFirstItem,noOfItems} = task
        return itemCounter ? noOfItems : estimatedFirstItem
      }
      progress(index) {
        const task = this.task(index)
        if (!task) return
        const {itemCounter, startTime } = task
        return itemCounter ? itemCounter : Math.floor((new Date().getTime() - startTime)/1000)
      }
      progressText(index) {
        const task = this.task(index)
        if (!task) return
        const {itemCounter, itemsToUpdate } = task
        const max = this.max(index), progress = this.progress(index)
        const currentItem = (itemsToUpdate || '').split(', ')[itemCounter]
        return itemCounter ? `${progress}/${max} items, ${currentItem}` : `${progress}/${max} sec`
      }
      color(index) {
        const task = this.task(index)
        if (!task) return
        const {itemCounter } = task
        return itemCounter ? 'var(--emitting-color)' : 'var(--warmup-color)'
      }
  }
})


