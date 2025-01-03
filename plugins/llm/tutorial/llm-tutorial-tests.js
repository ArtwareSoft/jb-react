using('ui-testers')

component('tutorialSample', {
  passiveData: {
    title: 'query language',
    summary: '',
    components: [],
    training: [
      {
        prompt: `component('dataTest.join', { impl: dataTest(pipeline(list(1,2), '%%', join()), equals('1,2')) })`,
        completion: `This component tests the join function by joining the list [1, 2] with a comma separator, resulting in the string '1,2'.`
      },
      {
        prompt: `component('dataTest.slice', { impl: dataTest(pipeline(list(1,2,3), slice(0, 2), join()), equals('1,2')) })`,
        completion: `This component tests the slice function by slicing the list [1, 2, 3] from index 0 to 2 and then joining the resulting list with a comma separator, resulting in the string '1,2'.`
      },
      {
        prompt: `component('dataTest.toUpperCase', { impl: dataTest(pipeline('%$personWithChildren/children%', '%name%', toUpperCase(), join()), equals('BART,LISA,MAGGIE')) })`,
        completion: `This component tests the toUpperCase function by converting the names of Homer Simpson's children (Bart, Lisa, Maggie) to uppercase and then joining them with a comma separator, resulting in the string 'BART,LISA,MAGGIE'.`
      },
      {
        prompt: `component('dataTest.split', { impl: dataTest({ calculate: pipeline('one-two-free', split('-', { part: 'but first' }), join(',')), expectedResult: equals('two,free') }) })`,
        completion: `This component tests the split function by splitting the string 'one-two-free' using the '-' separator and removing the first element, then joining the remaining elements with a comma separator, resulting in the string 'two,free'.`
      },
      {
        prompt: `component('dataTest.selectAndFilter', { impl: dataTest({ calculate: pipeline('%$personWithChildren/children/name%', filter(contains('i')), join()), expectedResult: equals('Lisa,Maggie') }) })`,
        completion: `This component tests the filter and contains functions by selecting the names of Homer Simpson's children that contain the letter 'i' and joining them with a comma separator, resulting in the string 'Lisa,Maggie'.`
      },
      {
        prompt: `component('dataTest.join', { impl: dataTest(pipeline(list(1,2), join()), equals('1,2')) })`,
        completion: `This component tests the join function by joining the list [1, 2] with a comma separator, resulting in the string '1,2'.`
      },
      {
        prompt: `component('dataTest.slice', { impl: dataTest(pipeline(list(1,2,3), slice(0, 2), join()), equals('1,2')) })`,
        completion: `This component tests the slice function by slicing the list [1, 2, 3] from index 0 to 2 and then joining the resulting list with a comma separator, resulting in the string '1,2'.`
      },
      {
        prompt: `component('dataTest.splitAllFeatures', { impl: dataTest({ calculate: obj({ data: 'one-two-three-four', props: [ prop('original', '%%'), prop('splitAll', split('-')), prop('splitFirst', pipeline(split('-'), first())), prop('splitSecond', pipeline(split('-'), nth(1))), prop('splitLast', pipeline(split('-'), last())), prop('splitButFirst', pipeline(split('-'), slice({start: 1}), join(','))), prop('splitButLast', pipeline(split('-'), slice({end: -1}), join(','))) ] }), expectedResult: equals(obj( prop('original', 'one-two-three-four'), prop('splitAll', 'one,two,three,four'), prop('splitFirst', 'one'), prop('splitSecond', 'two'), prop('splitLast', 'four'), prop('splitButFirst', 'two,three,four'), prop('splitButLast', 'one,two,three') )) }) })`,
        completion: 'This test demonstrates the use of the split function with various parameters, including splitting a string into an array, extracting specific elements, and joining the resulting arrays into strings.'
      },
      {
        prompt: `component('dataTest.splitExample', { impl: dataTest({ calculate: split({ data: 'apple,banana,orange', separator: ',' }), expectedResult: equals(['apple', 'banana', 'orange']) }) })`,
        completion: 'This test demonstrates the use of the split component to break a comma-separated string into an array of individual fruits.'
      },
      {
        prompt: `Explain the 'split' component in the query language.`,
        completion: `The 'split' component is used to break a string into an array of substrings using a specified separator. It has the following properties: 'separator' specifies the delimiter to split the string, 'text' is the input string to be split, and 'part' determines which part of the split array to return. Options for 'part' include 'all', 'first', 'second', 'last', 'but first', and 'but last'. For example, split({ data: 'apple,banana,orange', separator: ',' }) will return ['apple', 'banana', 'orange'].`
      }
    ]
  }
})

component('llmTest.tutorialBuilder', {
  doNotRunInTests: true,
  impl: uiTest(tutorialBuilder('%$tutorialSample%'), contains('build'))
})

component('llmTest.enrichTutorialData', {
  doNotRunInTests: true,
  impl: dataTest(enrichTutorialData('%$tutorialSample%'), and(
    equals(pipeline('%features%', filter(equals('%id%', 'data<>pipeline')), '%usage/length%'), 7),
    equals({
      item1: pipeline('%features%', filter(equals('%id%', 'data<>split')), '%params/0/usage/length%'),
      item2: 2
    })
  ))
})

component('llmTest.enrichTrainingItem', {
  doNotRunInTests: true,
  impl: dataTest(enrichTrainingItem('%$tutorialSample/training/0%'))
})