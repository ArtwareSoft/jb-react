component('textToBreak', { passiveData: 'l1-a1-b1-c1;l2-a2-b2-c2;l3-a3-b3-c3'})
component('textToBreak2', { passiveData: 'l1-a1-b1-c1;l2|a2|b2|c2;l3-a3-b3-c3'})

component('textToParse', {
  passiveData:`
before
#start
first
#end
outside1
#start
second
#end
outside2
`
})

component('dataTest.extractTextRepeating', {
  impl: dataTest({
    calculate: pipeline(extractText('%$textToParse%', { startMarkers: '#start', endMarker: '#end', repeating: true }), join()),
    expectedResult: equals('first,second')
  })
})

component('dataTest.extractTextIncludingStartMarker', {
  impl: dataTest({
    calculate: pipeline(
      extractText('%$textToParse%', {
        startMarkers: '#start',
        endMarker: '#end',
        includingStartMarker: true,
        repeating: true
      }),
      join()
    ),
    expectedResult: equals(`#start
first,#start
second`)
  })
})

component('dataTest.extractTextIncludingEndMarker', {
  impl: dataTest({
    calculate: pipeline(
      extractText('%$textToParse%', {
        startMarkers: '#start',
        endMarker: '#end',
        includingEndMarker: true,
        repeating: true
      }),
      join()
    ),
    expectedResult: equals(`first
#end,second
#end`)
  })
})

component('dataTest.extractTextExclude', {
  impl: dataTest({
    calculate: pipeline(
      extractText('%$textToParse%', {
        startMarkers: '#start',
        endMarker: '#end',
        includingStartMarker: true,
        includingEndMarker: true,
        repeating: true,
        exclude: true
      }),
      join()
    ),
    expectedResult: equals('before,outside1,outside2')
  })
})

component('dataTest.extractTextRegex', {
  impl: dataTest({
    calculate: extractText('%$textToParse%', { startMarkers: '#s.*', endMarker: '#e.*', useRegex: true }),
    expectedResult: equals('first')
  })
})

component('dataTest.breakText', {
  impl: dataTest({
    calculate: json.stringify(breakText('%$textToBreak%', { separators: [';','-'] })),
    expectedResult: equals('[["l1","a1","b1","c1"],["l2","a2","b2","c2"],["l3","a3","b3","c3"]]')
  })
})

component('dataTest.breakTextRegex', {
  impl: dataTest({
    calculate: json.stringify(breakText('%$textToBreak2%', { separators: [';','-|\\|'], useRegex: true })),
    expectedResult: equals('[["l1","a1","b1","c1"],["l2","a2","b2","c2"],["l3","a3","b3","c3"]]')
  })
})

component('dataTest.zipArrays', {
  impl: dataTest({
    calculate: json.stringify(zipArrays(() => [[1,2],[10,20],[100,200]])),
    expectedResult: equals('[[1,10,100],[2,20,200]]')
  })
})

