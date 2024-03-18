component('picklistTest.sioptionsByCommample', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London')
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
  })
})

component('picklistTest.rxOptions', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: typeAdapter('rx<>', source.data(obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))))),
          features: picklist.allowAsynchOptions()
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('picklistTest.delayedOptions.StyleByControlBug', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: typeAdapter('rx<>', source.data(obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London')))))),
      style: picklist.labelList(),
      features: picklist.allowAsynchOptions()
    }),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('picklistTest.delayedOptions.StyleByControlBug.Promise', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: typeAdapter('data<>', pipe(
        delay(1),
        obj(prop('options', typeAdapter('picklist.options<>', picklist.optionsByComma('Springfield,New York,Tel Aviv,London'))))
      )),
      style: picklist.labelList(),
      features: picklist.allowAsynchOptions()
    }),
    expectedResult: contains('Springfield','New York'),
    uiAction: waitForNextUpdate()
  })
})

component('picklistTest.radio', {
  impl: uiTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.radio()
    }),
    expectedResult: contains('Springfield','New York')
  })
})

// component('picklistTest.innerSelector', {
//   impl: uiTest(picklist({ options: picklist.optionsByComma('a') }), ctx => jb.ui.elemOfSelector('select>option',ctx))
// })

component('picklistTest.sortedOptionsWithMarks', {
  impl: dataTest({
    calculate: pipeline(
      picklist.sortedOptions(picklist.optionsByComma('a,b,c,d'), {
        marks: pipeline(
          'c:100,d:50,b:0,a:20',
          split(','),
          obj(prop('code', split(':', { part: 'first' })), prop('mark', split(':', { part: 'second' })))
        )
      }),
      '%text%',
      join()
    ),
    expectedResult: contains('c,d,a')
  })
})

component('picklistTest.optionsByComma.groups', {
  impl: uiTest({
    control: group(
      group({
        controls: picklist('city', '%$personWithAddress/address/city%', {
          options: picklist.optionsByComma('US.Springfield,US.New York,Israel.Tel Aviv,UK.London,mooncity'),
          style: picklist.groups()
        }),
        style: propertySheet.titlesLeft()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
  })
})

component('picklistTest.labelList', {
  impl: uiTest({
    control: group(
      picklist({
        databind: '%$personWithAddress/address/city%',
        options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
        style: picklist.labelList()
      }),
      text('%$personWithAddress/address/city%')
    ),
    expectedResult: contains('Springfield','New York')
  })
})