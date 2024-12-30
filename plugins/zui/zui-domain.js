dsl('zui')

component('userData', {
  type: 'user_data',
  params: [
    {id: 'query', as: 'string'},
    {id: 'contextChips', type: 'data[]', as: 'array', defaultValue: []},
    {id: 'preferedLlmModel', as: 'string', defaultValue: 'gpt-3.5-turbo-0125'},
  ]
})

component('appData', {
  type: 'app_data',
  params: [
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: []},
    {id: 'ctxVer', as : 'number', defaultValue: 1},
    {id: 'runningTasks', type: 'task[]', defaultValue: []},
    {id: 'doneTasks', type: 'done_task[]', defaultValue: []},
    {id: 'budget', type: 'budget'},
    {id: 'usage', type: 'usage'}
  ]
})

component('sampleUserData', {
  type: 'user_data',
  impl: userData('age 40, dizziness, stomach ache', ['Balance issues','pain or discomfort'])
})

component('sampleAppData', {
  type: 'app_data',
  impl: appData({
    suggestedContextChips: ['Low blood pressure (Hypotension)','High blood pressure (Hypertension)','Rapid or irregular heartbeat (Arrhythmia)'],
    runningTasks: llmSampleTask('50 items', '50', { llmModel: 'o1', llmPrompt: 'prmopt', estimatedItems: '50' })
  })
})

component('domain', {
  type: 'domain',
  params: [
    {id: 'title', as: 'string'},
    {id: 'itemsPromptPrefix', as: 'string', byName: true},
    {id: 'iconBoxPropsPrompt', as: 'string'},
    {id: 'cardPropsPrompt', as: 'string'},
    {id: 'docPropsPrompt', as: 'string'},
    {id: 'contextChips', type: 'data[]', as: 'array'},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true},
    {id: 'zuiControl', type: 'control', dynamic: true},
    {id: 'calcItems', dynamic: true}
  ]
})

component('llmSampleTask', {
  type: 'task',
  params: [
    {id: 'title', as: 'string'},
    {id: 'estimatedDuration', as: 'number'},
    {id: 'llmModel', as: 'string'},
    {id: 'llmPrompt', as: 'string'},
    {id: 'estimatedItems', as: 'number'},
    {id: 'actualItems', as: 'number'},
    {id: 'tokens', as: 'number'},
    {id: 'costPerItem', as: 'number'}
  ],
  impl: ctx => ({ ...ctx.params, 
        startTime: new Date().getTime(),
        duration() { return this.done ? this.duration : (new Date().getTime() - this.startTime) / 1000 },
    })
})