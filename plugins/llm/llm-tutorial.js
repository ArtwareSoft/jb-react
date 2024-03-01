using('pretty-print','ui')
dsl('llm')

extension('llmTutorial', 'main', {
  initExtension() { return { tgpModels: {} }},
  typeRules: [
    {same: ['data<>', 'data<llm>'] },
    {same: ['control<>', 'control<llm>'] },
  ],
  fake() {}
})

component('enrichTutorialData', {
  type: 'data',
  params: [
    {id: 'tutorialData', defaultValue: '%%'}
  ],
  impl: pipeline(
    Var('training', enrichTrainingItem('%$tutorialData/training%')),
    Var('features', featuresUsage('%$training%', features())),
    extend(prop('features', '%$features%'), prop('training', '%$training%'), {
      obj: '%$tutorialData%'
    }),
    first()
  )
})

component('enrichTrainingItem', {
  type: 'data',
  params: [
    {id: 'item', defaultValue: '%%'}
  ],
  impl: pipeline('%$item%', merge(parseCode(), '%%'))
})

component('parseCode', {
  type: 'data',
  params: [
    {id: 'item', defaultValue: '%%'}
  ],
  impl: (ctx, item) => {
    const code = item.prompt.trim()
    if (!code.match(/^compon/) || !code.match(/}\)/)) return {isCode:false}

    const plugin = (ctx.vars.plugin || 'common') + '-tests'
    //const plugins = [pluginId,'testing']
    const fileDsl = ''
    const tgpModel = jb.llmTutorial.tgpModels[plugin] = new jb.langService.tgpModelForLangService(jb.tgp.tgpModelData({plugin}))
    const { comp, compId, err } = jb.tgpTextEditor.evalProfileDef('x', code, plugin,fileDsl,tgpModel)
    if (err) return {idCode: false , err}
    const formatted = jb.utils.prettyPrintComp(compId,comp)
    return {comp, compId, formatted, isCode: true}
    // for loader - jb.llmTutorial.fake(
    // { $: 'test<>dataTest' }
  }
})

component('featuresUsage', {
  type: 'data',
  params: [
    {id: 'trainingItems'},
    {id: 'features'}
  ],
  impl: (ctx, trainingItems, features) => {
    trainingItems.forEach((x,index)=> x.isCode && calc(x.comp.impl,index))
    return features

    function calc(comp,sampleIndex) {
      if (Array.isArray(comp))
        return comp.forEach(child=>calc(child,sampleIndex))
      const id = comp.$$
      const compFeature = features[id]
      if (compFeature) {
        compFeature.usage.push({sampleIndex,val: comp})
        Object.keys(comp).forEach(propId=>
          compFeature.params.filter(p=>p.id==propId).forEach(paramFeature=> paramFeature.usage.push({sampleIndex, val: comp[propId]})))
      }
      Object.values(comp).forEach(child=>calc(child,sampleIndex))
    }
  }
})

component('features', {
  type: 'data',
  impl: (ctx) => {
    const plugin = (ctx.vars.plugin || 'common')

		const comps = jb.entries(jb.comps)
      .filter(([id]) => !id.match(/any<>/) && !id.match(/math\./))
			.filter(([k,comp]) => comp.$plugin == plugin).map(([id]) => [id, { id, usage: [], params: calcParams(id)}])

    return jb.objFromEntries(comps)
    function calcParams(id) {
//      if (id=='data<>split') debugger
      return (jb.comps[id].params || []).map(p=>({ id: p.id, usage: []}))
    }
  }
})

component('visualFeaturesTree2', {
  type: 'data',
  params: [
    {id: 'features'}
  ],
  impl: pipeline('%$features%', entries())
})

// , obj(prop('id', split('<>', { part: 'last' })))
//       prop('val', objFromEntries(pipeline('%params%', obj(prop('id', '%id%'), prop('usage', '%usage/length%')))), {$disabled: true}),

component('visualFeaturesTree2', {
  type: 'data',
  params: [
    { id: 'features' }
  ],
  impl: (ctx, features) => jb.objFromEntries(Object.entries(features).map(([k,f])=> [
      [k.split('>').pop(),`(${f.usage.length})`].join(' '),
      jb.objFromEntries(f.params.map(p=>[[p.id,`(${p.usage.length})`].join(' '), {}]))
    ]))
})

component('visualFeaturesTree', {
  type: 'data',
  params: [
    {id: 'features'}
  ],
  impl: objFromProperties(
    pipeline(
      properties('%$features%'),
      obj(
        prop('id', join(' ', { items: list(split('>', { text: '%id%', part: 'last' }), '(%val.usage.length%)') })),
        prop('val', objFromProperties(
          pipeline(
            '%val.params%',
            obj(prop('id', join(' ', { items: list('%id%','(%usage.length%)') })), prop('val', obj()))
          )
        ))
      )
    )
  )
})

component('tutorialBuilder', {
  type: 'control',
  params: [
    {id: 'tutorialData'}
  ],
  impl: group({
    controls: [
      text('%title%', '', { style: header.h2() }),
      group({
        controls: [
          tree('fTree', tree.jsonReadOnly(visualFeaturesTree('%features%')), { features: [tree.selection(), tree.keyboardSelection(), tree.noHead()] }),
          table('features', {
            items: '%features%',
            controls: [
              text('%$index%', 'index'),
              text(split('<', { text: '%id%', part: 'first' }), 'type'),
              text(split('>', { text: '%id%', part: 'last' }), 'comp'),
              text('%usage/length%', 'usage')
            ],
            features: [
              itemlist.selection(),
              itemlist.keyboardSelection(),
              css('>table>tbody>tr>td{ vertical-align: top }'),
              css.width(500)
            ]
          }),
          table('training', {
            items: '%training%',
            controls: [
              text('%$index%'),
              text(firstSucceeding('%formatted%','%prompt%'), 'prompt', {
                style: text.codemirror({ height: '80', lineWrapping: true, mode: 'javascript' }),
                features: css.width('1000', { minMax: 'max' })
              }),
              text(firstSucceeding('%err%',''), '', { features: css.color('var(--jb-error-fg)') }),
              text('%completion%', 'completion')
            ],
            features: css('>table>tbody>tr>td{ vertical-align: top }')
          }),
          group({ title: 'models' })
        ],
        title: '',
        style: group.tabs()
      })
    ],
    features: group.data(enrichTutorialData('%$tutorialData%'))
  }),
  require: 'jb.llmTutorial.fake('
})

