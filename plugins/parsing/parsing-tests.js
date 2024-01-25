
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

component('textToBreak', { passiveData: 'l1-a1-b1-c1;l2-a2-b2-c2;l3-a3-b3-c3'})
component('textToBreak2', { passiveData: 'l1-a1-b1-c1;l2|a2|b2|c2;l3-a3-b3-c3'})

component('dataTest.stringWithSourceRef', {
  impl: dataTest(ctx => new jb.parsing.stringWithSourceRef(ctx,'textToBreak',6,8), '%% == b1')
})

component('dataTest.extractTextRepeating', {
  impl: dataTest({
    calculate: pipeline(extractText('%$textToParse%', { startMarkers: '#start', endMarker: '#end', repeating: true }), join()),
    expectedResult: '%% == first,second'
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
    expectedResult: ctx => ctx.data == '#start\nfirst,#start\nsecond'
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
    expectedResult: ctx => ctx.data == 'first\n#end,second\n#end'
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
    expectedResult: '%% == before,outside1,outside2'
  })
})

component('dataTest.extractTextRegex', {
  impl: dataTest({
    calculate: extractText('%$textToParse%', { startMarkers: '#s.*', endMarker: '#e.*', useRegex: true }),
    expectedResult: '%% == first'
  })
})

component('dataTest.breakText', {
  impl: dataTest({
    calculate: json.stringify(breakText('%$textToBreak%', { separators: [';','-'] })),
    expectedResult: '%% == [["l1","a1","b1","c1"],["l2","a2","b2","c2"],["l3","a3","b3","c3"]]'
  })
})

component('dataTest.breakTextRegex', {
  impl: dataTest({
    autoGen: true,
    calculate: json.stringify(
      breakText({text: '%$textToBreak2%', separators: [';', '-|\\|'], useRegex: true})
    ),
    expectedResult: '%% == [[\"l1\",\"a1\",\"b1\",\"c1\"],[\"l2\",\"a2\",\"b2\",\"c2\"],[\"l3\",\"a3\",\"b3\",\"c3\"]]'
  })
})

component('dataTest.zipArrays', {
  impl: dataTest({
    calculate: zipArrays(ctx => [[1,2],[10,20],[100,200]]),
    expectedResult: ({data}) => JSON.stringify(data) == JSON.stringify([[1,10,100],[2,20,200]])
  })
})

