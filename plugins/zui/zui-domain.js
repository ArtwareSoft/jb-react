dsl('zui')

component('userData', {
  type: 'user_data',
  params: [
    {id: 'query', as: 'string', byName: true},
    {id: 'contextChips', type: 'data[]', as: 'array', defaultValue: []},
  ]
})

component('appData', {
  type: 'app_data',
  params: [
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: [], byName: true},
    {id: 'ctxVer', as : 'number', defaultValue: 1},
    {id: 'tasks', type: 'task[]', defaultValue: () => jb.zui.createTasks()},
    {id: 'budget', type: 'budget'},
    {id: 'usage', type: 'usage'}
  ]
})

component('domain', {
  type: 'domain',
  params: [
    {id: 'title', as: 'string'},
    {id: 'iconProps', type: 'domain_props', byName: true},
    {id: 'cardProps', type: 'domain_props'},
    {id: 'itemsPrompt', as: 'string', dynamic: true, byName: true, newLinesInCode: true},
    {id: 'contextHintsPrompt', as: 'string', dynamic: true, byName: true, newLinesInCode: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true},
    {id: 'zuiControl', type: 'control', dynamic: true},
    {id: 'sample', type: 'domain_sample'},
  ],
  impl: ctx => ({...ctx.params, 
    itemsPromptForTask(ctx2) {
      const {sample, iconProps,cardProps,itemsPrompt, contextHintsPrompt} = ctx.params
      const task = ctx2.data
      const ctxToUse = ctx.vars.testID ? ctx2.setVars({task, userData: sample, appData: sample}) : ctx.setVars({task})
      if (task.details == 'contextHints')
        return contextHintsPrompt(ctxToUse)

      const [propsInDescription, propsInSample] = 
        task.details == 'card' ? [`${iconProps.description}\n${cardProps.description}`, `${iconProps.sample},\n${cardProps.sample}`] 
        : task.details == 'icon' ? [iconProps.description, iconProps.sample] : ['','']; 
      return itemsPrompt(ctxToUse.setVars({propsInDescription, propsInSample}))
    }
  })
})

component('props', {
  type: 'domain_props',
  params: [
    {id: 'description', as: 'string', newLinesInCode: true},
    {id: 'sample', as: 'string', newLinesInCode: true}
  ]
})

component('sample', {
  type: 'domain_sample',
  params: [
    {id: 'items', dynamic: true},
    {id: 'query', as: 'string'},
    {id: 'contextChips', type: 'data[]', as: 'array', defaultValue: []},
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: [], byName: true},
  ]
})

component('domain.calcItems', {
  impl: pipe(
    llmViaApi.completions(user('%$domain.itemsPrompt()%'), {
      llmModel: model('%$userData/preferedLlmModel%'),
      maxTokens: 25000,
      includeSystemMessages: true,
      useRedisCache: true
    }),
    zui.parseLlmItems('%choices.0.message.content%'),
    extendWithObj(obj(
      prop('creationCtxVer', '%$appData/ctxVer%'),
      prop('creationModel', '%$userData/preferedLlmModel%')
    ))
  ),
  circuit: 'zuiTest.healthCare.app'
})

