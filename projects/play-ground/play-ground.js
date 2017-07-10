jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('play-ground.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'label', 
        title :{$: 'is-of-type', type: 'string2', obj: '123' }, 
        style :{$: 'label.p' }
      }
    ], 
    features: [{$: 'var', name: 'male', value: true, mutable: true }]
  }, 
  controls: [
    {$: 'label', 
      title: 'my label', 
      style :{$: 'label.span' }
    }
  ]
})



jb.component('play-ground.t', {
  type: 'control', 
  impl :{$: 'group', 
    title: 't', 
    controls: [
      {$: 'button', 
        title: 'click me', 
        style :{$: 'button.mdl-icon', icon: 'b' }
      }
    ]
  }
})