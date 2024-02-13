using('tgp')

component('logsView.main', {
  params: [
    {id: 'logs'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      controls: [
        logsView.toolbar('%$logs%'),
        table({
          items: '%$logs%',
          controls: [
            text('%index%'),
            logsView.uiComp(),
            logsView.callbagMessage(),
            logsView.testResult(),
            text('%logNames%', {
              features: feature.byCondition(inGroup(list('exception','error'), '%logNames%'), css.color('var(--jb-error-fg)'))
            }),
            lowFootprintObj('%err%', 'err'),
            objExpandedAsText('%stack%', 'stack'),
            controlWithCondition('%m%', text('%m/$%: %m/t%, %m/cbId%')),
            lowFootprintObj('%delta%', 'delta'),
            lowFootprintObj('%vdom%', 'vdom'),
            lowFootprintObj('%ref%', 'ref'),
            lowFootprintObj('%value%', 'value'),
            lowFootprintObj('%val%', 'val'),
            lowFootprintObj('%focusChanged%', 'focusChanged'),
            sourceCtxView('%srcCtx%'),
            sourceCtxView('%cmp/ctx%'),
            sourceCtxView('%ctx%')
          ],
          style: table.plain(true),
          visualSizeLimit: 80,
          features: [
            watchable('cmpExpanded', obj()),
            watchable('payloadExpanded', obj()),
            watchable('testResultExpanded', obj()),
            itemlist.keyboardSelection()
          ],
          lineFeatures: [
            watchRef('%$cmpExpanded/{%$index%}%', { allowSelfRefresh: true }),
            watchRef('%$payloadExpanded/{%$index%}%', { allowSelfRefresh: true }),
            watchRef('%$testResultExpanded/{%$index%}%', { allowSelfRefresh: true }),
            table.enableExpandToEndOfRow()
          ]
        })
      ],
      features: id('event-tracker')
    }),
    features: [
      variable('$disableLog', true),
      watchable('logsView', obj())
    ]
  })
})

component('logsView.toolbar', {
  params: [
    {id: 'spy'}
  ],
  type: 'control',
  impl: group({
    controls: [
      editableText('query', '%$logsView/logsViewQuery%', {
        style: editableText.input(),
        features: [
          htmlAttribute('placeholder', 'query'),
          feature.onEnter(refreshControlById('event-tracker')),
          css.class('toolbar-input'),
          css.height('10'),
          css.margin('4'),
          css.width('300')
        ]
      })
    ],
    layout: layout.horizontal('2'),
    features: chromeDebugger.colors()
  })
})

component('logsView.uiComp', {
  type: 'control',
  impl: group(
    controlWithCondition(or('%cmp%','%elem%','%parentElem%'), group({
      controls: [
        controlWithCondition('%cmp/ctx/profile/$%', group({
          controls: [
            editableBoolean('%$cmpExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
            text('%cmp/ctx/profile/$% %cmp/cmpId%;%cmp/ver%')
          ],
          layout: layout.flex('row', 'start', { alignItems: 'center' })
        })),
        controlWithCondition('%cmp/pt%', text('%cmp/pt% %cmp/cmpId%;%cmp/ver%')),
        text('')
      ],
      features: group.firstSucceeding()
    }))
  )
})

component('logsView.callbagMessage', {
  type: 'control',
  impl: controls(
    controlWithCondition(and('%m/d%','%m/t%==1'), group({
      controls: [
        editableBoolean('%$payloadExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
        text('%$contentType% %$direction% %m/cbId% (%$payload/length%) %m/$%: %m/t%')
      ],
      layout: layout.flex('row', 'start', { alignItems: 'center' }),
      features: [
        variable('direction', If(contains('received', { allText: '%logNames%' }), '🡸', '🡺')),
        variable('contentType', If('%m/d/data/css%', 'css', If('%m/d/data/delta%', 'delta', '%m/d/data/$%'))),
        variable('payload', prettyPrint('%m/d%'))
      ]
    })),
    controlWithCondition('%$payloadExpanded/{%$index%}%', group({
      controls: text(prettyPrint('%m/d%'), {
        style: text.codemirror({ height: '200' }),
        features: [
          codemirror.fold(),
          css('min-width: 1200px; font-size: 130%')
        ]
      }),
      features: feature.expandToEndOfRow('%$payloadExpanded/{%$index%}%')
    }))
  )
})

component('logsView.testResult', {
  type: 'control',
  impl: controls(
    controlWithCondition('%logNames%==check test result', group(
      editableBoolean('%$testResultExpanded/{%$index%}%', chromeDebugger.toggleStyle()),
      text({
        vars: [
          Var('color', If('%success%', '--jb-success-fg', '--jb-error-fg'))
        ],
        text: If('%success%', '✓ check test result', '⚠ check test result'),
        features: css.color('var(%$color%)')
      })
    )),
    controlWithCondition('%$testResultExpanded/{%$index%}%', group({
      controls: [
        controlWithCondition({
          condition: '%expectedResultCtx/data%',
          control: text(prettyPrint('%expectedResultCtx.profile.expectedResult%', true))
        }),
        controlWithCondition('%expectedResultCtx/data%', text('%expectedResultCtx/data%')),
        text('%html%', {
          style: text.codemirror({ height: '200', formatText: true, mode: 'htmlmixed' }),
          features: [
            codemirror.fold(),
            css('min-width: 1200px; font-size: 130%')
          ]
        })
      ],
      layout: layout.horizontal(20),
      features: feature.expandToEndOfRow('%$testResultExpanded/{%$index%}%')
    }))
  )
})

component('objExpandedAsText', {
  params: [
    {id: 'obj', mandatory: true},
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: controlWithCondition('%$obj%', group({
    controls: [
      controlWithCondition('%$asText/length% < 20', text('%$asText%')),
      controlWithCondition('%$asText/length% > 19', group(text('%$asText%', { style: text.codemirror({ height: '200' }), features: codemirror.fold() }), {
        style: group.sectionExpandCollapse(text('%$title%'))
      }))
    ],
    features: variable('asText', prettyPrint('%$obj%'))
  }))
})

component('lowFootprintObj', {
  type: 'control',
  params: [
    {id: 'obj', mandatory: true},
    {id: 'title', mandatory: true},
    {id: 'length', as: 'number', defaultValue: 20}
  ],
  impl: controlWithCondition('%$obj%', group({
    controls: [
      controlWithCondition('%$obj/cmpCtx%', slicedString('%$obj/profile/$%: %$obj/path%')),
      controlWithCondition({
        condition: ({},{},{obj}) => jb.db.isRef(obj),
        control: slicedString(({},{},{obj}) => obj.handler.pathOfRef(obj).join('/'))
      }),
      controlWithCondition('%$obj/opEvent/newVal%', slicedString('%$obj/opEvent/newVal%')),
      controlWithCondition(isOfType('boolean', '%$obj%'), slicedString('%$title%')),
      controlWithCondition(isOfType('string,number', '%$obj%'), slicedString('%$title%: %$obj%'))
    ],
    layout: layout.horizontal(4)
  }))
})

component('slicedString', {
  params: [
    {id: 'str', mandatory: true},
    {id: 'length', as: 'number', defaultValue: 30}
  ],
  impl: controlWithCondition({
    condition: isOfType('string', '%$str%'),
    control: text(({},{},{length,str}) => str.replace(/\n/g,'').slice(0,length))
  })
})

component('logsView.itemsWithTimeBreak', {
  params: [
    {id: 'logs'},
    {id: 'query', as: 'string'}
  ],
  impl: (ctx,logs, query) => {
    const itemsWithTimeBreak = logs.reduce((acc,item,i) => i && item.time - items[i-1].time > 100 ? 
      [...acc,{index: '---', logNames: `----- ${item.time - items[i-1].time} mSec gap ------`},item] : 
      [...acc,item] ,[])
    return itemsWithTimeBreak
  }
})

component('sourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'}
  ],
  impl: controlWithCondition('%$srcCtx/cmpCtx%', group({
    controls: [
      controlWithCondition('%$stackItems/length% == 0', singleSourceCtxView('%$srcCtx%')),
      controlWithCondition('%$stackItems/length% > 0', group(itemlist({ items: '%$stackItems%', controls: singleSourceCtxView('%%') }), {
        style: group.sectionExpandCollapse(singleSourceCtxView('%$srcCtx%'))
      }))
    ],
    features: variable('stackItems', stackItems('%$srcCtx%'))
  }))
})

component('singleSourceCtxView', {
  type: 'control',
  params: [
    {id: 'srcCtx'}
  ],
  impl: button({
    title: ({},{},{srcCtx}) => {
      if (!srcCtx) return ''
      const path = srcCtx.path || ''
      const profile = path && jb.tgp.valOfPath(path)
      const pt = profile && profile.$ || ''
      const ret = `${path.split('~')[0]}:${pt}`
      return ret.replace(/feature./g,'').replace(/front.nd./g,'').replace(/.action/g,'')
    },
    action: tgpTextEditor.gotoSource('%$srcCtx/path%', true),
    style: button.hrefText(),
    features: feature.hoverTitle('%$srcCtx/path%')
  })
})

component('stackItems', {
  params: [
    {id: 'srcCtx'}
  ],
  impl: (ctx,srcCtx) => {
          const stack=[]
          for(let innerCtx= srcCtx; innerCtx; innerCtx = innerCtx.cmpCtx)
            stack.push(innerCtx)
          return stack.slice(2)
      }
})

component('chromeDebugger.colors', {
  type: 'feature',
  impl: features(
    css.color('var(--jb-menu-fg)', 'var(--jb-menubar-inactive-bg)'),
    css('border: 0px;'),
    css('~ option { background: white}')
  )
})

component('logsView.compInspector', {
  params: [
    {id: 'cmp'}
  ],
  type: 'control',
  impl: group(
    group({
      controls: [
        text('%$cmp/cmpId%;%$cmp/ver% -- %$cmp/ctx/path%', '%$cmp/ctx/profile/$%'),
        table('state', {
          items: unique({ items: list(keys('%$cmp/state%')) }),
          controls: [
            text('%%', ''),
            text('%$cmp/state/{%%}%', 'back end')
          ]
        }),
        text('source', tgp.profileText('%$cmp/ctx/path%'), {
          style: editableText.codemirror({ height: '100' }),
          features: codemirror.fold()
        }),
        table('methods', {
          items: '%$cmp/method%',
          controls: [
            text('%id%', 'method'),
            sourceCtxView('%ctx%')
          ],
          style: table.plain(true)
        }),
        tableTree('rendering props', tree.jsonReadOnly('%$cmp/renderProps%'), {
          leafFields: text('%val%', 'value'),
          chapterHeadline: text(tree.lastPathElement('%path%'))
        })
      ],
      style: chromeDebugger.sectionsExpandCollapse()
    })
  )
})

component('logsView.compInspector2', {
  params: [
    {id: 'cmp'}
  ],
  type: 'control',
  impl: group(group(text('')))
})

component('chromeDebugger.icon', {
  type: 'button.style',
  params: [
    {id: 'position', as: 'string', defaultValue: '0px 144px'}
  ],
  impl: customStyle({
    template: (cmp,{title},h) => h('div',{onclick: true, title}),
    css: `{ -webkit-mask-image: url(http://localhost:8082/hosts/chrome-debugger/largeIcons.svg); -webkit-mask-position: %$position%; 
      cursor: pointer; min-width: 24px; max-width: 24px;  height: 24px; background-color: #333; opacity: 0.7 }
      ~:hover { opacity: 1 }
      ~:active { opacity: 0.5 }`,
    features: button.initAction()
  })
})

component('chromeDebugger.sectionsExpandCollapse', {
  type: 'group.style',
  impl: group.sectionsExpandCollapse(true, text.span(), {
    toggleStyle: editableBoolean.expandCollapseWithUnicodeChars(),
    titleGroupStyle: styleWithFeatures(group.div(), {
      features: features(
        css.class('expandable-view-title'),
        css('~ i { margin-top: 5px }'),
        css('text-transform: capitalize')
      )
    }),
    innerGroupStyle: styleWithFeatures(group.div(), { features: features(css.margin({ bottom: 5 })) })
  })
})

component('chromeDebugger.toggleStyle', {
  type: 'editable-boolean.style',
  impl: editableBoolean.expandCollapseWithUnicodeChars()
})
