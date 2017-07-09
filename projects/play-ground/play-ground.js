jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('play-ground.main', {
  type: 'control', 
  impl :{$: 'group', 
      controls: [
        {$: 'editable-boolean', databind: '%$male%'},
        {$: 'control.first-succeeding', 
          controls: [
            {$: 'control-with-condition', 
              condition: '%$male%', 
              control :{$: 'label', title: 'male' }
            }, 
            {$: 'control-with-condition', 
              condition: {$not: '%$male%'}, 
              control :{$: 'label', title: 'female' }
            }, 
          ],
          features: {$: 'watch-ref', ref: '%$male%'}
        },
      ],
      features: [
        {$: 'var', name: 'male', value: true , mutable: true }
      ]
    }
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