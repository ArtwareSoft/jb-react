component('PPPosOfPath', {
  type: 'test',
  macroByValue: true,
  params: [
    {id: 'profile', type: 'any'},
    {id: 'expectedType', as: 'string'},
    {id: 'path', as: 'string'},
    {id: 'expectedPos', as: 'string'}
  ],
  impl: dataTest({
    calculate: ({},{},{profile, expectedType}) => jb.utils.prettyPrintWithPositions(jb.utils.resolveProfile(profile, {expectedType})),
    expectedResult: ({data},{},{expectedPos,path}) => {
        const items = (jb.path(data,'actionMap') || []).filter(x=>x.action == path).map(x=>`${x.from},${x.to}`)
        let error = items.length ? '' : `path not found ${path}`
        error = error || (items.includes(expectedPos) ? '' : `pos ${items.join(';')} instead of ${expectedPos}`)
        return error ? { testFailure: error } : true
    },
    includeTestRes: true
  })
})