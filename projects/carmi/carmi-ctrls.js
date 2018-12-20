
jb.component('carmi.model-editor', {
  type: 'control', 
  params: [{ id: 'path', defaultValue: 'team_leaders' }], 
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
        style :{$: 'layout.horizontal', spacing: 3 }, 
        controls: [
          {$: 'group', 
            style :{$: 'layout.vertical' }, 
            controls: [
              {$: 'group', 
                title: 'model', 
                controls: [
                  {$: 'group', 
                    title: 'input/output', 
                    style :{$: 'property-sheet.titles-above-float-left', spacing: 20, fieldWidth: 200 }, 
                    controls: [
                      {$: 'studio.data-browse', 
                        obj :{
                          $pipeline: [
                            '%inst%', 
                            {$: 'properties', obj: '%%' }, 
                            {$: 'filter', 
                              filter :{$: 'not-contains', text: '$', allText: '%id%' }
                            }, 
                            {$: 'filter', filter: "%id% != 'set'" }, 
                            '%val%'
                          ]
                        }, 
                        title: 'output', 
                        width: 200
                      }, 
                      {$: 'studio.data-browse', 
                        obj :{ $pipeline: ['%inst/$model%'] }, 
                        title: 'input', 
                        width: 200
                      }
                    ], 
                    features :{$: 'group.wait', for: ctx => ctx.run({$: jb.val(ctx.vars.circuit)}) }
                  }
                ], 
                features: [{$: 'watch-ref', ref: '%$jbEditor_selection%' }]
              }
            ], 
            features :{$: 'studio.watch-path', path: '%$circuit%', includeChildren: true }
          }, 
          {$: 'group', 
            title: 'with jbEditor selection', 
            style :{$: 'layout.flex' }, 
            controls: [{$: 'studio.jb-editor', path: '%$circuit%~impl' }], 
            features: [{$: 'var', name: 'jbEditor_selection', value: '%$circuit%', mutable: true }]
          }
        ], 
        features: [{$: 'watch-ref', ref: '%$circuit%' }]
      }
    ], 
    features: [
      {$: 'css', css: '{ height: 200px; padding: 50px }' }, 
      {$: 'var', name: 'circuit', value: '%$path%', mutable: true }
    ]
  }
})
  