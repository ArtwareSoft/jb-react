jb.component('people-array', { watchableData: { "people": [
  { "name": "Homer Simpson" ,"age": 42 , "male": true},
  { "name": "Marge Simpson" ,"age": 38 , "male": false},
  { "name": "Bart Simpson"  ,"age": 12 , "male": true}
  ]}
})

jb.component('suggestions-test.default-probe', { /* suggestionsTest.defaultProbe */
  type: 'control',
  impl: label(
    ''
  )
})

jb.component('suggestions-test.simple-vars', { /* suggestionsTest.simpleVars */
  impl: suggestionsTest({
    expression: '%',
    expectedResult: contains('$people')
  })
})

jb.component('suggestions-test.vars-filter', { /* suggestionsTest.varsFilter */
  impl: suggestionsTest({
    expression: '%$p',
    expectedResult: and(contains('$people'), not(contains('$win')))
  })
})

jb.component('suggestions-test.component', { /* suggestionsTest.component */
  impl: suggestionsTest({
    expression: '=pi',
    expectedResult: contains('pipeline')
  })
})

jb.component('suggestions-test.inside-array', { /* suggestionsTest.insideArray */
  impl: suggestionsTest({
    expression: '%$people-array/',
    expectedResult: and(contains('people'), not(contains('$people')))
  })
})

jb.component('suggestions-test.1', { /* suggestionsTest.1 */ 
  impl: suggestionsTest({
    expression: '%',
    expectedResult: contains('people')
  })
})