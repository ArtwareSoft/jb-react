dsl('zui')

component('zui.taskToRun', {
  impl: ctx => {
    const {userData, state } = ctx.data
    const { preferedLlmModel,exposure } = userData
    if (!userData.detailsLevel) return []
    const { appData } = ctx.vars
    let op, noOfItems,detailsLevel,itemsToUpdate
    if (Object.keys(exposure||{}).length > 0) {
      const items = Object.entries(exposure).sort((x,y) => y[1]-x[1]).filter(x=>x[1]).map(x => x[0])
      noOfItems = items.length
      itemsToUpdate = items.join(', ')
      detailsLevel = 2
      op = 'update'
    } else {
      noOfItems = 30 // todo: where to put?
      detailsLevel = 1
      op = 'new'
    }
    const modelId = preferedLlmModel || 'gpt_35_turbo_0125'
    const model = {id: modelId, ...ctx.run({$$: `model<llm>${modelId}` }) }
    const quality = model.quality, ctxVer = appData.ctxVer
    const details = detailsLevel == 1 ? 'icon' : 'card'
    const speed = model.speed[details]
    const estimatedStartEmit = speed[1]
    const estimatedDuration = speed[0] * noOfItems + speed[1]
    const title = `${op} ${noOfItems} ${details}s using ${modelId}`
    const task = { title, op, noOfItems, itemsToUpdate, details, detailsLevel, model, quality,ctxVer, estimatedStartEmit, estimatedDuration }

    const allTasks = [...appData.runningTasks,...appData.doneTasks]
    const res = [task].filter(task=>!allTasks.find(t=> ['detailsLevel','quality','ctxVer','op','itemsToUpdate']
      .every(p => typeof p == 'number' ? t[p] <=task[p] : t[p] == task[p])))
    if (res.length)
      jb.log('zui task ',{task,ctx})
    return res
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

// component('runningTask', {
//   type: 'task',
//   params: [
//     {id: 'startTime', as: 'number'},
//     {id: 'llmModel', as: 'string'},
//     {id: 'llmPrompt', as: 'string'},
//     {id: 'estimatedDuration', as: 'number'}
//   ]
// })

// component('doneTask', {
//   type: 'task',
//   params: [
//     {id: 'contextVer', as: 'number'},
//     {id: 'actualDuration', as: 'number'},
//     {id: 'actualItems', as: 'number'},
//     {id: 'tokens', as: 'number'},
//     {id: 'costPerItem', as: 'number'}
//   ],
// })

// extension('zui', 'tasks' , {
//     taskEstimatedDuration(task,ctx) {
//         const {modelId, noOfItems, details} = task
//         const model = jb.exec({ $$: `model<llm>${modelId}` })
//         if (!model)
//           return jb.logError(`model id ${modelId} is not defined as component`, { ctx })
//         const speed = model.speed[details]
//         return speed[0] * noOfItems + speed[1]
//     }
// })

// component('candidateTasks', {
//   params: [
//     { id: 'noOfItemsOptions', as: 'array', defaultValue: [1, 5, 30, 50] },
//     { id: 'detailsOptions', as: 'array', defaultValue: ['icon', 'card'] },
//     { id: 'modelOptions', as: 'array', defaultValue: ['gpt_35_turbo_0125', 'o1_preview'] }
//   ],
//   impl: (ctx, noOfItemsOptions, detailsOptions, modelOptions) => {
//     let id = 0
//     return noOfItemsOptions.flatMap(noOfItems =>
//       detailsOptions.flatMap(details =>
//         modelOptions.flatMap(modelId => {
//           const model = jb.exec({ $$: `model<llm>${modelId}` })
//           if (!model) {
//             jb.logError(`model id ${modelId} is not defined as component`, { ctx })
//             return []
//           }
//           if (details === 'card' && noOfItems > model.maxCards) return []
//           const title = `${noOfItems} items from ${model.name} for ${details}`
//           const estimatedDuration = jb.zui.taskEstimatedDuration({noOfItems,details,modelId})
//           return [{ title, noOfItems, details, model, estimatedDuration, id: id++ }]
//         })
//       )
//     )
//   }
// })
