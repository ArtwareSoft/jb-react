
  jb['component']('todomvc-tutorial.main', {
    type: 'control',
    impl :{$: 'group', controls: [ {$: 'button', title: 'my button'}] }
  })jb.component('todomvc-tutorial.main', { /* todomvcTutorial.main */ 
  type: 'control',
  impl: group({
    controls: []
  })
}) 



jb.component('todo', { /* todo */ 
  watchableData: [
    {task: 'eat', completed: false},
    {task: 'drink', completed: true}
  ]
})jb.component('todomvc-tutorial.main', { /* todomvcTutorial.main */ 
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: '%$todo%',
        controls: [
          group({
            style: layout.horizontal(3),
            controls: [
              editableBoolean({
                databind: '%completed%',
                style: editableBoolean.checkbox(),
                textForTrue: 'yes',
                textForFalse: 'no'
              }),
              editableText({databind: '%task%', style: editableText.mdlInput()})
            ]
          })
        ],
        style: itemlist.ulLi(),
        watchItems: false,
        itemVariable: 'item',
        features: null
      })
    ]
  })
}) 

jb.component('todo', { /* todo */ 
  watchableData: [
    {task: 'eat', completed: false},
    {task: 'drink', completed: true},
    {task: 'drive', completed: true}
  ]
}) 

