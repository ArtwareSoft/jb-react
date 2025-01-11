dsl('zui')

component('baseTask', {
  type: 'task',
  params: [
    {id: 'id', as: 'number'},
    {id: 'title', as: 'string'},
    {id: 'noOfItems', as: 'number', options: '1,5,30'},
    {id: 'details', as: 'string', options: 'icon,card'},
    {id: 'modelId', as: 'string', options: 'gpt_35_turbo_0125,gpt_4o,o1_mini,o1_preview'}
  ]
})

component('runningTask', {
  type: 'task',
  params: [
    {id: 'startTime', as: 'number'},
    {id: 'llmModel', as: 'string'},
    {id: 'llmPrompt', as: 'string'},
    {id: 'estimatedDuration', as: 'number'}
  ]
})

component('doneTask', {
  type: 'task',
  params: [
    {id: 'contextVer', as: 'number'},
    {id: 'actualDuration', as: 'number'},
    {id: 'actualItems', as: 'number'},
    {id: 'tokens', as: 'number'},
    {id: 'costPerItem', as: 'number'}
  ],
})

extension('zui', 'tasks' , {
    FE_calcState(ctx) {
        // const items = [{ pos, iconQuality, cardQuality, ctxVer, firstShow, relevance, userTime}]
        // const timeStep
        // const runningTasks
    },
    async runTask(task,ctx) {

    },
    taskEstimatedDuration(task,ctx) {
        const {modelId, noOfItems, details} = task
        const model = jb.exec({ $$: `model<llm>${modelId}` })
        if (!model)
          return jb.logError(`model id ${modelId} is not defined as component`, { ctx })
        const speed = model.speed[details]
        return speed[0] * noOfItems + speed[1]
    }
})

component('candidateTasks', {
  params: [
    { id: 'noOfItemsOptions', as: 'array', defaultValue: [1, 5, 30, 50] },
    { id: 'detailsOptions', as: 'array', defaultValue: ['icon', 'card'] },
    { id: 'modelOptions', as: 'array', defaultValue: ['gpt_35_turbo_0125', 'o1_preview'] }
  ],
  impl: (ctx, noOfItemsOptions, detailsOptions, modelOptions) => {
    let id = 0
    return noOfItemsOptions.flatMap(noOfItems =>
      detailsOptions.flatMap(details =>
        modelOptions.flatMap(modelId => {
          const model = jb.exec({ $$: `model<llm>${modelId}` })
          if (!model) {
            jb.logError(`model id ${modelId} is not defined as component`, { ctx })
            return []
          }
          if (details === 'card' && noOfItems > model.maxCards) return []
          const title = `${noOfItems} items from ${model.name} for ${details}`
          const estimatedDuration = jb.zui.taskEstimatedDuration({noOfItems,details,modelId})
          return [{ title, noOfItems, details, model, estimatedDuration, id: id++ }]
        })
      )
    )
  }
})
