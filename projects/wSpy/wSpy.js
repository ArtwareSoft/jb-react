
jb.component('wSpy.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'button', title: 'my button' }, 
      {$: 'group', 
        style :{$: 'layout.vertical' }
      }, 
      {$: 'table', 
        items: '%$spy-sample1%', 
        fields: [
          {$: 'field', title: 'log', data: '%[1]%' }, 
          {$: 'field', title: 'description', data: '%[2]%' }
        ], 
        style :{$: 'table.with-headers' }, 
        visualSizeLimit: 100
      }
    ]
  }
})