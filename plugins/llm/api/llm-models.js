dsl('llm')

extension('llm','main', {
  initExtension() {
    return { callHistory: [], totalCost: 0, noRedis: jb.frame.location && jb.frame.location.host.indexOf('localhost') == -1 }
  },
  notifyApiUsage(rec, ctx) {
    jb.llm.callHistory.push(rec)
    jb.llm.models = jb.llm.models || jb.llm.calcModels(ctx)
    const model = jb.llm.models.find(m=>m.name == rec.model) 
    if (!model)
      return jb.logError(`notifyApiUsage can not find model ${rec.model}`, {rec, models: jb.llm.models, ctx})
    const usage = rec.usage
    const [input,output] = model.price
    rec.model = model
    const cost = rec.cost = (input * usage.prompt_tokens + output * usage.completion_tokens) / 1000000
    jb.llm.totalCost += cost
    return { totalCost: jb.llm.totalCost, cost}
  },
  calcModels(ctx) {
    const profileIds = Object.keys(jb.comps).filter(k=>k.indexOf('model<llm>') == 0 && !k.match(/model$|byId$/))
    return profileIds.map(k=>({...ctx.run({$$: k}), id: k.split('>').pop()}))
  },
  async apiKey(_apiKey) {
    const settings = !jbHost.isNode && !jbHost.notInStudio && await fetch(`${jbHost.baseUrl}/?op=settings`).then(res=>res.json())
    const apiKey = _apiKey || localStorage.getItem('apiKey') || (jbHost.isNode ? process.env.OPENAI_API_KEY: settings.OPENAI_API_KEY)
    return apiKey
  }
})

component('model', {
  type: 'model',
  params: [
    {id: 'name', as: 'string'},
    {id: 'price', as: 'array', byName: true, description: 'input/output $/M tokens'},
    {id: 'maxRequestTokens', as: 'array', description: 'input/output K'},
    {id: 'speed', type: 'model_speed'},
    {id: 'maxContextLength', as: 'number', defaultValue: 4096},
    {id: 'reasoning', as: 'boolean', type: 'boolean<>'}
  ],
  impl: ctx => ({...ctx.params, _speed: 1/jb.path(ctx.params.speed,'icon.0'), _price: jb.path(ctx.params.price,'1') })
})

component('linear', {
  type: 'model_speed',
  params: [
    {id: 'icon', as: 'array', byName: true, description: 'estimated first item, estimated next item'},
    {id: 'card', as: 'array', byName: true, description: 'estimated first item, estimated next item'}
  ]
})

component('o1', {
  type: 'model',
  impl: model('o1-preview-2024-09-12', {
    price: [15, 60],
    maxRequestTokens: [200, 100],
    speed: linear({ icon: [16,0.5], card: [15,3] }),
    reasoning: true
  })
})

component('o1_mini', {
  type: 'model',
  impl: model('o1-mini-2024-09-12', {
    price: [3,12],
    maxRequestTokens: [128,65],
    speed: linear({ icon: [2,0.5], card: [5,3] }),
    reasoning: true
  })
})

component('gpt_35_turbo_0125', {
  type: 'model',
  impl: model('gpt-3.5-turbo-0125', {
    price: [0.5,1.5],
    maxRequestTokens: [4,4],
    speed: linear({ icon: [3,0.3], card: [3,1] })
  })
})

component('gpt_35_turbo_16k', {
  type: 'model',
  impl: model('gpt-3.5-turbo-16k-0613', {
    price: [3,4],
    maxRequestTokens: [16,16],
    speed: linear({ icon: [5,0.5], card: [5,1] })
  })
})

component('gpt_4o', {
  type: 'model',
  impl: model('gpt-4o-2024-08-06', {
    price: [2.5,10],
    maxRequestTokens: [128,16],
    speed: linear({ icon: [5,0.3], card: [3,2] })
  })
})

component('byId', {
  type: 'model',
  params: [
    {id: 'modelId', as: 'string'}
  ],
  impl: (ctx,id) => jb.exec({ $$: `model<llm>${id}` })
})
