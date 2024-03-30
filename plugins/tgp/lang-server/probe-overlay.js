
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
      obj(prop('base', true), prop('clz', 'overlay-%$id%-base'), prop('style', '%$baseStyle%')),
      pipeline(
        '%$actionMap%',
        filter(contains('Token!', { allText: '%action%' })),
        groupBy('path', {
          calcPivot: extractSuffix('!', { text: '%action%' }),
          aggregate: [
            min('from', { as: 'fromOffset' }),
            max('from', { as: 'toOffset' })
          ]
        }),
        prop('pathClass', ({data}) => data.path.replace(/[<>]/g,'_').replace(/[~\.<>]/g,'-').replace(/-[-]+/g,'-')),
        prop('clz', 'overlay-%$id%-%pathClass%'),
        prop('style', '%$tgpPathToStyle()%'),
        prop('fromPos', tgpTextEditor.offsetToLineCol('%fromOffset%', { compText: '%$compProps/compText%' })),
        prop('line', '%fromPos/line%'),
        prop('fromCol', '%fromPos/col%'),
        prop('toPos', tgpTextEditor.offsetToLineCol('%toOffset%', { compText: '%$compProps/compText%' })),
        prop('toCol', '%toPos/col%'),
        selectProps('clz','style','line','fromCol','toCol')
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
  impl: probeResOverlay('visitCount', asIs({}), {
    tgpPathToStyle: obj(
      prop('textDecoration', pipeline(
        property('%path%', '%$probeResult/visits%'),
        Switch({
          cases: [
            Case(equals(0), 'underline pink'),
            Case(equals(1), 'underline green'),
            Case(equals(2), 'double underline green')
          ],
          default: 'wavy underline green'
        })
      ))
    )
  })
})

component('probeVisitCount2', {
  type: 'overlay<>',
  impl: probeResOverlay({
    id: 'visitCount',
    baseStyle: asIs({
        after: {
          opacity: 0.5,
          position: 'absolute',
          bottom: '-15px',
          transform: 'translateX(-135%)',
          width: '20px',
          height: '20px',
          lineHeight: '20px',
          borderRadius: '50%',
          backgroundColor: 'green',
          color: 'white',
          textAlign: 'center',
          fontSize: '12px'
        }
    }),
    tgpPathToStyle: obj(
      prop('after', obj(prop('content', pipeline(property('%path%', '%$probeResult/visits%'), '"%%"', first()))))
    )
  })
})
