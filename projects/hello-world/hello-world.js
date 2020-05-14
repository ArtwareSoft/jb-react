jb.ns('helloWorld')

jb.component('dataResource.people', {
  watchableData: [
    {
      name: 'Homer asdas',
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

jb.component('dataResource.room', {
  passiveData: ''
})

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.flex({}),
    controls: [
      button({
        title: 'click me',
        action: openDialog({style: dialog.dialogOkCancel(), content: group({})})
      })
    ],
    features: css.color({})
  })
})



