jb.component('people', { watchableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Marge Simpson" ,age: 38 , male: false, children: [{ name: 'Bart' }, { name: 'Lisa' }, { name: 'Maggie' } ]},
  { "name": "Bart Simpson"  ,age: 12 , male: true, children: []}
]
})

jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    controls: [
      label('hello world'),
      itemlist({
        items: '%$people%',
        controls: [
          text({title: 'name', text: '%name%', style: label.noWrappingTag()}),
          editableBoolean({
            databind: '%male%',
            style: editableBoolean.checkbox(),
            title: 'male',
            textForTrue: 'yes',
            textForFalse: 'no'
          }),
          button({
            title: 'toggle',
            action: toggleBooleanValue('%male%'),
            style: button.href()
          })
        ],
        style: table.withHeaders(),
        itemVariable: 'item',
        visualSizeLimit: 100,
        features: [css.width('300')]
      }),
      button({
        title: 'toogle',
        action: runActionOnItems('%$people%', toggleBooleanValue('%male%'))
      })
    ]
  })
})
