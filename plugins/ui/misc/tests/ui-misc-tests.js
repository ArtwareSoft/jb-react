using('ui-slider')

component('uiTest.editableNumber', {
  impl: uiTest({
    control: group({
      controls: [
        editableNumber('%$person/age%', 'age', { style: editableNumber.sliderNoText() }),
        editableNumber('%$person/age%', 'age', { style: editableNumber.slider() }),
        editableNumber('%$person/age%', 'age'),
        text('%$person/age%')
      ],
      layout: layout.vertical()
    }),
    expectedResult: contains('42','42','42','42')
  })
})

component('uiTest.markdown', {
  impl: uiTest({
    control: markdown(`| Day     | Meal    | Price |
| --------|---------|-------|
| Monday  | pasta   | $6    |
| Tuesday | chicken | $8    |    `),
    expectedResult: contains('table')
  })
})
