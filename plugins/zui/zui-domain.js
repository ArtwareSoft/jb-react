dsl('zui')

component('userData', {
  type: 'user_data',
  params: [
    {id: 'query', as: 'string', byName: true},
    {id: 'contextChips', type: 'data[]', as: 'array', defaultValue: []},
    {id: 'preferedLlmModel', as: 'string'},
    {id: 'detailsLevel', as: 'number', defaultValue: 1},
  ]
})

component('appData', {
  type: 'app_data',
  params: [
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: [], byName: true},
    {id: 'ctxVer', as : 'number', defaultValue: 1},
    {id: 'runningTasks', type: 'task[]' },
    {id: 'doneTasks', type: 'task[]' },
    {id: 'budget', type: 'budget'},
    {id: 'usage', type: 'usage'}
  ]
})

component('domain', {
  type: 'domain',
  params: [
    {id: 'title', as: 'string'},
    {id: 'itemsPrompt', as: 'string', dynamic: true, byName: true, newLinesInCode: true},
    {id: 'iconPromptProps', type: 'prompt_props', byName: true},
    {id: 'cardPromptProps', type: 'prompt_props'},
    {id: 'contextHintsPrompt', as: 'string', dynamic: true, byName: true, newLinesInCode: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true},
    {id: 'iconBox', type: 'iconBox-style', dynamic: true},
    {id: 'card', type: 'card-style', dynamic: true},
    {id: 'cardWithIconData', type: 'card-style', dynamic: true},
    {id: 'minGridSize', as: 'array', type: 'data<>[]', defaultValue: [6,6]},
    {id: 'sample', type: 'domain_sample'}
  ]
})

component('props', {
  type: 'prompt_props',
  params: [
    {id: 'description', as: 'string', newLinesInCode: true},
    {id: 'sample', as: 'string', newLinesInCode: true}
  ]
})

component('sample', {
  type: 'domain_sample',
  params: [
    {id: 'items', dynamic: true, byName: true},
    {id: 'query', as: 'string'},
    {id: 'contextChips', type: 'data[]', as: 'array', defaultValue: []},
    {id: 'suggestedContextChips', type: 'data[]', defaultValue: []},
    {id: 'preferedLlmModel', as: 'string', options: 'gpt_35_turbo_0125,gpt_4o,o1_mini,o1_preview'}
  ]
})

component('domain.itemsPromptForTask', {
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'task', type: 'task'}
  ],
  impl: (ctx, domain, task) => {
    const {sample, iconPromptProps,cardPromptProps,itemsPrompt, contextHintsPrompt} = domain
    const {userData, appData} = ctx.vars
    const ctxToUse = ctx.vars.testID ? ctx.setVars({task, userData: userData || sample, appData: appData || sample}) : ctx.setVars({task})
    if (task.details == 'contextHints')
      return contextHintsPrompt(ctxToUse)

    const [propsInDescription, propsInSample] = 
      task.details == 'card' ? [`${iconPromptProps.description}\n${cardPromptProps.description}`, `${iconPromptProps.sample},\n${cardPromptProps.sample}`] 
      : task.details == 'icon' ? [iconPromptProps.description, iconPromptProps.sample] : ['','']; 
    return itemsPrompt(ctxToUse.setVars({propsInDescription, propsInSample}))
  }
})

component('domain.itemsSource', {
  type: 'rx<>',
  moreTypes: 'data<>',
  params: [
    {id: 'domain', type: 'domain'},
    {id: 'task', type: 'task'}
  ],
  impl: rx.pipe(
    source.llmCompletions(user(domain.itemsPromptForTask('%$domain%', '%$task%')), {
      llmModel: '%$task/model%',
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
  impl: ctx => jb.zui.ctrl(ctx, {$: 'iconBoxFeatures'})
})

component('iconBoxFeatures', {
  type: 'feature',
  impl: features(
    frontEnd.var('fontSizeMap', () => ({
      16: { title: 8, description: 8 },
      32: { title: 10, description: 8 },
      64: { title: 10, description: 10 },
      128: { title: 12, description: 10 },
    })),
    zoomingGridElem(1)
  )
})

component('card', {
  type: 'control',
  params: [
    {id: 'style', type: 'card-style', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx, {$: 'cardFeatures'})
})

component('cardFeatures', {
  type: 'feature',
  impl: features(
    zoomingGridElem(2),
    frontEnd.var('fontSizeMap', () => ({
      64: { title: 12, description: 10 },
      128: { title: 12, description: 10 },
      256: { title: 12, description: 12 },
      320: { title: 14, description: 12 },
    }))
  )
})

component('cardWithIconDataFeatures', {
  type: 'feature',
  impl: features(
    zoomingGridElem(1.5),
    frontEnd.var('fontSizeMap', () => ({
      64: { title: 12, description: 10 },
      128: { title: 12, description: 10 },
      256: { title: 12, description: 12 },
      320: { title: 14, description: 12 },
    }))
  )
})