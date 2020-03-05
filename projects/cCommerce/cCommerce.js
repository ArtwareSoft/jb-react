
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
    features :{$: 'variable', 
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
      {$: 'd3g.chart-scatter', 
        style :{$: 'd3-scatter.plain' }, 
        pivots: [
          {$: 'd3g.pivot', title: 'size', value: '%size%' }, 
          {$: 'd3g.pivot', title: '$', value: '%price%' }, 
          {$: 'd3g.pivot', title: 'performance', value: '%performance%' }, 
          {$: 'd3g.pivot', title: 'make', value: '%make%' }, 
          {$: 'd3g.pivot', 
            title: 'hits', 
            value: '%hits%', 
            scale :{$: 'd3g.sqrt-scale' }
          }
        ], 
        title: 'phones', 
        frame :{$: 'd3g.frame', width: '1200', height: '480', top: 20, right: 20, bottom: 40, left: 80 }, 
        visualSizeLimit: '3000', 
        itemTitle: '%title% (%Announced%)', 
        items :{
          $pipeline: [
            '%$devices%', 
            {$: 'assign', 
              filter: "%make% == 'Apple'", 
              property: [
                {$: 'prop', 
                  title: 'CPUSpeed', 
                  val :{
                    $pipeline: ['%$clock%'], 
                    $vars: {
                      clock :{
                        $pipeline: [
                          '%CPU%', 
                          {$: 'match-regex', text: '%%', regex: '([0-9.]+) GHz' }, 
                          {$: 'last' }
                        ], 
                        $vars: { clock: '' }
                      }, 
                      mul :{
                        $pipeline: [
                          '%CPU%', 
                          {$: 'match-regex', text: '%%', regex: '([A-Za-z]+)-core' }, 
                          {$: 'last' }, 
                          {$: 'unique', id: '%%', items: '%%' }, 
                          {$: 'data.switch', 
                            cases: [
                              { condition: "%% == 'Dual'", value: '1.6' }, 
                              { condition: "%% == 'Quad'", value: '2' }, 
                              { condition: "%% == 'Hexa'", value: '3' }, 
                              { condition: "%% == 'Octa'", value: '4' }, 
                              { condition: "%% == 'Deca'", value: '5' }
                            ]
                          }
                        ], 
                        $vars: { clock: '' }
                      }, 
                      cpuFactor :{
                        $pipeline: [
                          '%CPU%', 
                          {$: 'match-regex', text: '%%', regex: 'GHz\\s+([a-zA-Z0-9-]+)' }, 
                          {$: 'last' }
                        ], 
                        $vars: { clock: '' }
                      }
                    }
                  }, 
                  type: 'string'
                }
              ]
            }
          ]
        }
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
          {$: 'assign', 
            property: [
              {$: 'prop', 
                title: 'make', 
                val :{$: 'split', separator: ' ', text: '%title%', part: 'first' }, 
                type: 'string'
              }, 
              {$: 'prop', 
                title: 'year', 
                val :{$: 'match-regex', text: '%Announced%', regex: '20[0-9][0-9]' }, 
                type: 'number'
              }, 
              {$: 'prop', 
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
              {$: 'prop', 
                title: 'size', 
                val :{
                  $pipeline: [
                    {$: 'match-regex', text: '%Size%', regex: '([0-9.]+) inch' }, 
                    {$: 'last' }
                  ]
                }, 
                type: 'number'
              }, 
              {$: 'prop', 
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
  }
})

jb.component('cCommerce.histogram', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'histogram', 
    controls: [
      {$: 'label', 
        title: '%$item/title%', 
        style :{$: 'text.htmlTag', htmlTag: 'h3' }
      }, 
      {$: 'd3g.histogram', 
        frame :{$: 'd3g.frame', width: '300', height: '100', top: 30, right: 50, bottom: 40, left: 60 }, 
        items: '%$global.phones%', 
        pivot :{$: 'd3g.pivot', title: 'hits', value: '%size%' }, 
        $disabled: true
      }, 
      {$: 'group', 
        title: 'chart-props', 
        style :{$: 'custom-style', 
          template: (cmp,state,h) => h('div',{ class: 'clearfix'}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property clearfix'},[
          h('div',{},[
             h(ctrl), 
                        h('label',{ class: 'property-title'},ctrl.title),
    
          ])
      ]))), 
          css: `>.property { 
          float: left;
          width: %$fieldWidth%px;
          margin-right: %$spacing%px;
        }
      .clearfix:after {
        content: "";
        clear: both;
      }
>.property>div { display: grid }

      >.property:last-child { margin-right:0 }
      >.property>div>label {
        margin-bottom: 3px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        font-size:14px;
        padding-left: 100px;
      }`, 
          features :{$: 'group.init-group' }
        }, 
        controls: [
          {$: 'd3g.histogram', 
            frame :{$: 'd3g.frame', width: '300', height: '100', top: 30, right: 50, bottom: 40, left: 60 }, 
            items: '%$global.phones%', 
            pivot :{$: 'd3g.pivot', title: 'perf', value: '%performance%' }, 
            title: 'performance %$item/performance%', 
            features :{$: 'd3g.item-indicator', item: '%$item%' }
          }, 
          {$: 'd3g.histogram', 
            frame :{$: 'd3g.frame', width: '300', height: '100', top: 30, right: 50, bottom: 40, left: 60 }, 
            items: '%$global.phones%', 
            pivot :{$: 'd3g.pivot', title: 'hits', value: '%hits%' }, 
            features :{$: 'd3g.item-indicator', item: '%$item%' }, 
            title: 'hits: %$item/hits%'
          }, 
          {$: 'd3g.histogram', 
            frame :{$: 'd3g.frame', width: '300', height: '100', top: 30, right: 50, bottom: 40, left: 60 }, 
            items: '%$global.phones%', 
            pivot :{$: 'd3g.pivot', title: 'size', value: '%size%' }, 
            features :{$: 'd3g.item-indicator', item: '%$item%' }, 
            title: 'size: %$item/size%'
          }, 
          {$: 'image', 
            url: '%$item/image%', 
            units: 'px', 
            style :{$: 'image.default' }
          }
        ]
      }, 
      {$: 'table', 
        title: '', 
        items :{$: 'keys', obj: '%$item%' }, 
        fields: [
          {$: 'field', title: 'title', data: '%%' }, 
          {$: 'field', title: 'value', data: ctx => ctx.vars.item[ctx.data] }
        ], 
        style :{$: 'table.with-headers' }, 
        visualSizeLimit: 100
      }
    ], 
    features: [
      {$: 'css.padding', left: '7' }, 
      {$: 'variable', name: 'item', value: '%$global/phones[400]%' }
    ]
  }
})