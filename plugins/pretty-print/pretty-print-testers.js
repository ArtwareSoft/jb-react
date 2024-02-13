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
        const item = (jb.path(data,'actionMap') || []).find(x=>x.action == path)
        let error = item ? '' : `path not found ${path}`
        const _item = item || {}
        const actualPos = `${_item.from},${_item.to}`
        error = error || (actualPos != expectedPos ? `pos ${actualPos}` : '')
        return error ? { testFailure: error } : true
    },
    includeTestRes: true
  })
})