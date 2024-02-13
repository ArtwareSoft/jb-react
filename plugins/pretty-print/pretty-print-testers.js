component('PPPosOfPath', {
  type: 'test',
  macroByValue: true,
  params: [
    {id: 'profile', type: 'any'},
    {id: 'path', as: 'string'},
    {id: 'expectedPos', as: 'string'}
  ],
  impl: dataTest({
    calculate: ({},{},{profile}) => jb.utils.prettyPrintWithPositions(profile),
    expectedResult: ({data},{},{expectedPos,path}) => {
        const items = (jb.path(data,'actionMap') || []).filter(x=>x.action == path).map(x=>`${x.from},${x.to}`)
        let error = items.length ? '' : `path not found ${path}`
        error = error || (items.includes(expectedPos) ? '' : `pos ${items.join(';')}`)
        return error ? { testFailure: error } : true
    },
    includeTestRes: true
  })
})