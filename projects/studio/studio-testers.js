jb.component('jbEditorChildrenTest', {
  type: 'test',
  params: [
    {id: 'path', as: 'string'},
    {id: 'childrenType', as: 'string', type: ',jb-editor'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'}
  ],
  impl: dataTest({
    calculate: ctx => {
      const params = ctx.cmpCtx.params
      const mdl = new jb.studio.jbEditorTree('')
      const titles = mdl.children(params.path).map(path=>mdl.title(path,true))
      const texts = titles.flatMap(x=> typeof x == 'string' ? x : x.querySelectorAll('[$text]').map(el=>el.$text))
      return JSON.stringify(texts)
    },
    expectedResult: call('expectedResult')
  })
})
