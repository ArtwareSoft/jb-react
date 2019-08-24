jb.component('people', { mutableData: [
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]});


jb.component('hello-world.main', {
  type: 'control',
  impl: group({
    title: '',
    style: layout.horizontal(3),
    controls: [
      group({
        controls: [label('hello world%$second%')],
        features: variable({name: 'second', value: '22', mutable: true})
      })
    ],
    features: variable({name: 'adsa', value: 'asdasdas', mutable: true, globalId: 'mukki'})
  })
})


jb.component('hello-world.main2', {
  type: 'control',
  impl: group({
    controls: [
      group({
        style: layout.horizontal('66'),
        controls: [
          label('test'),
          editableText({title: 'text', databind: '%$text%', style: editableText.mdlInput()})
        ]
      }),
      table({
        items: pipeline('1,2,3', split({separator: ',', text: '%%'}), {$: 'object', text: '%%'}),
        fields: [
          field({
            title: 'name',
            data: pipeline('%text%', {$: 'object', huyt: '%%', blbl: '%%*2'}, '%huyt%')
          }),
          field.control({control: itemlist({style: itemlist.ulLi(), itemVariable: 'item'})})
        ]
      }),
      itemlist({
        items: '%$people%',
        controls: [label({title: '%name%', style: label.span()})],
        style: itemlist.ulLi(),
        itemVariable: 'item'
      })
    ],
    features: variable({name: 'text', value: 'hello world', mutable: 'true'})
  })
})
