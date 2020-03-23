jb.component('peopleArray', {
  watchableData: {
    people: [
      {name: 'Homer Simpson', age: 42, male: true},
      {name: 'Marge Simpson', age: 38, male: false},
      {name: 'Bart Simpson', age: 12, male: true}
    ]
  }
})

jb.component('suggestionsTest.defaultProbe', {
  type: 'control',
  impl: text(
    ''
  )
})

jb.component('suggestionsTest.simpleVars', {
  impl: suggestionsTest({
    expression: '%',
    expectedResult: contains('$people')
  })
})

jb.component('suggestionsTest.varsFilter', {
  impl: suggestionsTest({
    expression: '%$p',
    expectedResult: and(contains('$people'), not(contains('$win')))
  })
})

jb.component('suggestionsTest.component', {
  impl: suggestionsTest({
    expression: '=pi',
    expectedResult: contains('pipeline')
  })
})

jb.component('suggestionsTest.insideArray', {
  impl: suggestionsTest({
    expression: '%$peopleArray/',
    expectedResult: and(contains('people'), not(contains('$people')))
  })
})

jb.component('suggestionsTest.1', {
  impl: suggestionsTest({
    expression: '%',
    expectedResult: contains('people')
  })
})
