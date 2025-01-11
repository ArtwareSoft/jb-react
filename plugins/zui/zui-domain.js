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
    {id: 'iconBox', type: 'iconBox-style', dynamic: true},
    {id: 'card', type: 'card-style', dynamic: true},
    {id: 'zuiControl', type: 'control', dynamic: true, defaultValue: firstToFit(card('%$domain/card()%'), iconBox('%$domain/iconBox()%'))},
    {id: 'sample', type: 'domain_sample'}
  ]
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
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: [], byName: true}
  ]
})

component('domain.itemsPromptForTask', {
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'task', type: 'task'}
  ],
  impl: (ctx, domain, task) => {
    const {sample, iconProps,cardProps,itemsPrompt, contextHintsPrompt} = domain
    const {userData, appData} = ctx.vars
    const ctxToUse = ctx.vars.testID ? ctx.setVars({task, userData: userData || sample, appData: appData || sample}) : ctx.setVars({task})
    if (task.details == 'contextHints')
      return contextHintsPrompt(ctxToUse)

    const [propsInDescription, propsInSample] = 
      task.details == 'card' ? [`${iconProps.description}\n${cardProps.description}`, `${iconProps.sample},\n${cardProps.sample}`] 
      : task.details == 'icon' ? [iconProps.description, iconProps.sample] : ['','']; 
    return itemsPrompt(ctxToUse.setVars({propsInDescription, propsInSample}))
  }
})

component('domain.itemsSource', {
  type: 'rx<>',
  moreTypes: 'data<>,action<>',
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'task', type: 'task'}
  ],
  impl: rx.pipe(
    source.llmCompletions(user(domain.itemsPromptForTask('%$domain%', '%$task%')), {
      llmModel: byId('%$task/modelId%'),
      useRedisCache: true
    }),
    llm.textToJsonItems()
  )
})

component('iconBox', {
  type: 'control',
  params: [
    {id: 'style', type: 'iconBox-style', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('card', {
  type: 'control',
  params: [
    {id: 'style', type: 'card-style', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})