dsl('zui')

extension('zui','task', {
  initExtension() {
    return { taskCounter: 0 }
  },
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
        const currentItem = itemsToUpdate ? `, ${itemsToUpdate.split(', ')[itemCounter]}` : ''
        return itemCounter ? `${progress}/${max} items${currentItem}` : `preparing ${progress}/${max} sec`
      }
      color(index) {
        const task = this.task(index)
        if (!task) return
        const {itemCounter } = task
        return itemCounter ? 'var(--emitting-color)' : 'var(--warmup-color)'
      }
  }
})

component('zui.taskToRun', {
  impl: ctx => {
    const id = jb.zui.taskCounter++
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
    const task = { id, title, shortSummary, op, noOfItems, itemsToUpdate, details, detailsLevel, model, quality,ctxVer, estimatedFirstItem }

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
        zui.moveTaskToDone(),
        writeValue('%$appData/totalCost%', () => `$${Math.floor(jb.llm.totalCost * 10000)/10000}`),
        zui.taskSummaryValues()
      ),
      onItem: (ctx,{task}) => {
        task.itemCounter = (task.itemCounter||0)+1
        task.actualFirstItem = task.actualFirstItem || new Date().getTime() - task.startTime
      }
    }),
    rx.map(extendWithObj(obj(
      prop('title', ({data}) => data.title.trim()),
      prop('_detailsLevel', '%$task/detailsLevel%'),
      prop('_ctxVer', '%$task/ctxVer%'),
      prop('_taskId', '%$task/id%'),
      prop('_modelId', '%$task/model/id%')
    ))),
    rx.log('zui new item from llm')
  )
})

component('zui.moveTaskToDone', {
  impl: ctx => {
    const task = ctx.data
    const {doneTasks, runningTasks} = ctx.vars.appData
    jb.log('zui moveTaskToDone',{task,ctx})
    doneTasks.unshift(task)
    const index = runningTasks.indexOf(task)
		if (index != -1)
      runningTasks.splice(index,1)
  }
})

component('zui.taskSummaryValues', {
  impl: ctx => {
    const task = ctx.data
    const { title, op, noOfItems, itemsToUpdate, details, detailsLevel, model, ctxVer, estimatedFirstItem, startTime, actualFirstItem } = task
    const fullDuration = task.fullDuration = (new Date().getTime() - startTime)
    task.itemDuration = noOfItems == 1 ? 0 : (fullDuration - actualFirstItem) / (noOfItems -1)
    const cost = task.llmUsage && task.llmUsage.cost ? `, $${task.llmUsage.cost}` : ''
    task.shortSummary = `${op} ${noOfItems} ${details}s${cost}`
    task.modelId = task.model.id
    task.estimate = `firstItem: ${actualFirstItem} vs ${estimatedFirstItem*1000}\nitemDuration: ${task.itemDuration} vs ${1000*model.speed[details][1]}`
    task.propertySheet = ['id', 'startTime', 'modelId','estimate','itemsToUpdate'].map(k=>`${k}: ${task[k]}`).join('\n')
    console.log(task)
  }
})

component('zui.buildTaskPayload', {
  impl: ctx => {
    const { $model, cmp, appData } = ctx.vars
    const { ctxVer } = appData
    cmp.items = cmp.items.filter(item=>item._ctxVer == ctxVer)
    const itemsFromLlm = cmp.itemsFromLlm.filter(item=>item._ctxVer == ctxVer)
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
    const {appData, state} = widget
    const { ctxVer, runningTasks, doneTasks } = appData
    cmp.items = cmp.items.filter(item=>item._ctxVer == ctxVer)
    const { gridSize, newItems, itemsToUpdate} = be_data
    if (newItems && newItems.length) {
      cmp.items = [...cmp.items, ...newItems]
      if (state.gridSize != gridSize) {
          state.gridSize = gridSize
          const zoom = Math.max(...gridSize,1)
          const center = [0,1].map(axis => Math.floor(gridSize[axis] / 2))
          state.zoom = state.tZoom = zoom
          state.center = state.tCenter = center
      }
    }
    cmp.itemsMap = jb.objFromEntries(cmp.items.map(item=>[item.title,item]))
    itemsToUpdate && itemsToUpdate.forEach(itemToUpdate => {
      const existingItem = cmp.itemsMap[itemToUpdate.title]
      if (!existingItem) {
        const task = [...runningTasks,...doneTasks].find(t=>t.id == itemToUpdate._taskId)
        jb.logError('zui hanleTaskPayload itemToUpdate, can not find existing item',{itemToUpdate, task, itemsMap: cmp.itemsMap, be_data, ctx})
      }
      existingItem && Object.assign(existingItem, itemToUpdate)
    })
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

