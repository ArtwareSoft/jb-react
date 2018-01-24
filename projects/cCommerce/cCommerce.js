
jb.component('cCommerce.main', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'button', title: 'my button' }, 
      {$: 'editable-text', 
        databind :{ $pipeline: [{$: 'pretty-print', profile: '%$Product%', colWidth: 140 }] }, 
        style :{$: 'editable-text.codemirror', enableFullScreen: true, debounceTime: 300 }
      }
    ], 
    features :{$: 'var', 
      name: 'Product', 
      value :{
        $pipeline: [
          '%$gsm-arena-galaxy-a8%', 
          {$: 'extract-text', text: '%%', startMarkers: 'id=\"specs-list\"', endMarker: '<p class=\"note\">' }, 
          {$: 'dynamic-object', 
            items :{$: 'extract-text', startMarkers: '<tr', repeating: 'true' }, 
            propertyName :{$: 'extract-text', 
              text: '%%', 
              startMarkers :{ $list: ['<a href=\"', '>'] }, 
              endMarker: '<'
            }, 
            value :{$: 'extract-text', 
              text: '%%', 
              startMarkers :{ $list: ['data-spec=\"', '>'] }, 
              endMarker: '<'
            }
          }
        ]
      }
    }
  }
})

jb.component('cCommerce.scatter', {
  type: 'control', 
  impl :{$: 'group', 
          controls: [
            {$: 'd3.chart-scatter', 
              style :{$: 'd3-scatter.plain' }, 
              pivots: [
                {$: 'd3.pivot', title: 'performance', value: '%performance%' }, 
                {$: 'd3.pivot', title: 'size', value: '%size%' }, 
                {$: 'd3.pivot', 
                  title: 'hits', 
                  value: '%hits%', 
                  scale :{$: 'd3.sqrt-scale' }
                }, 
                {$: 'd3.pivot', title: 'make', value: '%make%' }, 
                {$: 'd3.pivot', title: '$', value: '%price%' }
              ], 
              title: 'phones', 
              frame :{$: 'd3.frame', width: '1200', height: '480', top: 20, right: 20, bottom: 40, left: 80 }, 
              visualSizeLimit: '3000', 
              itemTitle: '%title% (%Announced%)', 
              items: '%$devices%'
            }
          ], 
          features :{$: 'global-var', 
            name: 'devices', 
            value :{
              $pipeline: [
                '%$global/phones%', 
                {$: 'slice', $disabled: true, end: '1000' }, 
                {$: 'sample', 
                  filter :{$: 'starts-with', startsWith: 'Sam', text: '%title%' }, 
                  $disabled: true, 
                  size: 300, 
                  items: '%%'
                }, 
                {$: 'calculate-properties', 
                  property: [
                    {$: 'calculated-property', 
                      title: 'make', 
                      val :{$: 'split', separator: ' ', text: '%title%', part: 'first' }, 
                      type: 'string'
                    }, 
                    {$: 'calculated-property', 
                      title: 'year', 
                      val :{$: 'match-regex', text: '%Announced%', regex: '20[0-9][0-9]' }, 
                      type: 'number'
                    }, 
                    {$: 'calculated-property', 
                      title: 'price', 
                      val :{
                        $pipeline: [
                          {$: 'match-regex', text: '%Price%', regex: '([0-9.]+) EUR' }, 
                          {$: 'last' }, 
                          ctx => ctx.data * 1.2
                        ]
                      }, 
                      type: 'number'
                    }, 
                    {$: 'calculated-property', 
                      title: 'size', 
                      val :{
                        $pipeline: [
                          {$: 'match-regex', text: '%Size%', regex: '([0-9.]+) inch' }, 
                          {$: 'last' }
                        ]
                      }, 
                      type: 'number'
                    }, 
                    {$: 'calculated-property', 
                      title: 'performance', 
                      val :{
                        $pipeline: [
                          {$: 'match-regex', text: '%Performance%', regex: 'Basemark OS II 2.0:\\s*([0-9.]+)' }, 
                          {$: 'last' }
                        ]
                      }, 
                      type: 'number'
                    }
                  ], 
                  items: '%%'
                }, 
                {$: 'filter', 
                  filter :{ $and: [{$: 'between', from: '4', to: '7', val: '%size%' }, ctx => (ctx.data.year || 0) >= 2016] }
                }
              ]
            }
          }
        }, 
})