using('testing','parsing')

component('dataTest.splitByPivot', {
  impl: dataTest({
    calculate: pipeline(
      asIs([
          {name: 'Alice', email: 'alice@example.org'},
          {name: 'Bob', email: 'bob@example.org'},
          {name: 'Charlie', email: 'charlie@example.net'}
      ]),
      prop('domain', extractSuffix('@', { text: '%email%' })),
      splitByPivot('domain'),
      groupProps(count(), join('name', { as: 'names' }), prop('customNames', join({ itemText: '-%name%-' }))),
      removeProps('items')
    ),
    expectedResult: equals(asIs([
        {domain: 'example.org', count: 2, names: 'Alice,Bob', customNames: '-Alice-,-Bob-'},
        {domain: 'example.net', count: 1, names: 'Charlie', customNames: '-Charlie-'}
    ]))
  })
})

component('dataTest.groupBy', {
  impl: dataTest({
    calculate: pipeline(
      asIs([
          {name: 'Alice', email: 'alice@example.org'},
          {name: 'Bob', email: 'bob@example.org'},
          {name: 'Charlie', email: 'charlie@example.net'}
      ]),
      groupBy('domain', {
        calcPivot: extractSuffix('@', { text: '%email%' }),
        aggregate: [
          count(),
          join('name', { as: 'names' }),
          prop('customNames', join({ itemText: '-%name%-' }))
        ]
      })
    ),
    expectedResult: equals(asIs([
        {domain: 'example.org', count: 2, names: 'Alice,Bob', customNames: '-Alice-,-Bob-'},
        {domain: 'example.net', count: 1, names: 'Charlie', customNames: '-Charlie-'}
    ]))
  })
})

component('dataTest.actionMapSplit', {
  impl: dataTest({
    calculate: pipeline(
      asIs([
          {from: 68, to: 68, action: 'beginName!test<>langServerTest.join~impl'},
          {from: 77, to: 77, action: 'endName!test<>langServerTest.join~impl'},
          {from: 77, to: 77, action: 'beginName!test<>langServerTest.join~impl~calculate'},
          {from: 86, to: 86, action: 'endName!test<>langServerTest.join~impl~calculate'}
      ]),
      groupBy('path', {
        calcPivot: extractSuffix('!', { text: '%action%' }),
        aggregate: [
          min('from', { as: 'from' }),
          max('from', { as: 'to' })
        ]
      })
    ),
    expectedResult: equals(asIs([
        {path: 'test<>langServerTest.join~impl', from: 68, to: 77},
        {path: 'test<>langServerTest.join~impl~calculate', from: 77, to: 86}
    ]))
  })
})
