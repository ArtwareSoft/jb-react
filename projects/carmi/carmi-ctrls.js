
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
                    style :{$: 'property-sheet.titles-left', fieldWidth: 200, spacing: '20', vSpacing: 20, hSpacing: 20, titleWidth: 100 }, 
                    controls: [
                      {$: 'group', 
                        title: '%vars[0]/id%', 
                        controls: [
                          {$: 'label', 
                            title: '%vars[0]/expStr%', 
                            style :{$: 'label.p' }
                          }
                        ], 
                        features :{$: 'group.dynamic-titles' }
                      }, 
                      {$: 'group', 
                        title: 'output', 
                        controls: [
                          {$: 'tree', 
                            nodeModel :{$: 'tree.json-read-only', 
                              object :{
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
                              rootPath: '%$title%'
                            }, 
                            style :{$: 'tree.no-head' }, 
                            features: [
                              {$: 'css.class', class: 'jb-control-tree' }, 
                              {$: 'tree.selection' }, 
                              {$: 'tree.keyboard-selection' }, 
                              {$: 'css.width', width: '%$width%', minMax: 'max' }
                            ]
                          }
                        ]
                      }, 
                      {$: 'group', 
                        title: 'input', 
                        controls: [
                          {$: 'tree', 
                            nodeModel :{$: 'tree.json-read-only', object: '%inst/$model%', rootPath: '%$title%' }, 
                            style :{$: 'tree.no-head' }, 
                            features: [
                              {$: 'css.class', class: 'jb-control-tree' }, 
                              {$: 'tree.selection' }, 
                              {$: 'tree.keyboard-selection' }, 
                              {$: 'css.width', width: '%$width%', minMax: 'max' }
                            ]
                          }
                        ]
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
  