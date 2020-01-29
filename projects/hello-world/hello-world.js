jb.ns('helloWorld')
jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    layout: layout.vertical(),
    controls: [
      text({text: 'my tetyurytyuty', title: 'my title'}),
      button({
        title: 'CLICK ME',
        action: openDialog({style: dialog.dialogOkCancel(), content: group({}), title: 'hello'}),
        style: button.tableCellHref()
      })
    ]
  })
})

jb.component('data-resource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homer Simpson1',
      age: 42,
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: 38,
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: 12, male: false, children: []}
  ]
})


jb.component('data-resource.room', { /* dataResource.room */
  passiveData: ''
})
