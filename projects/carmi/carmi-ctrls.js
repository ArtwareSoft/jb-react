

jb.component('carmi.model-editor', {
  type: 'control', 
  params: [{ id: 'path', defaultValue: 'carmi.doubleNegated' }], 
  impl :{$: 'group', 
    title: 'main', 
    style :{$: 'group.div', align: 'flex-start' }, 
    controls: [
      {$: 'picklist', 
        databind: '%$circuit%', 
        options :{$: 'picklist.options', 
          options :{$: 'studio.profiles-of-PT', $pipeline: ['studio.profiles-of-PT'], PT: 'carmi.model' }
        }, 
        style :{$: 'picklist.native-md-look' }
      }, 
      {$: 'group', 
        title: 'watch circuit', 
        controls :{$: 'group', 
          title: 'with jbEditor selection', 
          style :{$: 'layout.flex' }, 
          controls: [
            {$: 'studio.jb-editor', path: '%$circuit%~impl' }, 
            {$: 'group', 
              controls: [
                {$: 'label', 
                  title: '%$jbEditor_selection%', 
                  style :{$: 'label.span' }
                }, 
                {$: 'editable-text', 
                  databind :{$: 'studio.profile-as-text', path: '%$jbEditor_selection%' }, 
                  style :{$: 'editable-text.textarea' }, 
                  features: [
                    {$: 'css.width', width: '300' }, 
                    {$: 'css.height', height: '200' }, 
                    {$: 'css.margin', left: '10' }
                  ]
                }
              ], 
              features: [{$: 'watch-ref', ref: '%$jbEditor_selection%' }]
            }
          ], 
          features: [{$: 'var', name: 'jbEditor_selection', value: '%$circuit%', mutable: true }]
        }, 
        features: [{$: 'watch-ref', ref: '%$circuit%' }]
      }
    ], 
    features: [
      {$: 'css', css: '{ height: 200px; padding: 50px }' }, 
      {$: 'var', name: 'circuit', value: 'carmi.doubleNegated', mutable: true }
    ]
  }
})
  