
component('probeResOverlay', {
  type: 'overlay<>',
  params: [
    {id: 'id', as: 'string'},
    {id: 'baseStyle', as: 'object', description: 'for style.after'},
    {id: 'tgpPathToStyle', dynamic: true}
  ],
  impl: typeAdapter('data<>', pipeline(
    Var('id', '%$id%'),
    Var('compId', '%$compProps/compId%'),
    Var('actionMap', '%$compProps/actionMap%'),
    Var('cssClassDefs', list(
      obj(prop('clz', 'overlay-%$id%-base'), prop('style', '%$baseStyle%')),
      pipeline(
        '%$actionMap%',
        filter(contains('Name!', { allText: '%action%' })),
        pipeline(
          Var('path', split('!', { text: '%action%', part: 'last' })),
          Var('pathClass', ({},{path}) => path.replace(/[<>]/g,'_').replace(/[~\.<>]/g,'-').replace(/-[-]+/g,'-')),
          Var('clz', 'overlay-%$id%-%$pathClass%'),
          Var('style', '%$tgpPathToStyle()%'),
          Var('pos', tgpTextEditor.offsetToLineCol('%from%', { compText: '%$compProps/compText%' })),
          Var('line', '%$pos/line%'),
          Var('col', '%$pos/col%'),
          objFromVars('clz','style','line','col')
        )
      )
    )),
    Var('compTextHash', tgpTextEditor.hash('%$compProps/text%')),
    Var('fromLine', '%$compProps/compLine%'),
    Var('toLine', plus('%$fromLine%', pipeline('%$compProps/text%', split('\n'), count()))),
    objFromVars('id','compId','cssClassDefs','compTextHash','fromLine','toLine'),
    log('overlay result')
  ))
})

component('probeVisitCount', {
  type: 'overlay<>',
  impl: probeResOverlay({
    id: 'visitCount',
    baseStyle: asIs({ after: {
        position: 'absolute',
        bottom: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        borderRadius: '50%',
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center',
        fontSize: '12px'
    }}),
    tgpPathToStyle: obj(prop('after', obj(prop('content', property({ prop: '%$path%', ofObj: '%$probeResult/visits%' })))))
  })
})
